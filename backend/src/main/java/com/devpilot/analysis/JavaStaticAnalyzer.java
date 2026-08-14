package com.devpilot.analysis;

import com.devpilot.repository.RepositoryFile;
import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.ImportDeclaration;
import com.github.javaparser.ast.Node;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.body.FieldDeclaration;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.expr.BinaryExpr;
import com.github.javaparser.ast.expr.ConditionalExpr;
import com.github.javaparser.ast.stmt.*;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class JavaStaticAnalyzer implements StaticCodeAnalyzer {

    private static final int MAX_METHOD_LINES = 50;
    private static final int MAX_CLASS_LINES = 500;
    private static final int MAX_CLASS_METHODS = 20;
    private static final int MAX_PARAMETERS = 5;
    private static final int MAX_NESTING_DEPTH = 4;
    private static final int CYCLOMATIC_COMPLEXITY_THRESHOLD = 10;
    private static final int HIGH_CYCLOMATIC_COMPLEXITY_THRESHOLD = 15;
    private static final int MAX_CONTROLLER_METHOD_LINES = 30;
    private static final int MAX_CLASS_FIELDS = 7;

    @Override
    public boolean supports(String language) {
        return "Java".equalsIgnoreCase(language);
    }

    @Override
    public List<StaticAnalysisFinding> analyze(RepositoryFile file) {
        List<StaticAnalysisFinding> findings = new ArrayList<>();
        if (file.getContent() == null || file.getContent().trim().isEmpty()) {
            return findings;
        }

        try {
            CompilationUnit cu = StaticJavaParser.parse(file.getContent());

            // 1. Unused Imports
            String content = file.getContent();
            for (ImportDeclaration imp : cu.findAll(ImportDeclaration.class)) {
                if (!imp.isAsterisk()) {
                    String importedName = imp.getName().getIdentifier();
                    int count = countOccurrences(content, importedName);
                    if (count <= 1) { // 1 for the import statement itself
                        findings.add(createFinding(file, imp.getBegin().map(p -> p.line).orElse(1),
                                "Low", "Code Smells", "Unused Import",
                                "The imported class '" + importedName + "' appears to be unused.",
                                "Occurrences: " + count,
                                "Remove the unused import to maintain clean dependencies."));
                    }
                }
            }

            // 2. Class Level Checks (Size, Methods, Coupling, Architecture)
            for (ClassOrInterfaceDeclaration type : cu.findAll(ClassOrInterfaceDeclaration.class)) {
                if (!type.isInterface()) {
                    Optional<Integer> begin = type.getBegin().map(p -> p.line);
                    Optional<Integer> end = type.getEnd().map(p -> p.line);
                    String className = type.getNameAsString();
                    int classStartLine = begin.orElse(1);

                    // Large class by lines
                    if (begin.isPresent() && end.isPresent()) {
                        int lines = end.get() - begin.get();
                        if (lines > MAX_CLASS_LINES) {
                            findings.add(createFinding(file, classStartLine, "High", "Maintainability", "Large Class",
                                    "Class '" + className + "' exceeds maximum recommended line length.",
                                    "Lines: " + lines + " (Limit: " + MAX_CLASS_LINES + ")",
                                    "Consider breaking down this class into smaller, more focused classes."));
                        }
                    }

                    // Large class by method count
                    int methodCount = type.getMethods().size();
                    if (methodCount > MAX_CLASS_METHODS) {
                        findings.add(createFinding(file, classStartLine, "Medium", "Maintainability", "Excessive Method Count",
                                "Class '" + className + "' defines too many methods.",
                                "Methods: " + methodCount + " (Limit: " + MAX_CLASS_METHODS + ")",
                                "Split responsibilities into multiple cohesive classes or utility modules."));
                    }

                    // Coupling: excessive fields / dependencies
                    int fieldCount = 0;
                    for (FieldDeclaration field : type.getFields()) {
                        fieldCount += field.getVariables().size();
                    }
                    if (fieldCount > MAX_CLASS_FIELDS) {
                        findings.add(createFinding(file, classStartLine, "Medium", "Architecture", "Overly Coupled Class",
                                "Class '" + className + "' has a large number of fields/injected dependencies.",
                                "Fields / Dependencies: " + fieldCount + " (Limit: " + MAX_CLASS_FIELDS + ")",
                                "High coupling makes testing and refactoring harder. Break class into smaller services."));
                    }

                    boolean isController = type.getAnnotationByName("RestController").isPresent()
                            || type.getAnnotationByName("Controller").isPresent();

                    // 3. Method Level Checks
                    for (MethodDeclaration method : type.getMethods()) {
                        Optional<Integer> mBegin = method.getBegin().map(p -> p.line);
                        Optional<Integer> mEnd = method.getEnd().map(p -> p.line);
                        String methodName = method.getNameAsString();
                        int line = mBegin.orElse(1);

                        // Method length
                        if (mBegin.isPresent() && mEnd.isPresent()) {
                            int lines = mEnd.get() - mBegin.get();
                            if (lines > MAX_METHOD_LINES) {
                                findings.add(createFinding(file, line, "Medium", "Maintainability", "Long Method",
                                        "Method '" + methodName + "' is very long.",
                                        "Lines: " + lines + " (Limit: " + MAX_METHOD_LINES + ")",
                                        "Extract smaller methods to reduce the length and improve readability."));
                            }

                            // Controller responsibility
                            if (isController && lines > MAX_CONTROLLER_METHOD_LINES) {
                                findings.add(createFinding(file, line, "Medium", "Architecture", "Bloated Controller Method",
                                        "Controller method '" + methodName + "' contains excessive logic.",
                                        "Lines: " + lines + " (Limit: " + MAX_CONTROLLER_METHOD_LINES + ")",
                                        "Controllers should only route requests. Move business logic to service layers."));
                            }
                        }

                        // Excessive parameters
                        int paramCount = method.getParameters().size();
                        if (paramCount > MAX_PARAMETERS) {
                            findings.add(createFinding(file, line, "Medium", "Code Smells", "Excessive Parameters",
                                    "Method '" + methodName + "' takes too many parameters.",
                                    "Parameters: " + paramCount + " (Limit: " + MAX_PARAMETERS + ")",
                                    "Group related parameters into a dedicated DTO or Parameter Object."));
                        }

                        // Method Body Checks: Nesting depth & Cyclomatic complexity
                        if (method.getBody().isPresent()) {
                            BlockStmt body = method.getBody().get();

                            // Nesting Depth
                            int maxDepth = calculateMaxNestingDepth(body, 0);
                            if (maxDepth > MAX_NESTING_DEPTH) {
                                findings.add(createFinding(file, line, "High", "Complexity", "High Nesting Depth",
                                        "Method '" + methodName + "' has excessive control-flow nesting depth.",
                                        "Depth: " + maxDepth + " (Limit: " + MAX_NESTING_DEPTH + ")",
                                        "Refactor using early return guards or extract nested sub-methods."));
                            }

                            // Cyclomatic Complexity
                            int cyclomaticComplexity = calculateCyclomaticComplexity(body);
                            if (cyclomaticComplexity >= HIGH_CYCLOMATIC_COMPLEXITY_THRESHOLD) {
                                findings.add(createFinding(file, line, "High", "Complexity", "High Cyclomatic Complexity",
                                        "Method '" + methodName + "' has very high cyclomatic complexity.",
                                        "Cyclomatic complexity: " + cyclomaticComplexity + " (Limit: " + CYCLOMATIC_COMPLEXITY_THRESHOLD + ")",
                                        "Split the method into smaller, single-responsibility units or use polymorphism."));
                            } else if (cyclomaticComplexity >= CYCLOMATIC_COMPLEXITY_THRESHOLD) {
                                findings.add(createFinding(file, line, "Medium", "Complexity", "Moderate Cyclomatic Complexity",
                                        "Method '" + methodName + "' has elevated branch complexity.",
                                        "Cyclomatic complexity: " + cyclomaticComplexity + " (Limit: " + CYCLOMATIC_COMPLEXITY_THRESHOLD + ")",
                                        "Consider refactoring branches or extracting helper methods to reduce complexity."));
                            }
                        }
                    }
                }
            }

            // 4. Exception Handling Checks (Empty catch, suspicious handling)
            for (CatchClause catchClause : cu.findAll(CatchClause.class)) {
                int line = catchClause.getBegin().map(p -> p.line).orElse(1);
                BlockStmt body = catchClause.getBody();
                String exType = catchClause.getParameter().getType().asString();

                if (body.getStatements().isEmpty()) {
                    findings.add(createFinding(file, line, "High", "Code Smells", "Empty Catch Block",
                            "Empty catch block for exception type '" + exType + "'.",
                            "Statements: 0 in catch block",
                            "Do not swallow exceptions silently. Log the error or rethrow a domain-specific exception."));
                } else if (body.getStatements().size() == 1) {
                    String stmtStr = body.getStatements().get(0).toString().trim();
                    if (stmtStr.contains("printStackTrace") || stmtStr.contains("System.out.print") || stmtStr.contains("System.err.print")) {
                        findings.add(createFinding(file, line, "Medium", "Code Smells", "Suspicious Exception Handling",
                                "Exception '" + exType + "' is handled solely with standard output/printStackTrace.",
                                "Pattern: " + stmtStr,
                                "Use a structured logging framework (e.g. SLF4J/Logback) or properly handle the failure."));
                    }
                }
            }

        } catch (Exception e) {
            System.err.println("Failed to static analyze Java file " + file.getPath() + ": " + e.getMessage());
        }

        return findings;
    }

    private int calculateCyclomaticComplexity(BlockStmt body) {
        int complexity = 1; // Base path

        complexity += body.findAll(IfStmt.class).size();
        complexity += body.findAll(ForStmt.class).size();
        complexity += body.findAll(ForEachStmt.class).size();
        complexity += body.findAll(WhileStmt.class).size();
        complexity += body.findAll(DoStmt.class).size();
        complexity += body.findAll(CatchClause.class).size();
        complexity += body.findAll(ConditionalExpr.class).size();

        // Switch entries with actual case labels
        for (SwitchEntry entry : body.findAll(SwitchEntry.class)) {
            if (!entry.getLabels().isEmpty()) {
                complexity++;
            }
        }

        // Logical operators in binary expressions (&&, ||)
        for (BinaryExpr expr : body.findAll(BinaryExpr.class)) {
            if (expr.getOperator() == BinaryExpr.Operator.AND || expr.getOperator() == BinaryExpr.Operator.OR) {
                complexity++;
            }
        }

        return complexity;
    }

    private int calculateMaxNestingDepth(Node node, int currentDepth) {
        int newDepth = currentDepth;
        if (node instanceof IfStmt || node instanceof ForStmt || node instanceof ForEachStmt
                || node instanceof WhileStmt || node instanceof DoStmt || node instanceof SwitchStmt
                || node instanceof TryStmt || node instanceof CatchClause) {
            newDepth++;
        }

        int max = newDepth;
        for (Node child : node.getChildNodes()) {
            max = Math.max(max, calculateMaxNestingDepth(child, newDepth));
        }
        return max;
    }

    private int countOccurrences(String content, String word) {
        int count = 0;
        int idx = 0;
        while ((idx = content.indexOf(word, idx)) != -1) {
            boolean startOk = idx == 0 || !Character.isJavaIdentifierPart(content.charAt(idx - 1));
            boolean endOk = idx + word.length() == content.length() || !Character.isJavaIdentifierPart(content.charAt(idx + word.length()));
            if (startOk && endOk) {
                count++;
            }
            idx += word.length();
        }
        return count;
    }

    private StaticAnalysisFinding createFinding(RepositoryFile file, int line, String severity, String category,
                                                String title, String description, String metric, String recommendation) {
        StaticAnalysisFinding f = new StaticAnalysisFinding();
        f.setRepositoryId(file.getRepositoryId());
        f.setRepositoryFileId(file.getId());
        f.setFileName(file.getPath());
        f.setLine(line);
        f.setSeverity(severity);
        f.setCategory(category);
        f.setTitle(title);
        f.setDescription(description);
        f.setMetric(metric);
        f.setRecommendation(recommendation);
        return f;
    }
}
