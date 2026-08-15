package com.devpilot.generation.controller;

import com.devpilot.generation.dto.GenerateRequest;
import com.devpilot.generation.dto.GenerateResponse;
import com.devpilot.generation.service.GenerationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/repositories/{repositoryId}/generate")
public class GenerationController {

    private final GenerationService generationService;

    public GenerationController(GenerationService generationService) {
        this.generationService = generationService;
    }

    @PostMapping
    public ResponseEntity<GenerateResponse> generateCode(
            @PathVariable Long repositoryId,
            @RequestBody GenerateRequest request) {
        GenerateResponse response = generationService.generateCode(repositoryId, request);
        return ResponseEntity.ok(response);
    }
}
