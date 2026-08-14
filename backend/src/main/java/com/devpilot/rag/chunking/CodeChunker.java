package com.devpilot.rag.chunking;

import com.devpilot.rag.CodeChunk;
import com.devpilot.repository.RepositoryFile;

import java.util.List;

public interface CodeChunker {
    boolean supports(String language, String filePath);
    List<CodeChunk> chunk(RepositoryFile file);
}
