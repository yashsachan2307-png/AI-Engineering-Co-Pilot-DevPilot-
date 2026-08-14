package com.devpilot.rag.llm;

public interface LLMProvider {
    String generateResponse(String systemPrompt, String userPrompt);
    String getProviderName();
}
