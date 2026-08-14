package com.devpilot.rag;

import com.devpilot.rag.chunking.JavaCodeChunker;
import com.devpilot.repository.RepositoryFile;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class JavaCodeChunkerTest {

    private JavaCodeChunker chunker;

    @BeforeEach
    public void setUp() {
        chunker = new JavaCodeChunker();
    }

    private RepositoryFile createTestFile(String path, String content) {
        RepositoryFile file = new RepositoryFile();
        file.setId(1L);
        file.setRepositoryId(10L);
        file.setPath(path);
        file.setName(path.substring(path.lastIndexOf('/') + 1));
        file.setLanguage("Java");
        file.setContent(content);
        return file;
    }

    @Test
    public void testChunkJavaClassWithMethods() {
        String code = """
                package com.devpilot.security;
                
                import org.springframework.context.annotation.Configuration;
                import org.springframework.security.config.annotation.web.builders.HttpSecurity;
                import org.springframework.security.web.SecurityFilterChain;
                
                @Configuration
                public class SecurityConfig {
                
                    private final AuthTokenFilter authTokenFilter;
                    
                    public SecurityConfig(AuthTokenFilter authTokenFilter) {
                        this.authTokenFilter = authTokenFilter;
                    }
                    
                    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                        http.csrf().disable();
                        return http.build();
                    }
                }
                """;

        RepositoryFile file = createTestFile("src/main/java/com/devpilot/security/SecurityConfig.java", code);
        List<CodeChunk> chunks = chunker.chunk(file);

        assertNotNull(chunks);
        assertTrue(chunks.size() >= 2, "Should create class header chunk and method chunks");

        // Verify Class Header Chunk
        CodeChunk headerChunk = chunks.stream()
                .filter(c -> "Class Declaration & Fields".equals(c.getMethod()))
                .findFirst()
                .orElse(null);
        assertNotNull(headerChunk);
        assertEquals("SecurityConfig", headerChunk.getSymbol());
        assertTrue(headerChunk.getContent().contains("public class SecurityConfig"));

        // Verify Method Chunk
        CodeChunk methodChunk = chunks.stream()
                .filter(c -> "filterChain".equals(c.getMethod()))
                .findFirst()
                .orElse(null);
        assertNotNull(methodChunk);
        assertEquals("SecurityConfig", methodChunk.getSymbol());
        assertEquals("filterChain", methodChunk.getMethod());
        assertTrue(methodChunk.getStartLine() > 1);
        assertTrue(methodChunk.getEndLine() >= methodChunk.getStartLine());
        assertTrue(methodChunk.getContent().contains("http.csrf().disable()"));
    }
}
