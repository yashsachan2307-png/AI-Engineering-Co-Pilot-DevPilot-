package com.devpilot.review;

import com.devpilot.review.domain.CodeReview;
import com.devpilot.review.domain.ReviewFinding;
import com.devpilot.review.dto.ReviewRequest;
import com.devpilot.review.dto.ReviewSummary;
import com.devpilot.review.repository.CodeReviewRepository;
import com.devpilot.review.repository.ReviewFindingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class ReviewController {

    private final ReviewService reviewService;
    private final CodeReviewRepository reviewRepository;
    private final ReviewFindingRepository findingRepository;

    public ReviewController(ReviewService reviewService,
                            CodeReviewRepository reviewRepository,
                            ReviewFindingRepository findingRepository) {
        this.reviewService = reviewService;
        this.reviewRepository = reviewRepository;
        this.findingRepository = findingRepository;
    }

    @PostMapping("/repositories/{repositoryId}/reviews")
    public ResponseEntity<ReviewSummary> createReview(
            @PathVariable Long repositoryId,
            @RequestBody ReviewRequest request) {
        
        ReviewSummary summary = reviewService.performReview(repositoryId, request);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/repositories/{repositoryId}/reviews")
    public ResponseEntity<List<CodeReview>> getReviews(@PathVariable Long repositoryId) {
        List<CodeReview> reviews = reviewRepository.findByRepositoryIdOrderByCreatedAtDesc(repositoryId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/repositories/{repositoryId}/reviews/{reviewId}")
    public ResponseEntity<ReviewSummary> getReviewDetails(@PathVariable Long repositoryId, @PathVariable Long reviewId) {
        Optional<CodeReview> reviewOpt = reviewRepository.findById(reviewId);
        if (reviewOpt.isEmpty() || !reviewOpt.get().getRepositoryId().equals(repositoryId)) {
            return ResponseEntity.notFound().build();
        }
        CodeReview review = reviewOpt.get();
        List<ReviewFinding> findings = findingRepository.findByCodeReviewId(reviewId);
        
        return ResponseEntity.ok(new ReviewSummary(review, findings));
    }

    @PatchMapping("/reviews/findings/{findingId}")
    public ResponseEntity<ReviewFinding> updateFindingStatus(
            @PathVariable Long findingId,
            @RequestBody Map<String, String> updates) {
        
        Optional<ReviewFinding> findingOpt = findingRepository.findById(findingId);
        if (findingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        ReviewFinding finding = findingOpt.get();
        if (updates.containsKey("status")) {
            finding.setStatus(updates.get("status"));
            finding = findingRepository.save(finding);
        }
        
        return ResponseEntity.ok(finding);
    }
}
