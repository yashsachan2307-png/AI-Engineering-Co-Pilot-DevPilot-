package com.devpilot.rag.chunking;

import com.devpilot.rag.CodeChunk;
import com.devpilot.repository.RepositoryFile;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class GenericCodeChunker implements CodeChunker {

    private static final int WINDOW_SIZE = 60;
    private static final int OVERLAP = 15;

    @Override
    public boolean supports(String language, String filePath) {
        return true; // Fallback for all other files
    }

    @Override
    public List<CodeChunk> chunk(RepositoryFile file) {
        List<CodeChunk> chunks = new ArrayList<>();
        if (file.getContent() == null || file.getContent().trim().isEmpty()) {
            return chunks;
        }

        String[] lines = file.getContent().split("\n");
        if (lines.length <= WINDOW_SIZE) {
            CodeChunk chunk = new CodeChunk();
            chunk.setRepositoryId(file.getRepositoryId());
            chunk.setRepositoryFileId(file.getId());
            chunk.setPath(file.getPath());
            chunk.setLanguage(file.getLanguage() != null ? file.getLanguage() : "Text");
            chunk.setSymbol(file.getName());
            chunk.setMethod(null);
            chunk.setStartLine(1);
            chunk.setEndLine(lines.length);
            chunk.setContent(String.format("// File: %s (Lines: 1-%d)\n%s", file.getPath(), lines.length, file.getContent()));
            chunks.add(chunk);
            return chunks;
        }

        int step = WINDOW_SIZE - OVERLAP;
        for (int i = 0; i < lines.length; i += step) {
            int end = Math.min(lines.length, i + WINDOW_SIZE);
            StringBuilder sb = new StringBuilder();
            sb.append(String.format("// File: %s (Lines: %d-%d)\n", file.getPath(), i + 1, end));
            for (int j = i; j < end; j++) {
                sb.append(lines[j]).append("\n");
            }

            CodeChunk chunk = new CodeChunk();
            chunk.setRepositoryId(file.getRepositoryId());
            chunk.setRepositoryFileId(file.getId());
            chunk.setPath(file.getPath());
            chunk.setLanguage(file.getLanguage() != null ? file.getLanguage() : "Text");
            chunk.setSymbol(file.getName());
            chunk.setMethod(null);
            chunk.setStartLine(i + 1);
            chunk.setEndLine(end);
            chunk.setContent(sb.toString());
            chunks.add(chunk);

            if (end == lines.length) break;
        }

        return chunks;
    }
}
