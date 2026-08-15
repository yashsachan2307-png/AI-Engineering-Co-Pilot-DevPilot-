package com.devpilot.securityscanner;

import com.devpilot.rag.llm.LlmService;
import com.devpilot.repository.RepositoryFile;
import com.devpilot.repository.RepositoryFileRepository;
import com.devpilot.securityscanner.dto.SecurityExplainResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SecurityScannerServiceTest {

    @Mock
    private SecurityFindingRepository findingRepository;

    @Mock
    private RepositoryFileRepository fileRepository;

    private LlmService llmService;

    @InjectMocks
    private SecurityScannerService securityScannerService;

    @BeforeEach
    void setUp() {
        llmService = new LlmService(null, null, null) {
            @Override
            public String generateResponse(String systemPrompt, String userPrompt) {
                if (userPrompt.contains("Original Explanation") && !userPrompt.contains("AI Analysis failed to parse")) {
                    return "This is just text, not JSON";
                }
                return "```json\n{\"explanation\": \"AI explanation\", \"recommendation\": \"AI recommendation\"}\n```";
            }
        };
        org.springframework.test.util.ReflectionTestUtils.setField(securityScannerService, "llmService", llmService);
    }

    @Test
    void testScanRepository_FindsSecrets() {
        Long repoId = 1L;

        RepositoryFile file = new RepositoryFile();
        file.setId(10L);
        file.setPath("src/main/resources/application.properties");
        file.setContent("spring.datasource.password=\"mySuperSecretPassword123\"\n" +
                        "aws.access_key=AKIAIOSFODNN7EXAMPLE");

        when(fileRepository.findByRepositoryId(eq(repoId), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(file))) // First page
                .thenReturn(new PageImpl<>(List.of())); // Second page (empty)

        when(findingRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        List<SecurityFinding> findings = securityScannerService.scanRepository(repoId);

        assertEquals(2, findings.size());
        
        SecurityFinding secretFinding = findings.get(0);
        assertEquals("HARDCODED_GENERIC_SECRET", secretFinding.getRuleId());
        assertTrue(secretFinding.getEvidence().contains("********"));
        
        SecurityFinding awsFinding = findings.get(1);
        assertEquals("HARDCODED_AWS_KEY", awsFinding.getRuleId());
        assertTrue(awsFinding.getEvidence().contains("AKIA****************"));
        
        verify(findingRepository).deleteByRepositoryId(repoId);
    }

    @Test
    void testExplainFinding_Success() {
        Long findingId = 1L;

        SecurityFinding finding = new SecurityFinding();
        finding.setId(findingId);
        finding.setRuleId("HARDCODED_AWS_KEY");
        finding.setCategory("Secrets");
        finding.setEvidence("aws.key=AKIA****************");
        finding.setExplanation("Hardcoded AWS Key");

        when(findingRepository.findById(findingId)).thenReturn(Optional.of(finding));

        SecurityExplainResponse response = securityScannerService.explainFinding(findingId);

        assertEquals("AI explanation", response.getExplanation());
        assertEquals("AI recommendation", response.getRecommendation());
    }

    @Test
    void testExplainFinding_FallbackOnBadJson() {
        Long findingId = 1L;

        SecurityFinding finding = new SecurityFinding();
        finding.setId(findingId);
        finding.setExplanation("Original Explanation");
        finding.setRecommendation("Original Recommendation");

        when(findingRepository.findById(findingId)).thenReturn(Optional.of(finding));

        SecurityExplainResponse response = securityScannerService.explainFinding(findingId);

        assertTrue(response.getExplanation().contains("Original Explanation"));
        assertTrue(response.getExplanation().contains("AI Analysis failed to parse"));
        assertEquals("Original Recommendation", response.getRecommendation());
    }
}
