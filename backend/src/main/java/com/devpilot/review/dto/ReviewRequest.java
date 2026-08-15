package com.devpilot.review.dto;

public class ReviewRequest {
    private String fileOrContext;
    private String codeSnippet;

    public String getFileOrContext() {
        return fileOrContext;
    }

    public void setFileOrContext(String fileOrContext) {
        this.fileOrContext = fileOrContext;
    }

    public String getCodeSnippet() {
        return codeSnippet;
    }

    public void setCodeSnippet(String codeSnippet) {
        this.codeSnippet = codeSnippet;
    }
}
