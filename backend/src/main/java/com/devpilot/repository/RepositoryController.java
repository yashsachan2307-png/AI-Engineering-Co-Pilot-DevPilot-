package com.devpilot.repository;

import java.util.List;

import com.devpilot.github.GitHubAccount;
import com.devpilot.github.GitHubAccountRepository;
import com.devpilot.github.GitHubService;
import com.devpilot.github.dto.GitHubRepositoryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/repositories")
public class RepositoryController {

    private final GitHubService gitHubService;
    private final GitHubAccountRepository gitHubAccountRepository;
    private final RepositoryRepository repositoryRepository;
    private final RepositoryFileRepository repositoryFileRepository;

    public RepositoryController(GitHubService gitHubService, 
                                GitHubAccountRepository gitHubAccountRepository,
                                RepositoryRepository repositoryRepository,
                                RepositoryFileRepository repositoryFileRepository) {
        this.gitHubService = gitHubService;
        this.gitHubAccountRepository = gitHubAccountRepository;
        this.repositoryRepository = repositoryRepository;
        this.repositoryFileRepository = repositoryFileRepository;
    }

    @org.springframework.web.bind.annotation.GetMapping
    public ResponseEntity<?> getUserRepositories(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        Optional<GitHubAccount> account = gitHubAccountRepository.findByUserId(userId);
        if (account.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        List<Repository> repos = repositoryRepository.findByGithubAccountId(account.get().getId());
        return ResponseEntity.ok(repos);
    }

    @PostMapping("/import")
    @Transactional
    public ResponseEntity<?> importRepository(
            @RequestBody Map<String, Long> payload,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long userId = Long.parseLong(userDetails.getUsername());
        Long githubRepositoryId = payload.get("githubId");
        
        if (githubRepositoryId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "githubId is required"));
        }

        GitHubAccount account = gitHubAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("GitHub account not connected"));

        // Check if already imported
        Optional<Repository> existing = repositoryRepository.findByGithubIdAndGithubAccountId(githubRepositoryId, account.getId());
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Repository already imported"));
        }

        // Fetch details from GitHub
        GitHubRepositoryResponse repoDetails = gitHubService.fetchRepositoryDetails(userId, githubRepositoryId);

        // Save to DB
        Repository repository = new Repository();
        repository.setGithubAccountId(account.getId());
        repository.setGithubId(repoDetails.getId());
        repository.setName(repoDetails.getName());
        repository.setOwner(repoDetails.getOwner().getLogin());
        repository.setDescription(repoDetails.getDescription());
        repository.setDefaultBranch(repoDetails.getDefaultBranch() != null ? repoDetails.getDefaultBranch() : "main");
        repository.setVisibility(repoDetails.getVisibility() != null ? repoDetails.getVisibility() : "private");
        repository.setLanguage(repoDetails.getLanguage());
        repository.setGithubUrl(repoDetails.getHtmlUrl());
        repository.setGithubUpdatedAt(repoDetails.getUpdatedAt() != null ? repoDetails.getUpdatedAt().toLocalDateTime() : null);

        Repository savedRepo = repositoryRepository.save(repository);
        return ResponseEntity.ok(savedRepo);
    }

    @org.springframework.web.bind.annotation.GetMapping("/{id}/files")
    public ResponseEntity<?> getRepositoryFiles(
            @org.springframework.web.bind.annotation.PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long userId = Long.parseLong(userDetails.getUsername());
        GitHubAccount account = gitHubAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("GitHub account not connected"));
                
        Repository repo = repositoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Repository not found"));
                
        if (!repo.getGithubAccountId().equals(account.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Unauthorized"));
        }
        
        // Exclude content for the tree list
        List<RepositoryFileSummary> files = repositoryFileRepository.findSummariesByRepositoryId(id);
        
        return ResponseEntity.ok(files);
    }
    
    @org.springframework.web.bind.annotation.GetMapping("/{id}/files/{fileId}")
    public ResponseEntity<?> getRepositoryFile(
            @org.springframework.web.bind.annotation.PathVariable Long id,
            @org.springframework.web.bind.annotation.PathVariable Long fileId,
            @AuthenticationPrincipal UserDetails userDetails) {
            
        Long userId = Long.parseLong(userDetails.getUsername());
        GitHubAccount account = gitHubAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("GitHub account not connected"));
                
        Repository repo = repositoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Repository not found"));
                
        if (!repo.getGithubAccountId().equals(account.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Unauthorized"));
        }
        
        RepositoryFile file = repositoryFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
                
        if (!file.getRepositoryId().equals(id)) {
            return ResponseEntity.badRequest().body(Map.of("error", "File does not belong to this repository"));
        }
        
        return ResponseEntity.ok(file);
    }
}
