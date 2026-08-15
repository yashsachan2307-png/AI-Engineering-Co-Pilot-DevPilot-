package com.devpilot.architecture.dto;

import java.util.List;

public class GraphNode {
    private String id;
    private String name;
    private String type; // CLASS, INTERFACE, PACKAGE, MODULE
    private int inDegree;
    private int outDegree;
    private List<String> metrics;

    public GraphNode() {}

    public GraphNode(String id, String name, String type) {
        this.id = id;
        this.name = name;
        this.type = type;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public int getInDegree() { return inDegree; }
    public void setInDegree(int inDegree) { this.inDegree = inDegree; }

    public int getOutDegree() { return outDegree; }
    public void setOutDegree(int outDegree) { this.outDegree = outDegree; }

    public List<String> getMetrics() { return metrics; }
    public void setMetrics(List<String> metrics) { this.metrics = metrics; }
}
