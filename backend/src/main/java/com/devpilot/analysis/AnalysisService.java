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
    private final SseService sseService;

    public AnalysisService(AnalysisJobRepository analysisJobRepository,
                           CodeSymbolRepository codeSymbolRepository,
                           RepositoryRepository repositoryRepository,
                           RepositoryFileRepository repositoryFileRepository,
                           GitHubAccountRepository gitHubAccountRepository,
                           List<CodeParser> parsers,
                           SseService sseService) {
        this.analysisJobRepository = analysisJobRepository;
        this.codeSymbolRepository = codeSymbolRepository;
        this.repositoryRepository = repositoryRepository;
        this.repositoryFileRepository = repositoryFileRepository;
        this.gitHubAccountRepository = gitHubAccountRepository;
        this.parsers = parsers;
        this.sseService = sseService;
    }

    @Transactional
    public AnalysisJob startAnalysis(Long repositoryId, Long userId, String commitSha) {
        // Idempotency check
        if (commitSha != null && !commitSha.isEmpty()) {
            Optional<AnalysisJob> prevJob = analysisJobRepository.findFirstByRepositoryIdOrderByStartedAtDesc(repositoryId);
            if (prevJob.isPresent() && "COMPLETED".equals(prevJob.get().getStatus()) && commitSha.equals(prevJob.get().getCommitSha())) {
                return prevJob.get(); // Already processed
            }
        }

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
        job.setCurrentStep("Initializing");
        job.setProgressPercentage(0);
        job.setCommitSha(commitSha);
        job = analysisJobRepository.save(job);

        // Trigger async process
        processAnalysisAsync(job.getId(), repositoryId);

        return job;
    }

    @Async
    @org.springframework.cache.annotation.CacheEvict(value = "architecture", key = "#repositoryId")
    public void processAnalysisAsync(Long jobId, Long repositoryId) {
        AnalysisJob job = analysisJobRepository.findById(jobId).orElse(null);
        if (job == null) return;

        try {
            updateJobStatus(job, "PROCESSING", "Fetching files...", 10);

            // Clear existing symbols before analysis
            codeSymbolRepository.deleteByRepositoryId(repositoryId);

            List<RepositoryFile> files = repositoryFileRepository.findByRepositoryId(repositoryId);
            List<CodeSymbol> allSymbols = new ArrayList<>();
            
            updateJobStatus(job, "PROCESSING", "Parsing source code...", 30);

            int total = files.size();
            for (int i = 0; i < total; i++) {
                RepositoryFile file = files.get(i);
                for (CodeParser parser : parsers) {
                    if (parser.supports(file.getLanguage())) {
                        List<CodeSymbol> symbols = parser.parse(file);
                        allSymbols.addAll(symbols);
                        break; // Stop after first supporting parser
                    }
                }
                
                if (i % Math.max(1, total / 10) == 0) {
                    int progress = 30 + (int) ((i / (double) total) * 40); // 30% to 70%
                    updateJobStatus(job, "PROCESSING", "Parsing source code...", progress);
                }
            }
            
            updateJobStatus(job, "PROCESSING", "Saving symbols...", 75);
            codeSymbolRepository.saveAll(allSymbols);

            updateJobStatus(job, "PROCESSING", "Building repository index...", 90);
            
            // Simulating further static analysis / embeddings steps here
            Thread.sleep(1000); 

            job.setStatus("COMPLETED");
            job.setCurrentStep("Completed");
            job.setProgressPercentage(100);
            job.setCompletedAt(LocalDateTime.now());
            analysisJobRepository.save(job);
            
            sseService.sendProgress(job.getId(), job.getCurrentStep(), job.getProgressPercentage(), job.getStatus(), null);

        } catch (Exception e) {
            job.setStatus("FAILED");
            job.setErrorMessage(e.getMessage());
            job.setCurrentStep("Failed");
            job.setCompletedAt(LocalDateTime.now());
            analysisJobRepository.save(job);
            
            sseService.sendProgress(job.getId(), job.getCurrentStep(), job.getProgressPercentage(), job.getStatus(), job.getErrorMessage());
        }
    }
    
    private void updateJobStatus(AnalysisJob job, String status, String step, int percentage) {
        job.setStatus(status);
        job.setCurrentStep(step);
        job.setProgressPercentage(percentage);
        analysisJobRepository.save(job);
        sseService.sendProgress(job.getId(), step, percentage, status, null);
    }

    public SseService getSseService() {
        return sseService;
    }
}
