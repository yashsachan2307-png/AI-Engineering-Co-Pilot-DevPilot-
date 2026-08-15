package com.devpilot.securityscanner.dto;

import com.devpilot.securityscanner.SecurityFinding;
import java.util.List;

public class SecurityScanResponse {
    private List<SecurityFinding> findings;

    public SecurityScanResponse() {}

    public SecurityScanResponse(List<SecurityFinding> findings) {
        this.findings = findings;
    }

    public List<SecurityFinding> getFindings() { return findings; }
    public void setFindings(List<SecurityFinding> findings) { this.findings = findings; }
}
