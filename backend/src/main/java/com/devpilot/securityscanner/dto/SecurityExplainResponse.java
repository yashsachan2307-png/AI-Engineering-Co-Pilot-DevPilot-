package com.devpilot.securityscanner.dto;

public class SecurityExplainResponse {
    private String explanation;
    private String recommendation;

    public SecurityExplainResponse() {}

    public SecurityExplainResponse(String explanation, String recommendation) {
        this.explanation = explanation;
        this.recommendation = recommendation;
    }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }
}
