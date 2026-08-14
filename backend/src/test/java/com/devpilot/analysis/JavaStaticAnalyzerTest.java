package com.devpilot.analysis;

import com.devpilot.repository.RepositoryFile;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class JavaStaticAnalyzerTest {

    private JavaStaticAnalyzer analyzer;

    @BeforeEach
    public void setUp() {
        analyzer = new JavaStaticAnalyzer();
    }

    private RepositoryFile createFile(String path, String content) {
        RepositoryFile file = new RepositoryFile();
        file.setId(100L);
        file.setRepositoryId(1L);
        file.setPath(path);
        file.setName(path.substring(path.lastIndexOf('/') + 1));
        file.setLanguage("Java");
        file.setContent(content);
        return file;
    }

    @Test
    public void testUnusedImportDetection() {
        String code = """
                package com.example;
                import java.util.List;
                import java.util.UUID;
                
                public class OrderService {
                    private List<String> orders;
                    public List<String> getOrders() {
                        return orders;
                    }
                }
                """;

        RepositoryFile file = createFile("src/main/java/com/example/OrderService.java", code);
        List<StaticAnalysisFinding> findings = analyzer.analyze(file);

        assertTrue(findings.stream().anyMatch(f -> "Unused Import".equals(f.getTitle()) && f.getDescription().contains("UUID")),
                "Should detect unused import UUID");
        assertEquals("Code Smells", findings.stream().filter(f -> "Unused Import".equals(f.getTitle())).findFirst().get().getCategory());
        assertEquals("Low", findings.stream().filter(f -> "Unused Import".equals(f.getTitle())).findFirst().get().getSeverity());
    }

    @Test
    public void testExcessiveParametersDetection() {
        String code = """
                package com.example;
                
                public class UserService {
                    public void registerUser(String fName, String lName, String email, String phone, String address, int age, boolean active) {
                        System.out.println("Registering: " + email);
                    }
                }
                """;

        RepositoryFile file = createFile("src/main/java/com/example/UserService.java", code);
        List<StaticAnalysisFinding> findings = analyzer.analyze(file);

        assertTrue(findings.stream().anyMatch(f -> "Excessive Parameters".equals(f.getTitle())),
                "Should detect method with excessive parameters");
        StaticAnalysisFinding finding = findings.stream().filter(f -> "Excessive Parameters".equals(f.getTitle())).findFirst().get();
        assertEquals("Code Smells", finding.getCategory());
        assertEquals("Medium", finding.getSeverity());
        assertTrue(finding.getMetric().contains("Parameters: 7"));
    }

    @Test
    public void testEmptyCatchBlockAndSuspiciousHandling() {
        String code = """
                package com.example;
                import java.io.IOException;
                
                public class FileProcessor {
                    public void process() {
                        try {
                            throw new IOException("error");
                        } catch (IOException e) {
                        }
                        
                        try {
                            int x = 10 / 0;
                        } catch (ArithmeticException e) {
                            e.printStackTrace();
                        }
                    }
                }
                """;

        RepositoryFile file = createFile("src/main/java/com/example/FileProcessor.java", code);
        List<StaticAnalysisFinding> findings = analyzer.analyze(file);

        assertTrue(findings.stream().anyMatch(f -> "Empty Catch Block".equals(f.getTitle())),
                "Should detect empty catch block");
        assertTrue(findings.stream().anyMatch(f -> "Suspicious Exception Handling".equals(f.getTitle())),
                "Should detect exception handled solely with printStackTrace");

        StaticAnalysisFinding emptyCatch = findings.stream().filter(f -> "Empty Catch Block".equals(f.getTitle())).findFirst().get();
        assertEquals("High", emptyCatch.getSeverity());
    }

    @Test
    public void testHighNestingDepth() {
        String code = """
                package com.example;
                
                public class NestedLogic {
                    public void deepNest(int a, int b, int c, int d, int e) {
                        if (a > 0) {
                            if (b > 0) {
                                for (int i = 0; i < c; i++) {
                                    while (d > 0) {
                                        if (e > 0) {
                                            System.out.println("Deeply nested");
                                        }
                                        d--;
                                    }
                                }
                            }
                        }
                    }
                }
                """;

        RepositoryFile file = createFile("src/main/java/com/example/NestedLogic.java", code);
        List<StaticAnalysisFinding> findings = analyzer.analyze(file);

        assertTrue(findings.stream().anyMatch(f -> "High Nesting Depth".equals(f.getTitle())),
                "Should detect high nesting depth");
        StaticAnalysisFinding finding = findings.stream().filter(f -> "High Nesting Depth".equals(f.getTitle())).findFirst().get();
        assertEquals("Complexity", finding.getCategory());
        assertEquals("High", finding.getSeverity());
        assertTrue(finding.getMetric().contains("Depth: 5"));
    }

    @Test
    public void testCyclomaticComplexity() {
        String code = """
                package com.example;
                
                public class ComplexCalculator {
                    public int evaluate(int a, int b, int c, int d) {
                        int res = 0;
                        if (a > 0 && b > 0) { res += 1; }
                        if (c > 0 || d > 0) { res += 2; }
                        if (a == 1) { res += 3; }
                        if (b == 2) { res += 4; }
                        if (c == 3) { res += 5; }
                        if (d == 4) { res += 6; }
                        if (res > 10) { res = 10; }
                        if (res < 0) { res = 0; }
                        return res;
                    }
                }
                """;

        RepositoryFile file = createFile("src/main/java/com/example/ComplexCalculator.java", code);
        List<StaticAnalysisFinding> findings = analyzer.analyze(file);

        assertTrue(findings.stream().anyMatch(f -> f.getTitle().contains("Cyclomatic Complexity")),
                "Should detect elevated cyclomatic complexity");
        StaticAnalysisFinding finding = findings.stream().filter(f -> f.getTitle().contains("Cyclomatic Complexity")).findFirst().get();
        assertEquals("Complexity", finding.getCategory());
        assertTrue(finding.getMetric().contains("Cyclomatic complexity:"));
    }

    @Test
    public void testSpringControllerAndCouplingChecks() {
        String code = """
                package com.example;
                import org.springframework.web.bind.annotation.RestController;
                import org.springframework.web.bind.annotation.GetMapping;
                
                @RestController
                public class BloatedController {
                    private String s1;
                    private String s2;
                    private String s3;
                    private String s4;
                    private String s5;
                    private String s6;
                    private String s7;
                    private String s8;
                    
                    @GetMapping("/data")
                    public String getData() {
                        String a = "1";
                        String b = "2";
                        String c = "3";
                        String d = "4";
                        String e = "5";
                        String f = "6";
                        String g = "7";
                        String h = "8";
                        String i = "9";
                        String j = "10";
                        String k = "11";
                        String l = "12";
                        String m = "13";
                        String n = "14";
                        String o = "15";
                        String p = "16";
                        String q = "17";
                        String r = "18";
                        String s = "19";
                        String t = "20";
                        String u = "21";
                        String v = "22";
                        String w = "23";
                        String x = "24";
                        String y = "25";
                        String z = "26";
                        String aa = "27";
                        String bb = "28";
                        String cc = "29";
                        String dd = "30";
                        String ee = "31";
                        return a + b + c + d + e + f + g + h + i + j + k + l + m + n + o + p + q + r + s + t + u + v + w + x + y + z + aa + bb + cc + dd + ee;
                    }
                }
                """;

        RepositoryFile file = createFile("src/main/java/com/example/BloatedController.java", code);
        List<StaticAnalysisFinding> findings = analyzer.analyze(file);

        assertTrue(findings.stream().anyMatch(f -> "Overly Coupled Class".equals(f.getTitle())),
                "Should detect overly coupled class with > 7 fields");
        assertTrue(findings.stream().anyMatch(f -> "Bloated Controller Method".equals(f.getTitle())),
                "Should detect bloated controller method > 30 lines");

        StaticAnalysisFinding couplingFinding = findings.stream().filter(f -> "Overly Coupled Class".equals(f.getTitle())).findFirst().get();
        assertEquals("Architecture", couplingFinding.getCategory());
        assertEquals("Medium", couplingFinding.getSeverity());
    }
}
