package com.devpilot.analysis;

import com.devpilot.repository.RepositoryFile;
import com.devpilot.repository.RepositoryFileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StaticAnalysisService {

    @Autowired
    private RepositoryFileRepository fileRepository;

    @Autowired
    private StaticAnalysisFindingRepository findingRepository;

    @Autowired
    private AnalysisJobRepository jobRepository;

    @Autowired
    private List<StaticCodeAnalyzer> analyzers;

    @Async
    public void startStaticAnalysis(Long repositoryId) {
        // Update job status to PROCESSING
        AnalysisJob job = jobRepository.findByRepositoryIdAndType(repositoryId, "STATIC_ANALYSIS")
                .orElse(new AnalysisJob());
        job.setRepositoryId(repositoryId);
        job.setType("STATIC_ANALYSIS");
        job.setStatus("PROCESSING");
        jobRepository.save(job);

        try {
            // Delete old findings for this repo
            findingRepository.deleteByRepositoryId(repositoryId);

            // Find all files in the repository
            List<RepositoryFile> files = fileRepository.findByRepositoryId(repositoryId);

            for (RepositoryFile file : files) {
                // Find matching analyzers
                for (StaticCodeAnalyzer analyzer : analyzers) {
                    if (analyzer.supports(file.getLanguage())) {
                        List<StaticAnalysisFinding> findings = analyzer.analyze(file);
                        findingRepository.saveAll(findings);
                    }
                }
            }

            job.setStatus("COMPLETED");
            job.setCompletedAt(java.time.LocalDateTime.now());
        } catch (Exception e) {
            e.printStackTrace();
            job.setStatus("FAILED");
            job.setErrorMessage(e.getMessage());
            job.setCompletedAt(java.time.LocalDateTime.now());
        } finally {
            jobRepository.save(job);
        }
    }

    public String getStatus(Long repositoryId) {
        Optional<AnalysisJob> job = jobRepository.findByRepositoryIdAndType(repositoryId, "STATIC_ANALYSIS");
        return job.map(AnalysisJob::getStatus).orElse("NONE");
    }

    public List<StaticAnalysisFinding> getFindings(Long repositoryId) {
        return findingRepository.findByRepositoryId(repositoryId);
    }
}
