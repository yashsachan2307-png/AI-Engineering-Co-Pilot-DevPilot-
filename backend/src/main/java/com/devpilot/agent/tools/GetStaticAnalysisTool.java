package com.devpilot.agent.tools;

import com.devpilot.analysis.StaticAnalysisFinding;
import com.devpilot.analysis.StaticAnalysisFindingRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class GetStaticAnalysisTool implements AgentTool {

    private final StaticAnalysisFindingRepository staticAnalysisFindingRepository;

    public GetStaticAnalysisTool(StaticAnalysisFindingRepository staticAnalysisFindingRepository) {
        this.staticAnalysisFindingRepository = staticAnalysisFindingRepository;
    }

    @Override
    public String getName() {
        return "getStaticAnalysis";
    }

    @Override
    public String getDescription() {
        return "Retrieve static analysis findings (code smells, complexity, etc.) for the repository.";
    }

    @Override
    public String getInputSchema() {
        return "{\"type\":\"object\",\"properties\":{}}";
    }

    @Override
    public String execute(Map<String, Object> input, Long repositoryId) {
        List<StaticAnalysisFinding> findings = staticAnalysisFindingRepository.findByRepositoryId(repositoryId);
        if (findings.isEmpty()) {
            return "No static analysis findings for this repository.";
        }

        StringBuilder sb = new StringBuilder("Static Analysis Findings:\n");
        for (StaticAnalysisFinding finding : findings) {
            sb.append(String.format("- [%s] %s (File: %s:%d) - %s. %s\n",
                    finding.getSeverity(),
                    finding.getTitle(),
                    finding.getFileName(),
                    finding.getLine(),
                    finding.getDescription(),
                    finding.getRecommendation()
            ));
        }

        return sb.toString();
    }
}
