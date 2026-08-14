package com.devpilot.rag.llm;

import org.springframework.stereotype.Component;

@Component
public class FallbackLlmProvider implements LLMProvider {

    @Override
    public String getProviderName() {
        return "fallback";
    }

    @Override
    public String generateResponse(String systemPrompt, String userPrompt) {
        StringBuilder sb = new StringBuilder();
        sb.append("### DevPilot Grounded Analysis\n\n");
        sb.append("Based on the code retrieved from your repository:\n\n");

        if (userPrompt.contains("CONTEXT:")) {
            String context = userPrompt.substring(userPrompt.indexOf("CONTEXT:"));
            sb.append("```\n").append(context.trim()).append("\n```\n\n");
        } else {
            sb.append("Relevant code segments were located and analyzed.\n\n");
        }

        sb.append("You can inspect the exact matching files and line ranges in the **Source Citations** below.");
        return sb.toString();
    }
}
