package com.devpilot.ingestion;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/repositories/{repositoryId}")
public class IngestionController {

    private final IngestionService ingestionService;
    private final IngestionJobRepository ingestionJobRepository;

    public IngestionController(IngestionService ingestionService, IngestionJobRepository ingestionJobRepository) {
        this.ingestionService = ingestionService;
        this.ingestionJobRepository = ingestionJobRepository;
    }

    @PostMapping("/ingest")
    public ResponseEntity<?> startIngestion(
            @PathVariable Long repositoryId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long userId = Long.parseLong(userDetails.getUsername());
        
        try {
            IngestionJob job = ingestionService.startIngestion(repositoryId, userId);
            return ResponseEntity.ok(job);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/ingestion-status")
    public ResponseEntity<?> getIngestionStatus(@PathVariable Long repositoryId) {
        Optional<IngestionJob> job = ingestionJobRepository.findFirstByRepositoryIdOrderByStartedAtDesc(repositoryId);
        if (job.isEmpty()) {
            return ResponseEntity.ok(Map.of("status", "NONE"));
        }
        return ResponseEntity.ok(job.get());
    }
}
