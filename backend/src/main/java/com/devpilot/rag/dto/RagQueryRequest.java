package com.devpilot.rag.dto;

public class RagQueryRequest {
    private String query;

    public RagQueryRequest() {
    }

    public RagQueryRequest(String query) {
        this.query = query;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }
}
