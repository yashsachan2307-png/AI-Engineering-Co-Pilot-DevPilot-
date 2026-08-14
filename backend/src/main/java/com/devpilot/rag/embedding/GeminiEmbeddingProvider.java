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
public class GeminiEmbeddingProvider implements EmbeddingProvider {

    @Value("${devpilot.ai.gemini.api-key:${GEMINI_API_KEY:${AI_API_KEY:}}}")
    private String apiKey;

    @Value("${devpilot.ai.gemini.embedding-model:text-embedding-004}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String getProviderName() {
        return "gemini";
    }

    @Override
    public int getDimension() {
        return 768;
    }

    @Override
    public List<Double> embed(String text) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return Collections.emptyList();
        }

        try {
            String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:embedContent?key=%s", model, apiKey);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = Map.of(
                    "model", "models/" + model,
                    "content", Map.of("parts", List.of(Map.of("text", text)))
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode values = root.path("embedding").path("values");
                List<Double> vec = new ArrayList<>();
                if (values.isArray()) {
                    for (JsonNode val : values) {
                        vec.add(val.asDouble());
                    }
                }
                return vec;
            }
        } catch (Exception e) {
            System.err.println("Gemini Embedding API error: " + e.getMessage());
        }

        return Collections.emptyList();
    }

    @Override
    public List<List<Double>> embedBatch(List<String> texts) {
        List<List<Double>> list = new ArrayList<>(texts.size());
        for (String text : texts) {
            list.add(embed(text));
        }
        return list;
    }
}
