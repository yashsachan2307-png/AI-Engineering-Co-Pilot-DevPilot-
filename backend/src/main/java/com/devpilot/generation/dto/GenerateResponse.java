package com.devpilot.generation.dto;

import java.util.List;

public class GenerateResponse {
    private List<FileProposal> proposals;
    private String explanation;

    public GenerateResponse() {
    }

    public GenerateResponse(List<FileProposal> proposals, String explanation) {
        this.proposals = proposals;
        this.explanation = explanation;
    }

    public List<FileProposal> getProposals() {
        return proposals;
    }

    public void setProposals(List<FileProposal> proposals) {
        this.proposals = proposals;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}
