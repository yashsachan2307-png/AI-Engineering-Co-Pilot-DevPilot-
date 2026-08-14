package com.devpilot.agent.tools;

import com.devpilot.rag.CodeChunk;
import com.devpilot.rag.CodeChunkRepository;
import com.devpilot.rag.embedding.EmbeddingService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class SearchCodeTool implements AgentTool {

    private final CodeChunkRepository codeChunkRepository;
    private final EmbeddingService embeddingService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SearchCodeTool(CodeChunkRepository codeChunkRepository, EmbeddingService embeddingService) {
        this.codeChunkRepository = codeChunkRepository;
        this.embeddingService = embeddingService;
    }

    @Override
    public String getName() {
        return "searchCode";
    }

    @Override
    public String getDescription() {
        return "Search the repository for semantic matches to a given query or keyword.";
    }

    @Override
    public String getInputSchema() {
        return "{\"type\":\"object\",\"properties\":{\"query\":{\"type\":\"string\",\"description\":\"The search query\"}},\"required\":[\"query\"]}";
    }

    @Override
    public String execute(Map<String, Object> input, Long repositoryId) {
        String query = (String) input.get("query");
        if (query == null || query.trim().isEmpty()) {
            return "Error: query is required.";
        }

        List<CodeChunk> chunks = codeChunkRepository.findByRepositoryId(repositoryId);
        if (chunks.isEmpty()) {
            return "No repository files found to search. Repository might not be indexed.";
        }

        List<Double> queryEmbedding = embeddingService.embed(query);
        List<ScoredChunk> scoredChunks = new ArrayList<>();

        for (CodeChunk chunk : chunks) {
            double score = 0.0;
            if (chunk.getEmbeddingJson() != null && !chunk.getEmbeddingJson().isEmpty()) {
                try {
                    List<Double> chunkVec = objectMapper.readValue(chunk.getEmbeddingJson(), new TypeReference<List<Double>>() {});
                    score = computeCosineSimilarity(queryEmbedding, chunkVec);
                } catch (Exception e) {
                    score = computeKeywordOverlap(query, chunk.getContent());
                }
            } else {
                score = computeKeywordOverlap(query, chunk.getContent());
            }
            scoredChunks.add(new ScoredChunk(chunk, score));
        }

        scoredChunks.sort((a, b) -> Double.compare(b.score, a.score));

        List<ScoredChunk> topChunks = scoredChunks.stream()
                .limit(5)
                .collect(Collectors.toList());

        StringBuilder result = new StringBuilder();
        for (ScoredChunk sc : topChunks) {
            CodeChunk c = sc.chunk;
            result.append(String.format("File: %s (Lines: %d-%d), Symbol: %s\n```%s\n%s\n```\n\n",
                    c.getPath(),
                    c.getStartLine() != null ? c.getStartLine() : 1,
                    c.getEndLine() != null ? c.getEndLine() : 1,
                    c.getSymbol() != null ? c.getSymbol() : c.getPath(),
                    c.getLanguage() != null ? c.getLanguage().toLowerCase() : "",
                    c.getContent()
            ));
        }

        return result.length() > 0 ? result.toString() : "No results found.";
    }

    private double computeCosineSimilarity(List<Double> vecA, List<Double> vecB) {
        if (vecA == null || vecB == null || vecA.isEmpty() || vecB.isEmpty() || vecA.size() != vecB.size()) return 0.0;
        double dotProduct = 0.0, normA = 0.0, normB = 0.0;
        for (int i = 0; i < vecA.size(); i++) {
            double a = vecA.get(i), b = vecB.get(i);
            dotProduct += a * b;
            normA += a * a;
            normB += b * b;
        }
        return (normA == 0.0 || normB == 0.0) ? 0.0 : dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private double computeKeywordOverlap(String query, String content) {
        if (query == null || content == null) return 0.0;
        String[] qTokens = query.toLowerCase().split("[^a-zA-Z0-9]+");
        String cleanContent = content.toLowerCase();
        int matches = 0;
        for (String token : qTokens) {
            if (!token.isEmpty() && cleanContent.contains(token)) matches++;
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
