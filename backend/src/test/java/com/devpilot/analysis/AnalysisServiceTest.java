package com.devpilot.analysis;

import com.devpilot.github.GitHubAccount;
import com.devpilot.github.GitHubAccountRepository;
import com.devpilot.repository.Repository;
import com.devpilot.repository.RepositoryFile;
import com.devpilot.repository.RepositoryFileRepository;
import com.devpilot.repository.RepositoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnalysisServiceTest {

    @Mock
    private AnalysisJobRepository analysisJobRepository;

    @Mock
    private CodeSymbolRepository codeSymbolRepository;

    @Mock
    private RepositoryRepository repositoryRepository;

    @Mock
    private RepositoryFileRepository repositoryFileRepository;

    @Mock
    private GitHubAccountRepository gitHubAccountRepository;

    @Mock
    private CodeParser mockParser;

    @Mock
    private SseService sseService;

    @InjectMocks
    private AnalysisService analysisService;

    @Captor
    private ArgumentCaptor<AnalysisJob> jobCaptor;

    @BeforeEach
    void setUp() {
        analysisService = new AnalysisService(
                analysisJobRepository,
                codeSymbolRepository,
                repositoryRepository,
                repositoryFileRepository,
                gitHubAccountRepository,
                List.of(mockParser),
                sseService
        );
    }

    @Test
    void testStartAnalysis_Success() {
        Long repositoryId = 10L;
        Long userId = 1L;
        
        Repository repo = new Repository();
        repo.setId(repositoryId);
        repo.setGithubAccountId(100L);

        GitHubAccount account = new GitHubAccount();
        account.setId(100L);
        account.setUserId(userId);

        AnalysisJob job = new AnalysisJob();
        job.setId(1000L);

        when(analysisJobRepository.findFirstByRepositoryIdOrderByStartedAtDesc(repositoryId)).thenReturn(Optional.empty());
        when(repositoryRepository.findById(repositoryId)).thenReturn(Optional.of(repo));
        when(gitHubAccountRepository.findByUserId(userId)).thenReturn(Optional.of(account));
        when(analysisJobRepository.save(any(AnalysisJob.class))).thenReturn(job);

        AnalysisJob startedJob = analysisService.startAnalysis(repositoryId, userId, "sha123");

        assertNotNull(startedJob);
        assertEquals(1000L, startedJob.getId());
        verify(analysisJobRepository).save(jobCaptor.capture());
        
        AnalysisJob captured = jobCaptor.getValue();
        assertEquals("QUEUED", captured.getStatus());
        assertEquals("sha123", captured.getCommitSha());
    }

    @Test
    void testStartAnalysis_AlreadyInProgress() {
        Long repositoryId = 10L;
        Long userId = 1L;

        AnalysisJob existingJob = new AnalysisJob();
        existingJob.setStatus("PROCESSING");

        when(analysisJobRepository.findFirstByRepositoryIdOrderByStartedAtDesc(repositoryId)).thenReturn(Optional.of(existingJob));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            analysisService.startAnalysis(repositoryId, userId, "sha123");
        });

        assertEquals("Analysis is already in progress for this repository.", exception.getMessage());
    }

    @Test
    void testProcessAnalysisAsync_Success() {
        Long jobId = 1000L;
        Long repositoryId = 10L;

        AnalysisJob job = new AnalysisJob();
        job.setId(jobId);
        job.setRepositoryId(repositoryId);
        job.setStatus("QUEUED");

        RepositoryFile file = new RepositoryFile();
        file.setLanguage("java");
        file.setContent("public class Test {}");

        CodeSymbol symbol = new CodeSymbol();
        symbol.setName("Test");

        when(analysisJobRepository.findById(jobId)).thenReturn(Optional.of(job));
        when(repositoryFileRepository.findByRepositoryId(repositoryId)).thenReturn(List.of(file));
        when(mockParser.supports("java")).thenReturn(true);
        when(mockParser.parse(file)).thenReturn(List.of(symbol));

        analysisService.processAnalysisAsync(jobId, repositoryId);

        verify(codeSymbolRepository).deleteByRepositoryId(repositoryId);
        verify(mockParser).parse(file);
        verify(codeSymbolRepository).saveAll(anyList());
        
        verify(analysisJobRepository, atLeastOnce()).save(jobCaptor.capture());
        
        AnalysisJob finalJob = jobCaptor.getAllValues().get(jobCaptor.getAllValues().size() - 1);
        assertEquals("COMPLETED", finalJob.getStatus());
        assertEquals(100, finalJob.getProgressPercentage());
    }
}
