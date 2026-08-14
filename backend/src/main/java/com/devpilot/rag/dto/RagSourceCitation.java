package com.devpilot.rag.dto;

public class RagSourceCitation {
    private String path;
    private Integer startLine;
    private Integer endLine;
    private String symbol;
    private String method;
    private String language;
    private String snippet;
    private Double score;

    public RagSourceCitation() {
    }

    public RagSourceCitation(String path, Integer startLine, Integer endLine, String symbol, String method, String language, String snippet, Double score) {
        this.path = path;
        this.startLine = startLine;
        this.endLine = endLine;
        this.symbol = symbol;
        this.method = method;
        this.language = language;
        this.snippet = snippet;
        this.score = score;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public Integer getStartLine() {
        return startLine;
    }

    public void setStartLine(Integer startLine) {
        this.startLine = startLine;
    }

    public Integer getEndLine() {
        return endLine;
    }

    public void setEndLine(Integer endLine) {
        this.endLine = endLine;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getSnippet() {
        return snippet;
    }

    public void setSnippet(String snippet) {
        this.snippet = snippet;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }
}
