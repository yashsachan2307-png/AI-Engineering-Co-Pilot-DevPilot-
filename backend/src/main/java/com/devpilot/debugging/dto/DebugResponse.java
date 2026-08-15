package com.devpilot.debugging.dto;

import java.util.List;

public class DebugResponse {
    private String rootCause;
    private String evidence;
    private List<String> relevantFiles;
    private List<String> likelyCauses;
    private String suggestedFix;
    private String potentialSideEffects;
    private String prevention;

    public String getRootCause() {
        return rootCause;
    }

    public void setRootCause(String rootCause) {
        this.rootCause = rootCause;
    }

    public String getEvidence() {
        return evidence;
    }

    public void setEvidence(String evidence) {
        this.evidence = evidence;
    }

    public List<String> getRelevantFiles() {
        return relevantFiles;
    }

    public void setRelevantFiles(List<String> relevantFiles) {
        this.relevantFiles = relevantFiles;
    }

    public List<String> getLikelyCauses() {
        return likelyCauses;
    }

    public void setLikelyCauses(List<String> likelyCauses) {
        this.likelyCauses = likelyCauses;
    }

    public String getSuggestedFix() {
        return suggestedFix;
    }

    public void setSuggestedFix(String suggestedFix) {
        this.suggestedFix = suggestedFix;
    }

    public String getPotentialSideEffects() {
        return potentialSideEffects;
    }

    public void setPotentialSideEffects(String potentialSideEffects) {
        this.potentialSideEffects = potentialSideEffects;
    }

    public String getPrevention() {
        return prevention;
    }

    public void setPrevention(String prevention) {
        this.prevention = prevention;
    }
}
