package com.devpilot.architecture.dto;

public class ArchitectureExplainRequest {
    private String nodeId;
    private String question;
    private ArchitectureAnalysis contextGraph;

    public String getNodeId() { return nodeId; }
    public void setNodeId(String nodeId) { this.nodeId = nodeId; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public ArchitectureAnalysis getContextGraph() { return contextGraph; }
    public void setContextGraph(ArchitectureAnalysis contextGraph) { this.contextGraph = contextGraph; }
}
