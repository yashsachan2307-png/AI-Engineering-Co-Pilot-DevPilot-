package com.devpilot.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepositoryFileRepository extends JpaRepository<RepositoryFile, Long> {
    List<RepositoryFile> findByRepositoryId(Long repositoryId);
    
    // Projection for tree view without content
    List<RepositoryFileSummary> findSummariesByRepositoryId(Long repositoryId);
    
    // Paginated for large repositories (security scanning)
    Page<RepositoryFile> findByRepositoryId(Long repositoryId, Pageable pageable);
    
    // Exact file lookup
    java.util.Optional<RepositoryFile> findByRepositoryIdAndPath(Long repositoryId, String path);
    
    // Delete by repo
    void deleteByRepositoryId(Long repositoryId);
}
