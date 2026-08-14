package com.devpilot.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

@org.springframework.stereotype.Repository
public interface RepositoryRepository extends JpaRepository<Repository, Long> {
    List<Repository> findByGithubAccountId(Long githubAccountId);
    Optional<Repository> findByGithubIdAndGithubAccountId(Long githubId, Long githubAccountId);
}
