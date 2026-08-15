package com.devpilot.agent;

import com.devpilot.agent.domain.AIConversation;
import com.devpilot.agent.domain.AIMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AgentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EngineeringAgentService agentService;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
    }

    @Test
    @WithMockUser
    void testCreateConversation() throws Exception {
        AIConversation conv = new AIConversation();
        conv.setId(1L);
        conv.setTitle("Test Conversation");

        when(agentService.createConversation(anyLong(), anyString())).thenReturn(conv);

        mockMvc.perform(post("/api/repositories/10/conversations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("title", "Test Conversation"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Test Conversation"));
    }

    @Test
    @WithMockUser
    void testGetConversations() throws Exception {
        AIConversation conv = new AIConversation();
        conv.setId(1L);
        conv.setTitle("Existing Conv");

        when(agentService.getConversations(10L)).thenReturn(List.of(conv));

        mockMvc.perform(get("/api/repositories/10/conversations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").value("Existing Conv"));
    }

    @Test
    @WithMockUser
    void testGetMessages() throws Exception {
        AIMessage msg = new AIMessage();
        msg.setId(100L);
        msg.setContent("Hello AI");

        when(agentService.getMessages(1L)).thenReturn(List.of(msg));

        mockMvc.perform(get("/api/conversations/1/messages"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(100))
                .andExpect(jsonPath("$[0].content").value("Hello AI"));
    }

    @Test
    @WithMockUser
    void testSendMessage() throws Exception {
        AIMessage msg1 = new AIMessage();
        msg1.setId(100L);
        msg1.setContent("User: Hi");
        
        AIMessage msg2 = new AIMessage();
        msg2.setId(101L);
        msg2.setContent("AI: Hello there");

        when(agentService.getMessages(1L)).thenReturn(List.of(msg1, msg2));

        mockMvc.perform(post("/api/conversations/1/messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("content", "Hi"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(100))
                .andExpect(jsonPath("$[1].content").value("AI: Hello there"));
                
        verify(agentService).sendMessage(1L, "Hi");
    }
}
