package com.devpilot.debugging.controller;

import com.devpilot.debugging.dto.DebugRequest;
import com.devpilot.debugging.dto.DebugResponse;
import com.devpilot.debugging.service.DebuggerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/repositories/{id}/debug")
public class DebuggerController {

    private final DebuggerService debuggerService;

    public DebuggerController(DebuggerService debuggerService) {
        this.debuggerService = debuggerService;
    }

    @PostMapping
    public ResponseEntity<DebugResponse> debugError(
            @PathVariable Long id,
            @RequestBody DebugRequest request) {
        
        DebugResponse response = debuggerService.debug(id, request);
        return ResponseEntity.ok(response);
    }
}
