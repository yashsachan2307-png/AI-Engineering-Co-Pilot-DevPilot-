package com.devpilot.rag.embedding;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmbeddingService {

    @Value("${devpilot.ai.provider:local}")
    private String configuredProvider;

    private final OpenAiEmbeddingProvider openAiEmbeddingProvider;
    private final GeminiEmbeddingProvider geminiEmbeddingProvider;
    private final LocalSemanticEmbeddingProvider localSemanticEmbeddingProvider;

    public EmbeddingService(OpenAiEmbeddingProvider openAiEmbeddingProvider,
                            GeminiEmbeddingProvider geminiEmbeddingProvider,
                            LocalSemanticEmbeddingProvider localSemanticEmbeddingProvider) {
        this.openAiEmbeddingProvider = openAiEmbeddingProvider;
        this.geminiEmbeddingProvider = geminiEmbeddingProvider;
        this.localSemanticEmbeddingProvider = localSemanticEmbeddingProvider;
    }

    public EmbeddingProvider getActiveProvider() {
        if ("openai".equalsIgnoreCase(configuredProvider)) {
            return openAiEmbeddingProvider;
        } else if ("gemini".equalsIgnoreCase(configuredProvider)) {
            return geminiEmbeddingProvider;
        }
        return localSemanticEmbeddingProvider;
    }

    public List<Double> embed(String text) {
        EmbeddingProvider provider = getActiveProvider();
        List<Double> vector = provider.embed(text);
        if (vector == null || vector.isEmpty()) {
            // Fallback to local deterministic provider if remote API fails or has no key
            return localSemanticEmbeddingProvider.embed(text);
        }
        return vector;
    }

    public List<List<Double>> embedBatch(List<String> texts) {
        EmbeddingProvider provider = getActiveProvider();
        List<List<Double>> vectors = provider.embedBatch(texts);
        if (vectors == null || vectors.isEmpty()) {
            return localSemanticEmbeddingProvider.embedBatch(texts);
        }
        return vectors;
    }
}
