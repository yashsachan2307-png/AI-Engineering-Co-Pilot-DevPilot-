package com.devpilot.generation.service;

import com.devpilot.generation.dto.FileProposal;
import com.devpilot.generation.dto.GenerateRequest;
import com.devpilot.generation.dto.GenerateResponse;
import com.devpilot.rag.RagService;
import com.devpilot.rag.dto.RagQueryResponse;
import com.devpilot.rag.llm.LlmService;
import com.devpilot.repository.RepositoryFile;
import com.devpilot.repository.RepositoryFileRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class GenerationService {

    private final RagService ragService;
    private final LlmService llmService;
    private final RepositoryFileRepository fileRepository;
    private final ObjectMapper objectMapper;

    public GenerationService(RagService ragService, LlmService llmService, RepositoryFileRepository fileRepository, ObjectMapper objectMapper) {
        this.ragService = ragService;
        this.llmService = llmService;
        this.fileRepository = fileRepository;
        this.objectMapper = objectMapper;
    }

    public GenerateResponse generateCode(Long repositoryId, GenerateRequest request) {
        // 1. Ask RAG for relevant context
        String ragQuery = request.getPrompt() + " (Focus on controllers, services, DTOs, repositories, validation, security, naming conventions)";
        RagQueryResponse ragResponse = ragService.queryRepository(repositoryId, ragQuery);

        // 2. Build Prompt
        String systemPrompt = "You are a Senior Software Engineer. The user will ask you to implement or modify a feature in their project. " +
                "You have been provided with context from their repository to help you understand their existing architecture, naming conventions, and patterns. " +
                "Your task is to propose file changes that fulfill the user's request while strictly adhering to the repository's established architecture. " +
                "You must output ONLY valid JSON in the exact following structure. Do not include markdown blocks or any other text.\n" +
                "{\n" +
                "  \"proposals\": [\n" +
                "    {\n" +
                "      \"path\": \"src/main/java/com/.../NewFile.java\",\n" +
                "      \"newCode\": \"<full file content>\",\n" +
                "      \"explanation\": \"Why this change is needed\"\n" +
                "    }\n" +
                "  ],\n" +
                "  \"explanation\": \"Overall explanation of the changes\"\n" +
                "}";

        StringBuilder userPrompt = new StringBuilder();
        userPrompt.append("User Request: ").append(request.getPrompt()).append("\n\n");
        userPrompt.append("Repository Context:\n").append(ragResponse.getAnswer()).append("\n\n");
        
        if (ragResponse.getSources() != null && !ragResponse.getSources().isEmpty()) {
            userPrompt.append("Relevant Context snippets:\n");
            ragResponse.getSources().forEach(s -> {
                userPrompt.append("--- ").append(s.getPath()).append(" ---\n");
                userPrompt.append(s.getSnippet()).append("\n");
            });
        }

        // 3. Generate response
        String llmResponse = llmService.generateResponse(systemPrompt, userPrompt.toString());

        // 4. Parse response
        try {
            // Clean markdown if the LLM adds it by mistake
            String cleanResponse = llmResponse.replaceAll("(?s)^```json\\n(.*)\\n```$", "$1").trim();
            cleanResponse = cleanResponse.replaceAll("(?s)^```(.*)```$", "$1").trim();

            GenerateResponse response = objectMapper.readValue(cleanResponse, GenerateResponse.class);

            // 5. Hydrate oldCode for proposals
            if (response.getProposals() != null) {
                for (FileProposal proposal : response.getProposals()) {
                    Optional<RepositoryFile> existingFile = fileRepository.findByRepositoryIdAndPath(repositoryId, proposal.getPath());
                    existingFile.ifPresent(file -> proposal.setOldCode(file.getContent()));
                }
            }

            return response;
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse LLM response as JSON: " + e.getMessage() + "\nResponse was: " + llmResponse, e);
        }
    }
}
