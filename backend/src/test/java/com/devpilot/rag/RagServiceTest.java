package com.devpilot.rag;

import com.devpilot.analysis.AnalysisJob;
import com.devpilot.analysis.AnalysisJobRepository;
import com.devpilot.rag.chunking.CompositeCodeChunker;
import com.devpilot.rag.chunking.GenericCodeChunker;
import com.devpilot.rag.chunking.JavaCodeChunker;
import com.devpilot.rag.dto.RagQueryResponse;
import com.devpilot.rag.embedding.EmbeddingService;
import com.devpilot.rag.embedding.GeminiEmbeddingProvider;
import com.devpilot.rag.embedding.LocalSemanticEmbeddingProvider;
import com.devpilot.rag.embedding.OpenAiEmbeddingProvider;
import com.devpilot.rag.llm.FallbackLlmProvider;
import com.devpilot.rag.llm.GeminiLlmProvider;
import com.devpilot.rag.llm.LlmService;
import com.devpilot.rag.llm.OpenAiLlmProvider;
import com.devpilot.repository.RepositoryFile;
import com.devpilot.repository.RepositoryFileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;

public class RagServiceTest {

    private RagService ragService;
    private CodeChunkRepository codeChunkRepository;
    private RepositoryFileRepository repositoryFileRepository;
    private AnalysisJobRepository analysisJobRepository;
    private CompositeCodeChunker compositeCodeChunker;
    private EmbeddingService embeddingService;
    private LlmService llmService;

    @BeforeEach
    public void setUp() {
        codeChunkRepository = Mockito.mock(CodeChunkRepository.class);
        repositoryFileRepository = Mockito.mock(RepositoryFileRepository.class);
        analysisJobRepository = Mockito.mock(AnalysisJobRepository.class);

        JavaCodeChunker javaCodeChunker = new JavaCodeChunker();
        GenericCodeChunker genericCodeChunker = new GenericCodeChunker();
        compositeCodeChunker = new CompositeCodeChunker(javaCodeChunker, genericCodeChunker);

        LocalSemanticEmbeddingProvider localEmbedder = new LocalSemanticEmbeddingProvider();
        OpenAiEmbeddingProvider openAiEmbedder = new OpenAiEmbeddingProvider();
        GeminiEmbeddingProvider geminiEmbedder = new GeminiEmbeddingProvider();
        embeddingService = new EmbeddingService(openAiEmbedder, geminiEmbedder, localEmbedder);

        FallbackLlmProvider fallbackLlm = new FallbackLlmProvider();
        OpenAiLlmProvider openAiLlm = new OpenAiLlmProvider();
        GeminiLlmProvider geminiLlm = new GeminiLlmProvider();
        llmService = new LlmService(openAiLlm, geminiLlm, fallbackLlm);

        ragService = new RagService(
                codeChunkRepository,
                repositoryFileRepository,
                analysisJobRepository,
                compositeCodeChunker,
                embeddingService,
                llmService
        );
    }

    @Test
    public void testIndexingAndRetrievalForSecurityQuery() {
        Long repoId = 1L;

        RepositoryFile secFile = new RepositoryFile();
        secFile.setId(10L);
        secFile.setRepositoryId(repoId);
        secFile.setPath("src/main/java/com/devpilot/security/SecurityConfig.java");
        secFile.setLanguage("Java");
        secFile.setContent("""
                package com.devpilot.security;
                
                public class SecurityConfig {
                    public void configureJwtFilter() {
                        System.out.println("Configuring JWT Auth filter");
                    }
                }
                """);

        RepositoryFile userFile = new RepositoryFile();
        userFile.setId(20L);
        userFile.setRepositoryId(repoId);
        userFile.setPath("src/main/java/com/devpilot/user/UserController.java");
        userFile.setLanguage("Java");
        userFile.setContent("""
                package com.devpilot.user;
                
                public class UserController {
                    public void getUserProfile() {
                        System.out.println("User Profile");
                    }
                }
                """);

        Mockito.when(repositoryFileRepository.findByRepositoryId(repoId)).thenReturn(List.of(secFile, userFile));
        Mockito.when(analysisJobRepository.findByRepositoryIdAndType(repoId, "RAG_INDEXING")).thenReturn(Optional.empty());

        List<CodeChunk> storedChunks = new ArrayList<>();
        Mockito.when(codeChunkRepository.saveAll(any())).thenAnswer(inv -> {
            List<CodeChunk> c = inv.getArgument(0);
            storedChunks.addAll(c);
            return c;
        });

        // Run Indexing
        ragService.indexRepository(repoId);

        assertTrue(storedChunks.size() >= 2);
        Mockito.when(codeChunkRepository.findByRepositoryId(repoId)).thenReturn(storedChunks);

        // Query RAG for JWT authentication
        RagQueryResponse response = ragService.queryRepository(repoId, "Where is JWT authentication configured?");

        assertNotNull(response);
        assertNotNull(response.getAnswer());
        assertFalse(response.getSources().isEmpty());

        // Assert that top retrieved source is SecurityConfig.java
        assertEquals("src/main/java/com/devpilot/security/SecurityConfig.java", response.getSources().get(0).getPath());
    }
}
