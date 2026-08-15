package com.devpilot.architecture.service;

import com.devpilot.analysis.CodeSymbol;
import com.devpilot.analysis.CodeSymbolRepository;
import com.devpilot.architecture.dto.ArchitectureAnalysis;
import com.devpilot.architecture.dto.GraphEdge;
import com.devpilot.architecture.dto.GraphNode;
import com.devpilot.rag.llm.LlmService;
import com.devpilot.repository.RepositoryFile;
import com.devpilot.repository.RepositoryFileRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ArchitectureService {

    @Autowired
    private CodeSymbolRepository codeSymbolRepository;

    @Autowired
    private RepositoryFileRepository fileRepository;

    @Autowired
    private LlmService llmService;

    @org.springframework.cache.annotation.Cacheable("architecture")
    public ArchitectureAnalysis analyzeArchitecture(Long repositoryId) {
        List<CodeSymbol> symbols = codeSymbolRepository.findByRepositoryId(repositoryId);
        List<com.devpilot.repository.RepositoryFileSummary> files = fileRepository.findSummariesByRepositoryId(repositoryId);

        Map<Long, String> fileIdToPath = files.stream().collect(Collectors.toMap(com.devpilot.repository.RepositoryFileSummary::getId, com.devpilot.repository.RepositoryFileSummary::getPath));
        
        List<GraphNode> nodes = new ArrayList<>();
        List<GraphEdge> edges = new ArrayList<>();
        
        // Find all classes/interfaces
        Map<String, GraphNode> nodeMap = new HashMap<>();
        Map<Long, String> fileIdToClass = new HashMap<>();

        for (CodeSymbol sym : symbols) {
            if ("CLASS".equals(sym.getType()) || "INTERFACE".equals(sym.getType())) {
                String fullPath = fileIdToPath.get(sym.getRepositoryFileId());
                String id = sym.getRepositoryFileId() + "-" + sym.getName();
                
                GraphNode node = new GraphNode(id, sym.getName(), sym.getType());
                nodes.add(node);
                nodeMap.put(sym.getName(), node);
                fileIdToClass.put(sym.getRepositoryFileId(), sym.getName());
            }
        }

        // Build edges based on imports
        for (CodeSymbol sym : symbols) {
            if ("IMPORT".equals(sym.getType())) {
                String importedClass = extractClassNameFromImport(sym.getName());
                
                // If we have the imported class in our nodeMap, create an edge
                if (importedClass != null && nodeMap.containsKey(importedClass)) {
                    String sourceClassName = fileIdToClass.get(sym.getRepositoryFileId());
                    if (sourceClassName != null) {
                        GraphNode sourceNode = nodeMap.get(sourceClassName);
                        GraphNode targetNode = nodeMap.get(importedClass);
                        if (sourceNode != null && targetNode != null && !sourceNode.getId().equals(targetNode.getId())) {
                            edges.add(new GraphEdge(sourceNode.getId(), targetNode.getId(), "DEPENDENCY"));
                        }
                    }
                }
            }
        }

        // Parse package.json or pom.xml for external dependencies
        for (com.devpilot.repository.RepositoryFileSummary file : files) {
            if (file.getPath().endsWith("pom.xml") || file.getPath().endsWith("package.json")) {
                RepositoryFile fullFile = fileRepository.findById(file.getId()).orElse(null);
                if (fullFile != null && fullFile.getContent() != null) {
                    GraphNode configNode = new GraphNode("config-" + file.getId(), file.getPath().endsWith("pom.xml") ? "pom.xml" : "package.json", "MODULE");
                    nodes.add(configNode);
                    
                    List<String> deps = parseDependencies(fullFile.getContent(), file.getPath());
                    for (String dep : deps) {
                        String depNodeId = "ext-" + dep;
                        if (!nodeMap.containsKey(depNodeId)) {
                            GraphNode extNode = new GraphNode(depNodeId, dep, "PACKAGE");
                            nodes.add(extNode);
                            nodeMap.put(depNodeId, extNode);
                        }
                        edges.add(new GraphEdge(configNode.getId(), depNodeId, "DEPENDENCY"));
                    }
                }
            }
        }

        // Calculate coupling
        Map<String, Integer> inDegree = new HashMap<>();
        Map<String, Integer> outDegree = new HashMap<>();
        for (GraphEdge edge : edges) {
            outDegree.put(edge.getSource(), outDegree.getOrDefault(edge.getSource(), 0) + 1);
            inDegree.put(edge.getTarget(), inDegree.getOrDefault(edge.getTarget(), 0) + 1);
        }

        for (GraphNode node : nodes) {
            node.setInDegree(inDegree.getOrDefault(node.getId(), 0));
            node.setOutDegree(outDegree.getOrDefault(node.getId(), 0));
            
            List<String> metrics = new ArrayList<>();
            metrics.add("In: " + node.getInDegree());
            metrics.add("Out: " + node.getOutDegree());
            if (node.getInDegree() > 5) metrics.add("High Incoming Coupling");
            if (node.getOutDegree() > 5) metrics.add("High Outgoing Coupling");
            
            node.setMetrics(metrics);
        }

        List<String> highlyCoupled = nodes.stream()
                .filter(n -> n.getInDegree() + n.getOutDegree() > 10)
                .map(GraphNode::getName)
                .collect(Collectors.toList());

        // Simple circular dependency detection (A -> B and B -> A)
        List<String> circularDeps = new ArrayList<>();
        Set<String> edgeSet = edges.stream().map(e -> e.getSource() + "->" + e.getTarget()).collect(Collectors.toSet());
        for (GraphEdge edge : edges) {
            if (edgeSet.contains(edge.getTarget() + "->" + edge.getSource())) {
                String cycle = edge.getSource() + " <-> " + edge.getTarget();
                if (!circularDeps.contains(edge.getTarget() + " <-> " + edge.getSource()) && !circularDeps.contains(cycle)) {
                    circularDeps.add(cycle);
                }
            }
        }

        return new ArchitectureAnalysis(nodes, edges, circularDeps, highlyCoupled);
    }

    private String extractClassNameFromImport(String importStatement) {
        if (importStatement == null) return null;
        String[] parts = importStatement.split("\\.");
        return parts.length > 0 ? parts[parts.length - 1] : null;
    }

    private List<String> parseDependencies(String content, String path) {
        List<String> deps = new ArrayList<>();
        if (content == null) return deps;
        
        if (path.endsWith("pom.xml")) {
            Matcher m = Pattern.compile("<artifactId>(.*?)</artifactId>").matcher(content);
            while (m.find()) {
                deps.add(m.group(1));
            }
        } else if (path.endsWith("package.json")) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                Map<String, Object> map = mapper.readValue(content, Map.class);
                if (map.containsKey("dependencies")) {
                    deps.addAll(((Map<String, String>) map.get("dependencies")).keySet());
                }
            } catch (Exception e) {
                // Ignore parse errors
            }
        }
        return deps;
    }

    public String explainArchitecture(Long repositoryId, String nodeId, String question, ArchitectureAnalysis graph) {
        GraphNode targetNode = graph.getNodes().stream().filter(n -> n.getId().equals(nodeId)).findFirst().orElse(null);
        
        StringBuilder context = new StringBuilder();
        context.append("Architecture Data for node ").append(nodeId).append(":\n");
        if (targetNode != null) {
            context.append("Name: ").append(targetNode.getName()).append("\n");
            context.append("Type: ").append(targetNode.getType()).append("\n");
            context.append("Coupling Metrics: In=").append(targetNode.getInDegree()).append(", Out=").append(targetNode.getOutDegree()).append("\n");
        }
        
        context.append("\nIncoming Dependencies:\n");
        graph.getEdges().stream().filter(e -> e.getTarget().equals(nodeId)).forEach(e -> {
            context.append("- ").append(e.getSource()).append("\n");
        });
        
        context.append("\nOutgoing Dependencies:\n");
        graph.getEdges().stream().filter(e -> e.getSource().equals(nodeId)).forEach(e -> {
            context.append("- ").append(e.getTarget()).append("\n");
        });
        
        context.append("\nCircular Dependencies Detected: ").append(graph.getCircularDependencies()).append("\n");
        context.append("Highly Coupled Modules: ").append(graph.getHighlyCoupledModules()).append("\n");

        String systemPrompt = "You are an AI Architecture Expert. Based ONLY on the provided deterministic architecture metrics and graph edges below, answer the user's question about the specific module. DO NOT invent classes, relationships, or files that do not exist in the data.";
        String userPrompt = "CONTEXT:\n" + context.toString() + "\n\nQUESTION:\n" + question;

        return llmService.generateResponse(systemPrompt, userPrompt);
    }
}
