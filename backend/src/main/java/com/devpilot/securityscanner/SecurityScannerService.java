package com.devpilot.securityscanner;

import com.devpilot.rag.llm.LlmService;
import com.devpilot.repository.RepositoryFile;
import com.devpilot.repository.RepositoryFileRepository;
import com.devpilot.securityscanner.dto.SecurityExplainResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class SecurityScannerService {

    @Autowired
    private SecurityFindingRepository findingRepository;

    @Autowired
    private RepositoryFileRepository fileRepository;

    @Autowired
    private LlmService llmService;

    // Regex patterns for deterministic checks
    private static final Pattern AWS_KEY_PATTERN = Pattern.compile("(?i)(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}");
    private static final Pattern GENERIC_SECRET_PATTERN = Pattern.compile("(?i)(password|secret|api_key|apikey|token|access_token|auth_token)\\s*[=:]\\s*['\"]([^'\"]{8,})['\"]");
    private static final Pattern UNSAFE_SQL_PATTERN = Pattern.compile("(?i)(SELECT|UPDATE|INSERT|DELETE)\\s+.*?(FROM|INTO|SET|WHERE)\\s+.*?\\+.*");
    private static final Pattern MD5_SHA1_PATTERN = Pattern.compile("(?i)(MessageDigest\\.getInstance\\([\"'](MD5|SHA-1)[\"']\\)|DigestUtils\\.md5Hex)");

    public List<SecurityFinding> scanRepository(Long repositoryId) {
        // Clear old findings for this repo
        findingRepository.deleteByRepositoryId(repositoryId);

        List<SecurityFinding> newFindings = new ArrayList<>();
        int page = 0;
        int pageSize = 50;
        org.springframework.data.domain.Page<RepositoryFile> filePage;

        do {
            filePage = fileRepository.findByRepositoryId(repositoryId, org.springframework.data.domain.PageRequest.of(page, pageSize));
            for (RepositoryFile file : filePage.getContent()) {
                String content = file.getContent();
                if (content == null || content.isEmpty()) continue;

                String[] lines = content.split("\\r?\\n");
                for (int i = 0; i < lines.length; i++) {
                    String line = lines[i];
                    int lineNumber = i + 1;

                    // Check 1: AWS Keys
                    Matcher awsMatcher = AWS_KEY_PATTERN.matcher(line);
                    if (awsMatcher.find()) {
                        String match = awsMatcher.group();
                        String masked = match.substring(0, 4) + "****************";
                        newFindings.add(createFinding(repositoryId, file, lineNumber, "HARDCODED_AWS_KEY", "CRITICAL", "Secrets", line.replace(match, masked), "Hardcoded AWS Access Key found.", "Use environment variables or a secrets manager like AWS Secrets Manager/Vault."));
                    }

                    // Check 2: Generic Secrets
                    Matcher secretMatcher = GENERIC_SECRET_PATTERN.matcher(line);
                    if (secretMatcher.find()) {
                        String secretValue = secretMatcher.group(2);
                        String masked = "********";
                        newFindings.add(createFinding(repositoryId, file, lineNumber, "HARDCODED_GENERIC_SECRET", "HIGH", "Secrets", line.replace(secretValue, masked), "Hardcoded secret, password, or token found.", "Extract the secret to a secure configuration file or environment variable."));
                    }

                    // Check 3: Unsafe SQL
                    if (file.getPath().endsWith(".java") || file.getPath().endsWith(".ts") || file.getPath().endsWith(".js")) {
                        Matcher sqlMatcher = UNSAFE_SQL_PATTERN.matcher(line);
                        if (sqlMatcher.find()) {
                            newFindings.add(createFinding(repositoryId, file, lineNumber, "UNSAFE_SQL", "HIGH", "Injection", line, "Possible SQL Injection due to string concatenation in a SQL query.", "Use parameterized queries or prepared statements instead of string concatenation."));
                        }
                    }

                    // Check 4: Weak Hashing
                    Matcher hashMatcher = MD5_SHA1_PATTERN.matcher(line);
                    if (hashMatcher.find()) {
                        newFindings.add(createFinding(repositoryId, file, lineNumber, "WEAK_HASHING", "MEDIUM", "Cryptography", line, "Usage of weak cryptographic hash function (MD5 or SHA-1).", "Use strong hashing algorithms like SHA-256, SHA-3, or bcrypt/argon2 for passwords."));
                    }
                }

                // Check 5: Insecure Spring Security config (disable csrf, etc.)
                if (file.getPath().endsWith("SecurityConfig.java") || file.getPath().endsWith("WebSecurityConfig.java")) {
                    if (content.contains(".csrf().disable()") || content.contains("csrf(AbstractHttpConfigurer::disable)")) {
                        newFindings.add(createFinding(repositoryId, file, null, "CSRF_DISABLED", "MEDIUM", "Config", "csrf().disable() or similar found", "CSRF protection is disabled globally.", "Re-enable CSRF protection unless the application is purely stateless (e.g. API with JWT only)."));
                    }
                }
            }
            page++;
        } while (filePage.hasNext());

        return findingRepository.saveAll(newFindings);
    }

    private SecurityFinding createFinding(Long repoId, RepositoryFile file, Integer line, String ruleId, String severity, String category, String evidence, String explanation, String recommendation) {
        SecurityFinding finding = new SecurityFinding();
        finding.setRepositoryId(repoId);
        finding.setFileId(file.getId());
        finding.setLineNumber(line);
        finding.setRuleId(ruleId);
        finding.setSeverity(severity);
        finding.setCategory(category);
        finding.setEvidence(evidence);
        finding.setExplanation(explanation);
        finding.setRecommendation(recommendation);
        return finding;
    }

    public SecurityExplainResponse explainFinding(Long findingId) {
        SecurityFinding finding = findingRepository.findById(findingId)
                .orElseThrow(() -> new RuntimeException("Finding not found"));

        // Ask LLM using only masked evidence
        String systemPrompt = "You are a senior security engineer. Analyze the following masked security finding. Provide a detailed JSON response with two keys: 'explanation' (why this is a risk) and 'recommendation' (how to fix it). Do not ask for the unmasked secret. Keep responses concise and factual.";
        String userPrompt = "Rule: " + finding.getRuleId() + "\nCategory: " + finding.getCategory() + "\nEvidence: " + finding.getEvidence() + "\nExisting Explanation: " + finding.getExplanation();

        String llmResponse = llmService.generateResponse(systemPrompt, userPrompt);

        // Parse JSON
        try {
            ObjectMapper mapper = new ObjectMapper();
            // Try to extract JSON if LLM added markdown formatting
            String cleanJson = llmResponse;
            if (cleanJson.contains("```json")) {
                cleanJson = cleanJson.substring(cleanJson.indexOf("```json") + 7, cleanJson.lastIndexOf("```"));
            } else if (cleanJson.contains("```")) {
                cleanJson = cleanJson.substring(cleanJson.indexOf("```") + 3, cleanJson.lastIndexOf("```"));
            }
            Map<String, String> responseMap = mapper.readValue(cleanJson.trim(), Map.class);
            return new SecurityExplainResponse(
                    responseMap.getOrDefault("explanation", finding.getExplanation()),
                    responseMap.getOrDefault("recommendation", finding.getRecommendation())
            );
        } catch (Exception e) {
            // Fallback
            return new SecurityExplainResponse(
                    finding.getExplanation() + "\n\n(AI Analysis failed to parse: " + llmResponse + ")",
                    finding.getRecommendation()
            );
        }
    }
}
