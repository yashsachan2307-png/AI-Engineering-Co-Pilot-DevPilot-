package com.devpilot.debugging.service;

import com.devpilot.debugging.dto.DebugRequest;
import com.devpilot.debugging.dto.DebugResponse;
import com.devpilot.debugging.util.JavaStackTraceParser;
import com.devpilot.rag.RagService;
import com.devpilot.rag.dto.RagQueryResponse;
import com.devpilot.rag.llm.LlmService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DebuggerService {

    private final RagService ragService;
    private final LlmService llmService;
    private final ObjectMapper objectMapper;

    public DebuggerService(RagService ragService, LlmService llmService) {
        this.ragService = ragService;
        this.llmService = llmService;
        this.objectMapper = new ObjectMapper();
    }

    public DebugResponse debug(Long repositoryId, DebugRequest request) {
        // 1. Extract context from stack trace
        List<String> relevantClasses = JavaStackTraceParser.extractRelevantClasses(request.getStackTrace());

        // 2. Formulate RAG query
        StringBuilder ragQueryBuilder = new StringBuilder();
        ragQueryBuilder.append("Error message: ").append(request.getErrorMessage()).append("\n");
        if (request.getUserDescription() != null && !request.getUserDescription().isEmpty()) {
            ragQueryBuilder.append("User description: ").append(request.getUserDescription()).append("\n");
        }
        if (!relevantClasses.isEmpty()) {
            ragQueryBuilder.append("Find implementations for these classes: ");
            ragQueryBuilder.append(String.join(", ", relevantClasses));
        }

        // 3. Fetch RAG Context
        RagQueryResponse ragResponse = ragService.queryRepository(repositoryId, ragQueryBuilder.toString());

        // 4. Call LLM
        String systemPrompt = "You are an expert AI Debugger Assistant. You are provided with an error message, stack trace, and retrieved repository context.\n" +
                "You must analyze the problem and provide a highly accurate diagnosis.\n" +
                "Do not pretend certainty when evidence is insufficient.\n\n" +
                "Return ONLY a JSON object representing the debug response. Do not include markdown code block formatting in your output (like ```json).\n" +
                "The JSON object MUST have these fields:\n" +
                "- rootCause (string: A clear explanation of what went wrong)\n" +
                "- evidence (string: Explanation of how the stack trace and context prove the root cause)\n" +
                "- relevantFiles (list of strings: Files identified as part of the problem)\n" +
                "- likelyCauses (list of strings: If uncertain, list the most likely reasons)\n" +
                "- suggestedFix (string: Markdown formatted code block showing how to fix the issue)\n" +
                "- potentialSideEffects (string: What to watch out for if they apply the fix)\n" +
                "- prevention (string: How to prevent this in the future)";

        StringBuilder userPrompt = new StringBuilder();
        userPrompt.append("Error Message:\n").append(request.getErrorMessage()).append("\n\n");
        if (request.getStackTrace() != null && !request.getStackTrace().isEmpty()) {
            userPrompt.append("Stack Trace:\n").append(request.getStackTrace()).append("\n\n");
        }
        if (request.getSelectedFile() != null && !request.getSelectedFile().isEmpty()) {
            userPrompt.append("User Selected File:\n").append(request.getSelectedFile()).append("\n\n");
        }
        if (request.getUserDescription() != null && !request.getUserDescription().isEmpty()) {
            userPrompt.append("User Description:\n").append(request.getUserDescription()).append("\n\n");
        }
        userPrompt.append("Retrieved Context from Repository:\n").append(ragResponse.getAnswer()).append("\n");
        if (ragResponse.getSources() != null && !ragResponse.getSources().isEmpty()) {
            userPrompt.append("\nSource files included in context: ")
                      .append(ragResponse.getSources().stream().map(s -> s.getPath()).collect(Collectors.joining(", ")));
        }

        String llmResponse = llmService.generateResponse(systemPrompt, userPrompt.toString());

        // 5. Parse JSON
        String cleanJson = llmResponse.trim();
        if (cleanJson.startsWith("```json")) {
            cleanJson = cleanJson.substring(7);
            if (cleanJson.endsWith("```")) cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
        } else if (cleanJson.startsWith("```")) {
            cleanJson = cleanJson.substring(3);
            if (cleanJson.endsWith("```")) cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
        }

        try {
            return objectMapper.readValue(cleanJson, DebugResponse.class);
        } catch (Exception e) {
            DebugResponse fallback = new DebugResponse();
            fallback.setRootCause("Failed to parse LLM response");
            fallback.setEvidence(cleanJson); // Store the raw text as evidence for debugging
            return fallback;
        }
    }
}
