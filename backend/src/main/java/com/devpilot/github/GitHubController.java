package com.devpilot.github;

import com.devpilot.github.dto.GitHubRepositoryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/github")
public class GitHubController {

    private final GitHubService gitHubService;
    private final GitHubAccountRepository gitHubAccountRepository;

    public GitHubController(GitHubService gitHubService, GitHubAccountRepository gitHubAccountRepository) {
        this.gitHubService = gitHubService;
        this.gitHubAccountRepository = gitHubAccountRepository;
    }

    @GetMapping("/connect")
    public ResponseEntity<?> getConnectUrl() {
        return ResponseEntity.ok(Map.of("url", gitHubService.getAuthorizationUrl()));
    }

    @PostMapping("/callback")
    public ResponseEntity<?> handleCallback(
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        // Since we are using UserDetailsServiceImpl, the username is the User ID string.
        Long userId = Long.parseLong(userDetails.getUsername());
        String code = payload.get("code");
        
        GitHubAccount account = gitHubService.exchangeCodeForToken(code, userId);
        return ResponseEntity.ok(Map.of("success", true, "username", account.getUsername()));
    }

    @GetMapping("/repositories")
    public ResponseEntity<List<GitHubRepositoryResponse>> getRepositories(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        return ResponseEntity.ok(gitHubService.fetchUserRepositories(userId));
    }

    @GetMapping("/status")
    public ResponseEntity<?> getStatus(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        return gitHubAccountRepository.findByUserId(userId)
                .map(account -> ResponseEntity.ok(Map.of("connected", true, "username", account.getUsername())))
                .orElse(ResponseEntity.ok(Map.of("connected", false)));
    }
}
