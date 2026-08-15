package com.devpilot.securityscanner;

import com.devpilot.securityscanner.dto.SecurityExplainResponse;
import com.devpilot.securityscanner.dto.SecurityScanResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/repositories/{id}/security")
public class SecurityAnalysisController {

    @Autowired
    private SecurityScannerService scannerService;

    @Autowired
    private SecurityFindingRepository findingRepository;

    @GetMapping
    public ResponseEntity<SecurityScanResponse> getFindings(@PathVariable Long id) {
        List<SecurityFinding> findings = findingRepository.findByRepositoryId(id);
        return ResponseEntity.ok(new SecurityScanResponse(findings));
    }

    @PostMapping("/scan")
    public ResponseEntity<SecurityScanResponse> triggerScan(@PathVariable Long id) {
        List<SecurityFinding> findings = scannerService.scanRepository(id);
        return ResponseEntity.ok(new SecurityScanResponse(findings));
    }

    @PostMapping("/findings/{findingId}/explain")
    public ResponseEntity<SecurityExplainResponse> explainFinding(@PathVariable Long id, @PathVariable Long findingId) {
        SecurityExplainResponse response = scannerService.explainFinding(findingId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/findings/{findingId}/status")
    public ResponseEntity<SecurityFinding> updateStatus(@PathVariable Long id, @PathVariable Long findingId, @RequestBody Map<String, String> body) {
        SecurityFinding finding = findingRepository.findById(findingId).orElseThrow(() -> new RuntimeException("Finding not found"));
        if (body.containsKey("status")) {
            finding.setStatus(body.get("status"));
            findingRepository.save(finding);
        }
        return ResponseEntity.ok(finding);
    }
}
