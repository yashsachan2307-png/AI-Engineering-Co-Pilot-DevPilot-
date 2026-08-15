package com.devpilot.architecture.dto;

public class GraphEdge {
    private String source;
    private String target;
    private String type; // IMPORT, EXTENDS, IMPLEMENTS, DEPENDENCY

    public GraphEdge() {}

    public GraphEdge(String source, String target, String type) {
        this.source = source;
        this.target = target;
        this.type = type;
    }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getTarget() { return target; }
    public void setTarget(String target) { this.target = target; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
