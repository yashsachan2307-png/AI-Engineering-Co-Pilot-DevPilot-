package com.devpilot.architecture.dto;

import java.util.List;

public class ArchitectureAnalysis {
    private List<GraphNode> nodes;
    private List<GraphEdge> edges;
    private List<String> circularDependencies;
    private List<String> highlyCoupledModules;

    public ArchitectureAnalysis() {}

    public ArchitectureAnalysis(List<GraphNode> nodes, List<GraphEdge> edges, List<String> circularDependencies, List<String> highlyCoupledModules) {
        this.nodes = nodes;
        this.edges = edges;
        this.circularDependencies = circularDependencies;
        this.highlyCoupledModules = highlyCoupledModules;
    }

    public List<GraphNode> getNodes() { return nodes; }
    public void setNodes(List<GraphNode> nodes) { this.nodes = nodes; }

    public List<GraphEdge> getEdges() { return edges; }
    public void setEdges(List<GraphEdge> edges) { this.edges = edges; }

    public List<String> getCircularDependencies() { return circularDependencies; }
    public void setCircularDependencies(List<String> circularDependencies) { this.circularDependencies = circularDependencies; }

    public List<String> getHighlyCoupledModules() { return highlyCoupledModules; }
    public void setHighlyCoupledModules(List<String> highlyCoupledModules) { this.highlyCoupledModules = highlyCoupledModules; }
}
