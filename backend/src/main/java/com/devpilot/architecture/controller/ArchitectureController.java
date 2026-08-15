package com.devpilot.architecture.controller;

import com.devpilot.architecture.dto.ArchitectureAnalysis;
import com.devpilot.architecture.dto.ArchitectureExplainRequest;
import com.devpilot.architecture.dto.ArchitectureExplainResponse;
import com.devpilot.architecture.service.ArchitectureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/repositories")
public class ArchitectureController {

    @Autowired
    private ArchitectureService architectureService;

    @GetMapping("/{id}/architecture")
    public ResponseEntity<ArchitectureAnalysis> getArchitecture(@PathVariable Long id) {
        ArchitectureAnalysis analysis = architectureService.analyzeArchitecture(id);
        return ResponseEntity.ok(analysis);
    }

    @PostMapping("/{id}/architecture/explain")
    public ResponseEntity<ArchitectureExplainResponse> explainArchitecture(
            @PathVariable Long id,
            @RequestBody ArchitectureExplainRequest request) {
        
        String explanation = architectureService.explainArchitecture(id, request.getNodeId(), request.getQuestion(), request.getContextGraph());
        return ResponseEntity.ok(new ArchitectureExplainResponse(explanation));
    }
}
