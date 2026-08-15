package com.devpilot.architecture.service;

import com.devpilot.analysis.CodeSymbol;
import com.devpilot.analysis.CodeSymbolRepository;
import com.devpilot.architecture.dto.ArchitectureAnalysis;
import com.devpilot.rag.llm.LlmService;
import com.devpilot.repository.RepositoryFile;
import com.devpilot.repository.RepositoryFileRepository;
import com.devpilot.repository.RepositoryFileSummary;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ArchitectureServiceTest {

    @Mock
    private CodeSymbolRepository codeSymbolRepository;

    @Mock
    private RepositoryFileRepository fileRepository;

    private LlmService llmService;

    @InjectMocks
    private ArchitectureService architectureService;

    @BeforeEach
    void setUp() {
        llmService = new LlmService(null, null, null) {
            @Override
            public String generateResponse(String systemPrompt, String userPrompt) {
                return "AI Explanation";
            }
        };
        org.springframework.test.util.ReflectionTestUtils.setField(architectureService, "llmService", llmService);
    }

    @Test
    void testAnalyzeArchitecture_BasicNodesAndEdges() {
        Long repoId = 1L;

        CodeSymbol classA = new CodeSymbol();
        classA.setRepositoryFileId(10L);
        classA.setName("ClassA");
        classA.setType("CLASS");

        CodeSymbol classB = new CodeSymbol();
        classB.setRepositoryFileId(11L);
        classB.setName("ClassB");
        classB.setType("CLASS");

        CodeSymbol importInA = new CodeSymbol();
        importInA.setRepositoryFileId(10L);
        importInA.setName("com.example.ClassB");
        importInA.setType("IMPORT");

        RepositoryFileSummary fileA = org.mockito.Mockito.mock(RepositoryFileSummary.class);
        when(fileA.getId()).thenReturn(10L);
        when(fileA.getPath()).thenReturn("src/main/java/ClassA.java");
        RepositoryFileSummary fileB = org.mockito.Mockito.mock(RepositoryFileSummary.class);
        when(fileB.getId()).thenReturn(11L);
        when(fileB.getPath()).thenReturn("src/main/java/ClassB.java");

        when(codeSymbolRepository.findByRepositoryId(repoId)).thenReturn(List.of(classA, classB, importInA));
        when(fileRepository.findSummariesByRepositoryId(repoId)).thenReturn(List.of(fileA, fileB));

        ArchitectureAnalysis analysis = architectureService.analyzeArchitecture(repoId);

        assertEquals(2, analysis.getNodes().size());
        assertEquals(1, analysis.getEdges().size());
        
        assertEquals("10-ClassA", analysis.getEdges().get(0).getSource());
        assertEquals("11-ClassB", analysis.getEdges().get(0).getTarget());
        assertEquals("DEPENDENCY", analysis.getEdges().get(0).getType());
    }

    @Test
    void testAnalyzeArchitecture_PomXmlDependencies() {
        Long repoId = 1L;

        RepositoryFileSummary filePom = org.mockito.Mockito.mock(RepositoryFileSummary.class);
        when(filePom.getId()).thenReturn(100L);
        when(filePom.getPath()).thenReturn("pom.xml");

        RepositoryFile pomFile = new RepositoryFile();
        pomFile.setContent("<dependencies><dependency><artifactId>spring-web</artifactId></dependency></dependencies>");

        when(codeSymbolRepository.findByRepositoryId(repoId)).thenReturn(List.of());
        when(fileRepository.findSummariesByRepositoryId(repoId)).thenReturn(List.of(filePom));
        when(fileRepository.findById(100L)).thenReturn(Optional.of(pomFile));

        ArchitectureAnalysis analysis = architectureService.analyzeArchitecture(repoId);

        // One node for pom.xml, one for spring-web dependency
        assertEquals(2, analysis.getNodes().size());
        assertEquals(1, analysis.getEdges().size());
        
        assertEquals("config-100", analysis.getEdges().get(0).getSource());
        assertEquals("ext-spring-web", analysis.getEdges().get(0).getTarget());
    }

    @Test
    void testExplainArchitecture() {
        ArchitectureAnalysis mockGraph = new ArchitectureAnalysis(List.of(), List.of(), List.of(), List.of());
        
        String response = architectureService.explainArchitecture(1L, "node-1", "What does this do?", mockGraph);
        
        assertEquals("AI Explanation", response);
    }
}
