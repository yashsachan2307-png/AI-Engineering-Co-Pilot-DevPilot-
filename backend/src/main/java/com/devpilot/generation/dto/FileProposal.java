package com.devpilot.generation.dto;

public class FileProposal {
    private String path;
    private String oldCode;
    private String newCode;
    private String explanation;

    public FileProposal() {
    }

    public FileProposal(String path, String oldCode, String newCode, String explanation) {
        this.path = path;
        this.oldCode = oldCode;
        this.newCode = newCode;
        this.explanation = explanation;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getOldCode() {
        return oldCode;
    }

    public void setOldCode(String oldCode) {
        this.oldCode = oldCode;
    }

    public String getNewCode() {
        return newCode;
    }

    public void setNewCode(String newCode) {
        this.newCode = newCode;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}
