package com.devpilot.agent;

import com.devpilot.agent.domain.AIConversation;
import com.devpilot.agent.domain.AIMessage;
import com.devpilot.agent.repository.AIConversationRepository;
import com.devpilot.agent.repository.AIMessageRepository;
import com.devpilot.agent.tools.AgentTool;
import com.devpilot.rag.llm.LlmService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EngineeringAgentService {

    private final AIConversationRepository conversationRepository;
    private final AIMessageRepository messageRepository;
    private final LlmService llmService;
    private final Map<String, AgentTool> tools = new HashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public EngineeringAgentService(AIConversationRepository conversationRepository,
                                   AIMessageRepository messageRepository,
                                   LlmService llmService,
                                   List<AgentTool> toolList) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.llmService = llmService;
        for (AgentTool t : toolList) {
            tools.put(t.getName(), t);
        }
    }

    public AIConversation createConversation(Long repositoryId, String title) {
        AIConversation conv = new AIConversation();
        conv.setRepositoryId(repositoryId);
        conv.setTitle(title);
        return conversationRepository.save(conv);
    }

    public List<AIConversation> getConversations(Long repositoryId) {
        return conversationRepository.findByRepositoryIdOrderByUpdatedAtDesc(repositoryId);
    }

    public List<AIMessage> getMessages(Long conversationId) {
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
    }

    public AIMessage sendMessage(Long conversationId, String content) {
        AIConversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        AIMessage userMsg = new AIMessage();
        userMsg.setConversationId(conversationId);
        userMsg.setRole("user");
        userMsg.setContent(content);
        messageRepository.save(userMsg);

        // Run ReAct loop (max 5 iterations to prevent infinite loops)
        int iterations = 0;
        AIMessage finalResponse = null;

        while (iterations < 5) {
            iterations++;
            String prompt = buildPrompt(conversationId);
            String response = llmService.generateResponse(getSystemPrompt(), prompt);

            // Parse response for potential tool call
            JsonNode toolCallNode = tryParseToolCall(response);
            if (toolCallNode != null) {
                // Record the assistant's intention to call a tool
                AIMessage assistantMsg = new AIMessage();
                assistantMsg.setConversationId(conversationId);
                assistantMsg.setRole("assistant");
                assistantMsg.setToolCallsJson(toolCallNode.toString());
                messageRepository.save(assistantMsg);

                // Execute Tool
                String toolName = toolCallNode.get("tool").asText();
                String toolResult = executeTool(toolName, toolCallNode.get("input"), conv.getRepositoryId());

                // Record the tool result
                AIMessage toolMsg = new AIMessage();
                toolMsg.setConversationId(conversationId);
                toolMsg.setRole("tool");
                toolMsg.setContent(toolResult);
                messageRepository.save(toolMsg);
            } else {
                // Final answer
                finalResponse = new AIMessage();
                finalResponse.setConversationId(conversationId);
                finalResponse.setRole("assistant");
                finalResponse.setContent(response);
                messageRepository.save(finalResponse);
                break;
            }
        }

        if (finalResponse == null) {
            finalResponse = new AIMessage();
            finalResponse.setConversationId(conversationId);
            finalResponse.setRole("assistant");
            finalResponse.setContent("I have reached the maximum number of tool executions and must stop here.");
            messageRepository.save(finalResponse);
        }

        return finalResponse;
    }

    private String getSystemPrompt() {
        StringBuilder sb = new StringBuilder();
        sb.append("You are DevPilot, a repository-aware AI Engineering Agent.\n");
        sb.append("You can use tools to inspect the codebase. If you need to use a tool, respond ONLY with a valid JSON block and NO OTHER TEXT. The format must be:\n");
        sb.append("{\n  \"tool\": \"toolName\",\n  \"input\": {\"key\": \"value\"}\n}\n\n");
        sb.append("Available Tools:\n");
        for (AgentTool t : tools.values()) {
            sb.append("- ").append(t.getName()).append(": ").append(t.getDescription()).append("\n");
            sb.append("  Schema: ").append(t.getInputSchema()).append("\n");
        }
        sb.append("\nIf you have gathered enough information to answer the user's question, provide your final answer in Markdown format. Cite files and line numbers where appropriate.\n");
        return sb.toString();
    }

    private String buildPrompt(Long conversationId) {
        List<AIMessage> messages = getMessages(conversationId);
        StringBuilder sb = new StringBuilder("Conversation History:\n\n");
        for (AIMessage m : messages) {
            sb.append(m.getRole().toUpperCase()).append(":\n");
            if ("assistant".equals(m.getRole()) && m.getToolCallsJson() != null) {
                sb.append("Tool Call Request: ").append(m.getToolCallsJson()).append("\n");
            } else {
                sb.append(m.getContent()).append("\n");
            }
            sb.append("\n");
        }
        sb.append("Your response:");
        return sb.toString();
    }

    private JsonNode tryParseToolCall(String response) {
        try {
            String clean = response.trim();
            if (clean.startsWith("```json")) {
                clean = clean.substring(7);
                if (clean.endsWith("```")) {
                    clean = clean.substring(0, clean.length() - 3);
                }
            }
            if (clean.startsWith("{") && clean.endsWith("}")) {
                JsonNode node = objectMapper.readTree(clean);
                if (node.has("tool") && node.has("input")) {
                    return node;
                }
            }
        } catch (Exception e) {
            // Not a tool call JSON
        }
        return null;
    }

    private String executeTool(String toolName, JsonNode inputNode, Long repositoryId) {
        AgentTool tool = tools.get(toolName);
        if (tool == null) {
            return "Error: Unknown tool '" + toolName + "'";
        }
        try {
            Map<String, Object> input = objectMapper.convertValue(inputNode, Map.class);
            return tool.execute(input, repositoryId);
        } catch (Exception e) {
            return "Error executing tool: " + e.getMessage();
        }
    }
}
