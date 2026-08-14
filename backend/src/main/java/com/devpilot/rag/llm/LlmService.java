package com.devpilot.rag.llm;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class LlmService {

    @Value("${devpilot.ai.provider:local}")
    private String configuredProvider;

    private final OpenAiLlmProvider openAiLlmProvider;
    private final GeminiLlmProvider geminiLlmProvider;
    private final FallbackLlmProvider fallbackLlmProvider;

    public LlmService(OpenAiLlmProvider openAiLlmProvider,
                      GeminiLlmProvider geminiLlmProvider,
                      FallbackLlmProvider fallbackLlmProvider) {
        this.openAiLlmProvider = openAiLlmProvider;
        this.geminiLlmProvider = geminiLlmProvider;
        this.fallbackLlmProvider = fallbackLlmProvider;
    }

    public LLMProvider getActiveProvider() {
        if ("openai".equalsIgnoreCase(configuredProvider)) {
            return openAiLlmProvider;
        } else if ("gemini".equalsIgnoreCase(configuredProvider)) {
            return geminiLlmProvider;
        }
        return fallbackLlmProvider;
    }

    public String generateResponse(String systemPrompt, String userPrompt) {
        LLMProvider provider = getActiveProvider();
        String response = provider.generateResponse(systemPrompt, userPrompt);
        if (response == null || response.trim().isEmpty()) {
            return fallbackLlmProvider.generateResponse(systemPrompt, userPrompt);
        }
        return response;
    }
}
