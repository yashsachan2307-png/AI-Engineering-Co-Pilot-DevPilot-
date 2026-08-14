package com.devpilot.analysis;

import com.devpilot.github.GitHubAccount;
import com.devpilot.github.GitHubAccountRepository;
import com.devpilot.repository.Repository;
import com.devpilot.repository.RepositoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/repositories/{repositoryId}")
public class AnalysisController {

    private final AnalysisService analysisService;
    private final AnalysisJobRepository analysisJobRepository;
    private final CodeSymbolRepository codeSymbolRepository;
    private final RepositoryRepository repositoryRepository;
    private final GitHubAccountRepository gitHubAccountRepository;
    private final StaticAnalysisService staticAnalysisService;

    public AnalysisController(AnalysisService analysisService, 
                              AnalysisJobRepository analysisJobRepository,
                              CodeSymbolRepository codeSymbolRepository,
                              RepositoryRepository repositoryRepository,
                              GitHubAccountRepository gitHubAccountRepository,
                              StaticAnalysisService staticAnalysisService) {
        this.analysisService = analysisService;
        this.analysisJobRepository = analysisJobRepository;
        this.codeSymbolRepository = codeSymbolRepository;
        this.repositoryRepository = repositoryRepository;
        this.gitHubAccountRepository = gitHubAccountRepository;
        this.staticAnalysisService = staticAnalysisService;
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

    @PostMapping("/analyze")
    public ResponseEntity<?> startAnalysis(
            @PathVariable Long repositoryId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        try {
            AnalysisJob job = analysisService.startAnalysis(repositoryId, userId);
            return ResponseEntity.ok(job);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/analysis")
    public ResponseEntity<?> getAnalysisStatus(
            @PathVariable Long repositoryId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        try {
            checkAccess(repositoryId, userId);
            Optional<AnalysisJob> job = analysisJobRepository.findFirstByRepositoryIdOrderByStartedAtDesc(repositoryId);
            if (job.isEmpty()) {
                return ResponseEntity.ok(Map.of("status", "NONE"));
            }
            return ResponseEntity.ok(job.get());
        } catch (RuntimeException ex) {
            return ResponseEntity.status(403).body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/metrics")
    public ResponseEntity<?> getMetrics(
            @PathVariable Long repositoryId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        try {
            checkAccess(repositoryId, userId);
            
            List<CodeSymbol> symbols = codeSymbolRepository.findByRepositoryId(repositoryId);
            
            Map<String, Long> metrics = new HashMap<>();
            metrics.put("classes", symbols.stream().filter(s -> "CLASS".equals(s.getType())).count());
            metrics.put("interfaces", symbols.stream().filter(s -> "INTERFACE".equals(s.getType())).count());
            metrics.put("methods", symbols.stream().filter(s -> "METHOD".equals(s.getType())).count());
            metrics.put("fields", symbols.stream().filter(s -> "FIELD".equals(s.getType())).count());
            metrics.put("imports", symbols.stream().filter(s -> "IMPORT".equals(s.getType())).count());
            
            return ResponseEntity.ok(metrics);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(403).body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/symbols")
    public ResponseEntity<?> getSymbols(
            @PathVariable Long repositoryId,
            @RequestParam(required = false) String type,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        try {
            checkAccess(repositoryId, userId);
            List<CodeSymbol> symbols = codeSymbolRepository.findByRepositoryId(repositoryId);
            if (type != null && !type.isEmpty()) {
                symbols = symbols.stream().filter(s -> type.equalsIgnoreCase(s.getType())).collect(Collectors.toList());
            }
            return ResponseEntity.ok(symbols);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(403).body(Map.of("error", ex.getMessage()));
        }
    }

    // --- Static Analysis Endpoints ---

    @PostMapping("/analysis/static")
    public ResponseEntity<?> startStaticAnalysis(
            @PathVariable Long repositoryId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        try {
            checkAccess(repositoryId, userId);
            staticAnalysisService.startStaticAnalysis(repositoryId);
            return ResponseEntity.ok(Map.of("status", "QUEUED"));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(403).body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/analysis/static-status")
    public ResponseEntity<?> getStaticAnalysisStatus(
            @PathVariable Long repositoryId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        try {
            checkAccess(repositoryId, userId);
            String status = staticAnalysisService.getStatus(repositoryId);
            return ResponseEntity.ok(Map.of("status", status));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(403).body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/analysis/findings")
    public ResponseEntity<?> getStaticAnalysisFindings(
            @PathVariable Long repositoryId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        try {
            checkAccess(repositoryId, userId);
            List<StaticAnalysisFinding> findings = staticAnalysisService.getFindings(repositoryId);
            return ResponseEntity.ok(findings);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(403).body(Map.of("error", ex.getMessage()));
        }
    }
}
