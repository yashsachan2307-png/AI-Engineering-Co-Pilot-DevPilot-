package com.devpilot.analysis;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AnalysisJobRepository extends JpaRepository<AnalysisJob, Long> {
    Optional<AnalysisJob> findFirstByRepositoryIdOrderByStartedAtDesc(Long repositoryId);
    Optional<AnalysisJob> findByRepositoryIdAndType(Long repositoryId, String type);
    Optional<AnalysisJob> findFirstByRepositoryIdAndTypeOrderByStartedAtDesc(Long repositoryId, String type);
}

