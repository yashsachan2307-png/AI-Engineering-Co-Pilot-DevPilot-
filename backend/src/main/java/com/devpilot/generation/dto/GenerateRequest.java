package com.devpilot.generation.dto;

public class GenerateRequest {
    private String prompt;

    public GenerateRequest() {
    }

    public GenerateRequest(String prompt) {
        this.prompt = prompt;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }
}
