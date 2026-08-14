package com.devpilot.rag.dto;

import java.util.List;

public class RagQueryResponse {
    private String answer;
    private List<RagSourceCitation> sources;

    public RagQueryResponse() {
    }

    public RagQueryResponse(String answer, List<RagSourceCitation> sources) {
        this.answer = answer;
        this.sources = sources;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public List<RagSourceCitation> getSources() {
        return sources;
    }

    public void setSources(List<RagSourceCitation> sources) {
        this.sources = sources;
    }
}
