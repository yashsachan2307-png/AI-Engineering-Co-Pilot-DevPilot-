package com.devpilot.architecture.dto;

public class ArchitectureExplainResponse {
    private String explanation;

    public ArchitectureExplainResponse() {}

    public ArchitectureExplainResponse(String explanation) {
        this.explanation = explanation;
    }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
