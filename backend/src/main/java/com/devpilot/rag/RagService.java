package com.devpilot.rag;

import com.devpilot.analysis.AnalysisJob;
import com.devpilot.analysis.AnalysisJobRepository;
import com.devpilot.rag.chunking.CompositeCodeChunker;
import com.devpilot.rag.dto.RagQueryResponse;
import com.devpilot.rag.dto.RagSourceCitation;
import com.devpilot.rag.embedding.EmbeddingService;
import com.devpilot.rag.llm.LlmService;
import com.devpilot.repository.RepositoryFile;
import com.devpilot.repository.RepositoryFileRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RagService {

    private final CodeChunkRepository codeChunkRepository;
    private final RepositoryFileRepository repositoryFileRepository;
    private final AnalysisJobRepository analysisJobRepository;
    private final CompositeCodeChunker compositeCodeChunker;
    private final EmbeddingService embeddingService;
    private final LlmService llmService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public RagService(CodeChunkRepository codeChunkRepository,
                      RepositoryFileRepository repositoryFileRepository,
                      AnalysisJobRepository analysisJobRepository,
                      CompositeCodeChunker compositeCodeChunker,
                      EmbeddingService embeddingService,
                      LlmService llmService) {
        this.codeChunkRepository = codeChunkRepository;
        this.repositoryFileRepository = repositoryFileRepository;
        this.analysisJobRepository = analysisJobRepository;
        this.compositeCodeChunker = compositeCodeChunker;
        this.embeddingService = embeddingService;
        this.llmService = llmService;
    }

    @Async
    @Transactional
    public void indexRepositoryAsync(Long repositoryId) {
        indexRepository(repositoryId);
    }

    @Transactional
    public void indexRepository(Long repositoryId) {
        AnalysisJob job = analysisJobRepository.findByRepositoryIdAndType(repositoryId, "RAG_INDEXING")
                .orElse(new AnalysisJob());
        job.setRepositoryId(repositoryId);
        job.setType("RAG_INDEXING");
        job.setStatus("PROCESSING");
        job.setStartedAt(LocalDateTime.now());
        analysisJobRepository.save(job);

        try {
            codeChunkRepository.deleteByRepositoryId(repositoryId);

            List<RepositoryFile> files = repositoryFileRepository.findByRepositoryId(repositoryId);
            List<CodeChunk> allChunks = new ArrayList<>();

            for (RepositoryFile file : files) {
                if (file.getContent() != null && !file.getContent().trim().isEmpty()) {
                    List<CodeChunk> chunks = compositeCodeChunker.chunk(file);
                    allChunks.addAll(chunks);
                }
            }

            if (!allChunks.isEmpty()) {
                // Batch embed chunks
                List<String> contents = allChunks.stream().map(CodeChunk::getContent).collect(Collectors.toList());
                List<List<Double>> embeddings = embeddingService.embedBatch(contents);

                for (int i = 0; i < allChunks.size(); i++) {
                    CodeChunk chunk = allChunks.get(i);
                    if (i < embeddings.size()) {
                        chunk.setEmbeddingJson(objectMapper.writeValueAsString(embeddings.get(i)));
                    }
                }

                codeChunkRepository.saveAll(allChunks);
            }

            job.setStatus("COMPLETED");
            job.setCompletedAt(LocalDateTime.now());
        } catch (Exception e) {
            e.printStackTrace();
            job.setStatus("FAILED");
            job.setErrorMessage(e.getMessage());
            job.setCompletedAt(LocalDateTime.now());
        } finally {
            analysisJobRepository.save(job);
        }
    }

    public String getIndexStatus(Long repositoryId) {
        Optional<AnalysisJob> job = analysisJobRepository.findByRepositoryIdAndType(repositoryId, "RAG_INDEXING");
        return job.map(AnalysisJob::getStatus).orElse("NONE");
    }

    public RagQueryResponse queryRepository(Long repositoryId, String question) {
        List<CodeChunk> chunks = codeChunkRepository.findByRepositoryId(repositoryId);
        if (chunks.isEmpty()) {
            // Synchronously index if not yet indexed
            indexRepository(repositoryId);
            chunks = codeChunkRepository.findByRepositoryId(repositoryId);
        }

        if (chunks.isEmpty()) {
            return new RagQueryResponse(
                    "No repository files were found to analyze for this project.",
                    Collections.emptyList()
            );
        }

        List<Double> queryEmbedding = embeddingService.embed(question);

        // Score chunks by Cosine Similarity
        List<ScoredChunk> scoredChunks = new ArrayList<>();
        for (CodeChunk chunk : chunks) {
            if (chunk.getEmbeddingJson() != null && !chunk.getEmbeddingJson().isEmpty()) {
                try {
                    List<Double> chunkVec = objectMapper.readValue(chunk.getEmbeddingJson(), new TypeReference<List<Double>>() {});
                    double score = computeCosineSimilarity(queryEmbedding, chunkVec);
                    scoredChunks.add(new ScoredChunk(chunk, score));
                } catch (Exception e) {
                    // Fallback keyword score
                    double keywordScore = computeKeywordOverlap(question, chunk.getContent());
                    scoredChunks.add(new ScoredChunk(chunk, keywordScore));
                }
            } else {
                double keywordScore = computeKeywordOverlap(question, chunk.getContent());
                scoredChunks.add(new ScoredChunk(chunk, keywordScore));
            }
        }

        // Sort descending by score
        scoredChunks.sort((a, b) -> Double.compare(b.score, a.score));

        // Take top 5 relevant chunks
        List<ScoredChunk> topChunks = scoredChunks.stream()
                .limit(5)
                .collect(Collectors.toList());

        // Build prompt context
        StringBuilder contextBuilder = new StringBuilder();
        List<RagSourceCitation> citations = new ArrayList<>();

        for (int i = 0; i < topChunks.size(); i++) {
            ScoredChunk sc = topChunks.get(i);
            CodeChunk c = sc.chunk;

            contextBuilder.append(String.format("[Source %d] File: %s (Lines: %d-%d), Symbol: %s\n```%s\n%s\n```\n\n",
                    i + 1,
                    c.getPath(),
                    c.getStartLine() != null ? c.getStartLine() : 1,
                    c.getEndLine() != null ? c.getEndLine() : 1,
                    c.getSymbol() != null ? c.getSymbol() : c.getPath(),
                    c.getLanguage() != null ? c.getLanguage().toLowerCase() : "",
                    c.getContent()
            ));

            citations.add(new RagSourceCitation(
                    c.getPath(),
                    c.getStartLine(),
                    c.getEndLine(),
                    c.getSymbol(),
                    c.getMethod(),
                    c.getLanguage(),
                    c.getContent(),
                    sc.score
            ));
        }

        String systemPrompt = "You are DevPilot, an AI Engineering Co-Pilot. " +
                "Your objective is to answer developer questions accurately and strictly grounded in the provided codebase context. " +
                "Always cite relevant file names, line numbers, and class/method names in your response.";

        String userPrompt = String.format("Developer Question: %s\n\nCONTEXT FROM REPOSITORY:\n%s\n\nProvide a clear, direct, and developer-friendly answer explaining how the codebase implements this.",
                question,
                contextBuilder.toString()
        );

        String answer = llmService.generateResponse(systemPrompt, userPrompt);

        return new RagQueryResponse(answer, citations);
    }

    private double computeCosineSimilarity(List<Double> vecA, List<Double> vecB) {
        if (vecA == null || vecB == null || vecA.isEmpty() || vecB.isEmpty() || vecA.size() != vecB.size()) {
            return 0.0;
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < vecA.size(); i++) {
            double a = vecA.get(i);
            double b = vecB.get(i);
            dotProduct += a * b;
            normA += a * a;
            normB += b * b;
        }

        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private double computeKeywordOverlap(String query, String content) {
        if (query == null || content == null) return 0.0;
        String[] qTokens = query.toLowerCase().split("[^a-zA-Z0-9]+");
        String cleanContent = content.toLowerCase();
        int matches = 0;
        for (String token : qTokens) {
            if (!token.isEmpty() && cleanContent.contains(token)) {
                matches++;
            }
        }
        return (double) matches / Math.max(1, qTokens.length);
    }

    private static class ScoredChunk {
        final CodeChunk chunk;
        final double score;

        ScoredChunk(CodeChunk chunk, double score) {
            this.chunk = chunk;
            this.score = score;
        }
    }
}
