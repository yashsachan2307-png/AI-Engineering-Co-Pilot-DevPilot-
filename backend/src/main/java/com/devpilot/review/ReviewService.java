package com.devpilot.review;

import com.devpilot.analysis.StaticAnalysisFinding;
import com.devpilot.analysis.StaticCodeAnalyzer;
import com.devpilot.rag.RagService;
import com.devpilot.rag.dto.RagQueryResponse;
import com.devpilot.rag.llm.LlmService;
import com.devpilot.repository.RepositoryFile;
import com.devpilot.review.domain.CodeReview;
import com.devpilot.review.domain.ReviewFinding;
import com.devpilot.review.dto.ReviewRequest;
import com.devpilot.review.dto.ReviewSummary;
import com.devpilot.review.repository.CodeReviewRepository;
import com.devpilot.review.repository.ReviewFindingRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ReviewService {

    private final CodeReviewRepository reviewRepository;
    private final ReviewFindingRepository findingRepository;
    private final List<StaticCodeAnalyzer> analyzers;
    private final RagService ragService;
    private final LlmService llmService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ReviewService(CodeReviewRepository reviewRepository,
                         ReviewFindingRepository findingRepository,
                         List<StaticCodeAnalyzer> analyzers,
                         RagService ragService,
                         LlmService llmService) {
        this.reviewRepository = reviewRepository;
        this.findingRepository = findingRepository;
        this.analyzers = analyzers;
        this.ragService = ragService;
        this.llmService = llmService;
    }

    public ReviewSummary performReview(Long repositoryId, ReviewRequest request) {
        // 1. Create Review Record
        CodeReview review = new CodeReview();
        review.setRepositoryId(repositoryId);
        review.setFileOrContext(request.getFileOrContext());
        review.setCodeSnippet(request.getCodeSnippet());
        review.setStatus("PROCESSING");
        review = reviewRepository.save(review);

        List<ReviewFinding> allFindings = new ArrayList<>();

        try {
            // 2. Static Analysis (Deterministic)
            RepositoryFile tempFile = new RepositoryFile();
            tempFile.setRepositoryId(repositoryId);
            tempFile.setPath(request.getFileOrContext());
            tempFile.setContent(request.getCodeSnippet());
            
            String language = "unknown";
            if (request.getFileOrContext() != null) {
                if (request.getFileOrContext().endsWith(".java")) language = "Java";
                else if (request.getFileOrContext().endsWith(".ts")) language = "TypeScript";
                else if (request.getFileOrContext().endsWith(".tsx")) language = "TypeScript";
            }
            tempFile.setLanguage(language);

            for (StaticCodeAnalyzer analyzer : analyzers) {
                if (analyzer.supports(language)) {
                    List<StaticAnalysisFinding> staticFindings = analyzer.analyze(tempFile);
                    for (StaticAnalysisFinding sf : staticFindings) {
                        ReviewFinding rf = new ReviewFinding();
                        rf.setCodeReviewId(review.getId());
                        rf.setSeverity(sf.getSeverity()); // usually HIGH/MEDIUM/LOW
                        rf.setCategory(sf.getCategory() != null ? sf.getCategory() : "MAINTAINABILITY");
                        rf.setTitle(sf.getTitle());
                        rf.setDescription(sf.getDescription());
                        rf.setFile(sf.getFileName());
                        rf.setStartLine(sf.getLine());
                        rf.setEndLine(sf.getLine());
                        rf.setEvidence(""); // StaticAnalysisFinding doesn't store snippet natively
                        rf.setRecommendation(sf.getRecommendation());
                        rf.setConfidence("HIGH");
                        rf.setStatus("PENDING");
                        allFindings.add(rf);
                    }
                }
            }

            // 3. RAG Context Retrieval
            // Form a query based on the code to find related architectural rules or implementations
            String ragQuery = "Find any conventions or implementations related to: " + request.getFileOrContext();
            RagQueryResponse ragResponse = ragService.queryRepository(repositoryId, ragQuery);

            // 4. LLM Review Prompt
            String systemPrompt = "You are an expert AI Code Reviewer. You must analyze the provided code snippet.\n" +
                    "Return ONLY a JSON array of objects representing code review findings. Do not include markdown code block formatting in your output.\n" +
                    "Each finding MUST have these fields:\n" +
                    "- severity (CRITICAL, HIGH, MEDIUM, LOW)\n" +
                    "- category (BUG, SECURITY, PERFORMANCE, MAINTAINABILITY, DESIGN, TESTING)\n" +
                    "- title (short summary)\n" +
                    "- description (detailed explanation)\n" +
                    "- startLine (integer, derived ONLY from the snippet if possible, else null. DO NOT invent line numbers)\n" +
                    "- evidence (the exact code snippet causing the issue)\n" +
                    "- recommendation (how to fix it)\n" +
                    "- confidence (HIGH, MEDIUM, LOW)";

            StringBuilder userPrompt = new StringBuilder();
            userPrompt.append("File: ").append(request.getFileOrContext()).append("\n");
            userPrompt.append("Code to review:\n```\n").append(request.getCodeSnippet()).append("\n```\n\n");
            userPrompt.append("Repository Context (from RAG):\n").append(ragResponse.getAnswer()).append("\n");

            // 5. Invoke LLM and Parse
            String llmResponse = llmService.generateResponse(systemPrompt, userPrompt.toString());
            
            // Clean up possible markdown
            String cleanJson = llmResponse.trim();
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.substring(7);
                if (cleanJson.endsWith("```")) cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
            } else if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.substring(3);
                if (cleanJson.endsWith("```")) cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
            }

            try {
                List<ReviewFinding> llmFindings = objectMapper.readValue(cleanJson, new TypeReference<List<ReviewFinding>>() {});
                for (ReviewFinding rf : llmFindings) {
                    rf.setCodeReviewId(review.getId());
                    rf.setFile(request.getFileOrContext());
                    rf.setStatus("PENDING");
                    
                    // Enforce constraints
                    if (rf.getSeverity() == null) rf.setSeverity("MEDIUM");
                    if (rf.getCategory() == null) rf.setCategory("MAINTAINABILITY");
                    if (rf.getConfidence() == null) rf.setConfidence("MEDIUM");
                    
                    allFindings.add(rf);
                }
            } catch (Exception e) {
                // If LLM failed to return valid JSON, add a fallback finding
                ReviewFinding errorFinding = new ReviewFinding();
                errorFinding.setCodeReviewId(review.getId());
                errorFinding.setSeverity("LOW");
                errorFinding.setCategory("MAINTAINABILITY");
                errorFinding.setTitle("LLM Parsing Error");
                errorFinding.setDescription("Failed to parse LLM response into structured findings.");
                errorFinding.setEvidence(cleanJson.substring(0, Math.min(cleanJson.length(), 200)));
                errorFinding.setStatus("PENDING");
                allFindings.add(errorFinding);
            }

            // Save all findings
            allFindings = findingRepository.saveAll(allFindings);

            review.setStatus("COMPLETED");
            reviewRepository.save(review);

        } catch (Exception e) {
            review.setStatus("FAILED");
            reviewRepository.save(review);
            throw new RuntimeException("Code review failed: " + e.getMessage(), e);
        }

        return new ReviewSummary(review, allFindings);
    }
}
