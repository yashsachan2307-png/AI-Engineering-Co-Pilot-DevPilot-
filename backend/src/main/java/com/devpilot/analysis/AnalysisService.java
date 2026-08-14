package com.devpilot.analysis;

import com.devpilot.github.GitHubAccount;
import com.devpilot.github.GitHubAccountRepository;
import com.devpilot.repository.Repository;
import com.devpilot.repository.RepositoryFile;
import com.devpilot.repository.RepositoryFileRepository;
import com.devpilot.repository.RepositoryRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AnalysisService {

    private final AnalysisJobRepository analysisJobRepository;
    private final CodeSymbolRepository codeSymbolRepository;
    private final RepositoryRepository repositoryRepository;
    private final RepositoryFileRepository repositoryFileRepository;
    private final GitHubAccountRepository gitHubAccountRepository;
    private final List<CodeParser> parsers;

    public AnalysisService(AnalysisJobRepository analysisJobRepository,
                           CodeSymbolRepository codeSymbolRepository,
                           RepositoryRepository repositoryRepository,
                           RepositoryFileRepository repositoryFileRepository,
                           GitHubAccountRepository gitHubAccountRepository,
                           List<CodeParser> parsers) {
        this.analysisJobRepository = analysisJobRepository;
        this.codeSymbolRepository = codeSymbolRepository;
        this.repositoryRepository = repositoryRepository;
        this.repositoryFileRepository = repositoryFileRepository;
        this.gitHubAccountRepository = gitHubAccountRepository;
        this.parsers = parsers;
    }

    @Transactional
    public AnalysisJob startAnalysis(Long repositoryId, Long userId) {
        Optional<AnalysisJob> existingJob = analysisJobRepository.findFirstByRepositoryIdOrderByStartedAtDesc(repositoryId);
        if (existingJob.isPresent() && (existingJob.get().getStatus().equals("QUEUED") || existingJob.get().getStatus().equals("PROCESSING"))) {
            throw new RuntimeException("Analysis is already in progress for this repository.");
        }

        Repository repo = repositoryRepository.findById(repositoryId)
                .orElseThrow(() -> new RuntimeException("Repository not found"));

        GitHubAccount account = gitHubAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("GitHub account not linked"));

        if (!repo.getGithubAccountId().equals(account.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        AnalysisJob job = new AnalysisJob();
        job.setRepositoryId(repositoryId);
        job.setStatus("QUEUED");
        job = analysisJobRepository.save(job);

        // Clear existing symbols before analysis
        codeSymbolRepository.deleteByRepositoryId(repositoryId);

        // Trigger async process
        processAnalysisAsync(job.getId(), repositoryId);

        return job;
    }

    @Async
    public void processAnalysisAsync(Long jobId, Long repositoryId) {
        AnalysisJob job = analysisJobRepository.findById(jobId).orElse(null);
        if (job == null) return;

        try {
            job.setStatus("PROCESSING");
            analysisJobRepository.save(job);

            List<RepositoryFile> files = repositoryFileRepository.findByRepositoryId(repositoryId);
            List<CodeSymbol> allSymbols = new ArrayList<>();

            for (RepositoryFile file : files) {
                for (CodeParser parser : parsers) {
                    if (parser.supports(file.getLanguage())) {
                        List<CodeSymbol> symbols = parser.parse(file);
                        allSymbols.addAll(symbols);
                        break; // Stop after first supporting parser
                    }
                }
            }

            codeSymbolRepository.saveAll(allSymbols);

            job.setStatus("COMPLETED");
            job.setCompletedAt(LocalDateTime.now());
            analysisJobRepository.save(job);

        } catch (Exception e) {
            job.setStatus("FAILED");
            job.setErrorMessage(e.getMessage());
            job.setCompletedAt(LocalDateTime.now());
            analysisJobRepository.save(job);
        }
    }
}
