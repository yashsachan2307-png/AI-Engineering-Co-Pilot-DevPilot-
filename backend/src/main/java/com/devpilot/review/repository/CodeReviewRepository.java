package com.devpilot.review.repository;

import com.devpilot.review.domain.CodeReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CodeReviewRepository extends JpaRepository<CodeReview, Long> {
    List<CodeReview> findByRepositoryIdOrderByCreatedAtDesc(Long repositoryId);
}
