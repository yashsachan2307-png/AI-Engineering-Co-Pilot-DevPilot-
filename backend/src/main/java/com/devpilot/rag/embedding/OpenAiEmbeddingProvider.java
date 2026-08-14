package com.devpilot.rag.embedding;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
public class OpenAiEmbeddingProvider implements EmbeddingProvider {

    @Value("${devpilot.ai.openai.api-key:${OPENAI_API_KEY:}}")
    private String apiKey;

    @Value("${devpilot.ai.openai.embedding-model:text-embedding-3-small}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String getProviderName() {
        return "openai";
    }

    @Override
    public int getDimension() {
        return 1536;
    }

    @Override
    public List<Double> embed(String text) {
        List<List<Double>> batch = embedBatch(List.of(text));
        return batch.isEmpty() ? Collections.emptyList() : batch.get(0);
    }

    @Override
    public List<List<Double>> embedBatch(List<String> texts) {
        if (apiKey == null || apiKey.trim().isEmpty() || texts.isEmpty()) {
            return Collections.emptyList();
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> body = Map.of(
                    "model", model,
                    "input", texts
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.openai.com/v1/embeddings",
                    entity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode data = root.get("data");
                List<List<Double>> result = new ArrayList<>();
                if (data != null && data.isArray()) {
                    for (JsonNode item : data) {
                        JsonNode embeddingNode = item.get("embedding");
                        List<Double> vec = new ArrayList<>();
                        if (embeddingNode != null && embeddingNode.isArray()) {
                            for (JsonNode val : embeddingNode) {
                                vec.add(val.asDouble());
                            }
                        }
                        result.add(vec);
                    }
                }
                return result;
            }
        } catch (Exception e) {
            System.err.println("OpenAI Embedding API error: " + e.getMessage());
        }

        return Collections.emptyList();
    }
}
