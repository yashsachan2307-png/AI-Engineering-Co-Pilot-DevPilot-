package com.devpilot.review.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "review_findings")
public class ReviewFinding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long codeReviewId;

    private String severity; // CRITICAL, HIGH, MEDIUM, LOW
    private String category; // BUG, SECURITY, PERFORMANCE, MAINTAINABILITY, DESIGN, TESTING
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String file;
    private Integer startLine; // Optional line or block
    private Integer endLine;
    
    @Column(columnDefinition = "TEXT")
    private String evidence;
    
    @Column(columnDefinition = "TEXT")
    private String recommendation;
    
    private String confidence; // HIGH, MEDIUM, LOW
    
    private String status; // PENDING, REVIEWED, DISMISSED

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = "PENDING";
        }
    }

    // Getters and Setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCodeReviewId() { return codeReviewId; }
    public void setCodeReviewId(Long codeReviewId) { this.codeReviewId = codeReviewId; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getFile() { return file; }
    public void setFile(String file) { this.file = file; }

    public Integer getStartLine() { return startLine; }
    public void setStartLine(Integer startLine) { this.startLine = startLine; }

    public Integer getEndLine() { return endLine; }
    public void setEndLine(Integer endLine) { this.endLine = endLine; }

    public String getEvidence() { return evidence; }
    public void setEvidence(String evidence) { this.evidence = evidence; }

    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }

    public String getConfidence() { return confidence; }
    public void setConfidence(String confidence) { this.confidence = confidence; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
