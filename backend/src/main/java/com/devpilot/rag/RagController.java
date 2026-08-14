package com.devpilot.rag;

import com.devpilot.github.GitHubAccount;
import com.devpilot.github.GitHubAccountRepository;
import com.devpilot.rag.dto.RagQueryRequest;
import com.devpilot.rag.dto.RagQueryResponse;
import com.devpilot.repository.Repository;
import com.devpilot.repository.RepositoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/repositories/{repositoryId}/rag")
public class RagController {

    private final RagService ragService;
    private final RepositoryRepository repositoryRepository;
    private final GitHubAccountRepository gitHubAccountRepository;

    public RagController(RagService ragService,
                         RepositoryRepository repositoryRepository,
                         GitHubAccountRepository gitHubAccountRepository) {
        this.ragService = ragService;
        this.repositoryRepository = repositoryRepository;
        this.gitHubAccountRepository = gitHubAccountRepository;
    }

    private void checkAccess(Long repositoryId, Long userId) {
        GitHubAccount account = gitHubAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("GitHub account not linked"));
        Repository repo = repositoryRepository.findById(repositoryId)
                .orElseThrow(() -> new RuntimeException("Repository not found"));
        if (!repo.getGithubAccountId().equals(account.getId())) {
            throw new RuntimeException("Unauthorized");
        }
    }

    @PostMapping("/index")
    public ResponseEntity<?> startIndexing(
            @PathVariable Long repositoryId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        try {
            checkAccess(repositoryId, userId);
            ragService.indexRepositoryAsync(repositoryId);
            return ResponseEntity.ok(Map.of("status", "QUEUED"));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(403).body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getIndexStatus(
            @PathVariable Long repositoryId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        try {
            checkAccess(repositoryId, userId);
            String status = ragService.getIndexStatus(repositoryId);
            return ResponseEntity.ok(Map.of("status", status));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(403).body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/query")
    public ResponseEntity<?> queryRepository(
            @PathVariable Long repositoryId,
            @RequestBody RagQueryRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        try {
            checkAccess(repositoryId, userId);
            if (request == null || request.getQuery() == null || request.getQuery().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Query cannot be empty"));
            }
            RagQueryResponse response = ragService.queryRepository(repositoryId, request.getQuery());
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(403).body(Map.of("error", ex.getMessage()));
        }
    }
}
