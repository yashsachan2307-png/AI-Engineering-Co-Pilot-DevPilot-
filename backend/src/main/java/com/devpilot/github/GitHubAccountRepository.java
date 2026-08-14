package com.devpilot.github;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GitHubAccountRepository extends JpaRepository<GitHubAccount, Long> {
    Optional<GitHubAccount> findByUserId(Long userId);
    Optional<GitHubAccount> findByGithubId(Long githubId);
}
