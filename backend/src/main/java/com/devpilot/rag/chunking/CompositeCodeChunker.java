package com.devpilot.rag.chunking;

import com.devpilot.rag.CodeChunk;
import com.devpilot.repository.RepositoryFile;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CompositeCodeChunker {

    private final JavaCodeChunker javaCodeChunker;
    private final GenericCodeChunker genericCodeChunker;

    public CompositeCodeChunker(JavaCodeChunker javaCodeChunker, GenericCodeChunker genericCodeChunker) {
        this.javaCodeChunker = javaCodeChunker;
        this.genericCodeChunker = genericCodeChunker;
    }

    public List<CodeChunk> chunk(RepositoryFile file) {
        if (javaCodeChunker.supports(file.getLanguage(), file.getPath())) {
            return javaCodeChunker.chunk(file);
        }
        return genericCodeChunker.chunk(file);
    }
}
