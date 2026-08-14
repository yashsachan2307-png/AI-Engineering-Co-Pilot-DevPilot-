package com.devpilot.agent;

import com.devpilot.agent.domain.AIConversation;
import com.devpilot.agent.domain.AIMessage;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AgentController {

    private final EngineeringAgentService agentService;

    public AgentController(EngineeringAgentService agentService) {
        this.agentService = agentService;
    }

    @PostMapping("/repositories/{repositoryId}/conversations")
    public AIConversation createConversation(@PathVariable Long repositoryId, @RequestBody Map<String, String> request) {
        String title = request.getOrDefault("title", "New Conversation");
        return agentService.createConversation(repositoryId, title);
    }

    @GetMapping("/repositories/{repositoryId}/conversations")
    public List<AIConversation> getConversations(@PathVariable Long repositoryId) {
        return agentService.getConversations(repositoryId);
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public List<AIMessage> getMessages(@PathVariable Long conversationId) {
        return agentService.getMessages(conversationId);
    }

    @PostMapping("/conversations/{conversationId}/messages")
    public List<AIMessage> sendMessage(@PathVariable Long conversationId, @RequestBody Map<String, String> request) {
        String content = request.get("content");
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Content is required");
        }
        
        agentService.sendMessage(conversationId, content);
        
        // Return all messages so the frontend sees the intermediate tool calls
        return agentService.getMessages(conversationId);
    }
}
