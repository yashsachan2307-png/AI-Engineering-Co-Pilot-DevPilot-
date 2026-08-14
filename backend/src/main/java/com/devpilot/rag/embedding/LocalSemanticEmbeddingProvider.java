package com.devpilot.rag.embedding;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

@Component
public class LocalSemanticEmbeddingProvider implements EmbeddingProvider {

    private static final int DIMENSION = 128;

    @Override
    public String getProviderName() {
        return "local";
    }

    @Override
    public int getDimension() {
        return DIMENSION;
    }

    @Override
    public List<Double> embed(String text) {
        if (text == null || text.trim().isEmpty()) {
            return new ArrayList<>(Collections.nCopies(DIMENSION, 0.0));
        }

        double[] vector = new double[DIMENSION];
        String clean = text.toLowerCase(Locale.ROOT);
        
        // Tokenize by non-alphanumeric
        String[] tokens = clean.split("[^a-zA-Z0-9_]+");

        for (String token : tokens) {
            if (token.isEmpty()) continue;
            
            // Unigrams
            int hash1 = Math.abs(token.hashCode()) % DIMENSION;
            vector[hash1] += 1.0;

            // Character trigrams for subword matching (e.g., "auth" in "authentication")
            if (token.length() >= 3) {
                for (int i = 0; i <= token.length() - 3; i++) {
                    String sub = token.substring(i, i + 3);
                    int hash2 = Math.abs(sub.hashCode() * 31) % DIMENSION;
                    vector[hash2] += 0.4;
                }
            }
        }

        // Normalize vector to unit length (L2 norm)
        double norm = 0.0;
        for (double v : vector) {
            norm += v * v;
        }
        norm = Math.sqrt(norm);

        List<Double> result = new ArrayList<>(DIMENSION);
        if (norm > 0.0) {
            for (double v : vector) {
                result.add(v / norm);
            }
        } else {
            result.addAll(Collections.nCopies(DIMENSION, 0.0));
        }

        return result;
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
