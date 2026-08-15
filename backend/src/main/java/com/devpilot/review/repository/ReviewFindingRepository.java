package com.devpilot.review.repository;

import com.devpilot.review.domain.ReviewFinding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewFindingRepository extends JpaRepository<ReviewFinding, Long> {
    List<ReviewFinding> findByCodeReviewId(Long codeReviewId);
}
