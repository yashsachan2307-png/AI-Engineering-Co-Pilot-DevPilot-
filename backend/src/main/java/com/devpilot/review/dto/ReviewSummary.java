package com.devpilot.review.dto;

import com.devpilot.review.domain.CodeReview;
import com.devpilot.review.domain.ReviewFinding;

import java.util.List;

public class ReviewSummary {
    private CodeReview review;
    private List<ReviewFinding> findings;
    private int criticalCount;
    private int highCount;
    private int mediumCount;
    private int lowCount;

    public ReviewSummary(CodeReview review, List<ReviewFinding> findings) {
        this.review = review;
        this.findings = findings;
        
        for (ReviewFinding finding : findings) {
            if (finding.getSeverity() == null) continue;
            switch (finding.getSeverity().toUpperCase()) {
                case "CRITICAL": criticalCount++; break;
                case "HIGH": highCount++; break;
                case "MEDIUM": mediumCount++; break;
                case "LOW": lowCount++; break;
            }
        }
    }

    public CodeReview getReview() {
        return review;
    }

    public void setReview(CodeReview review) {
        this.review = review;
    }

    public List<ReviewFinding> getFindings() {
        return findings;
    }

    public void setFindings(List<ReviewFinding> findings) {
        this.findings = findings;
    }

    public int getCriticalCount() {
        return criticalCount;
    }

    public void setCriticalCount(int criticalCount) {
        this.criticalCount = criticalCount;
    }

    public int getHighCount() {
        return highCount;
    }

    public void setHighCount(int highCount) {
        this.highCount = highCount;
    }

    public int getMediumCount() {
        return mediumCount;
    }

    public void setMediumCount(int mediumCount) {
        this.mediumCount = mediumCount;
    }

    public int getLowCount() {
        return lowCount;
    }

    public void setLowCount(int lowCount) {
        this.lowCount = lowCount;
    }
}
