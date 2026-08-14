package com.devpilot.rag.chunking;

import com.devpilot.rag.CodeChunk;
import com.devpilot.repository.RepositoryFile;
import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.body.FieldDeclaration;
import com.github.javaparser.ast.body.MethodDeclaration;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class JavaCodeChunker implements CodeChunker {

    @Override
    public boolean supports(String language, String filePath) {
        return "Java".equalsIgnoreCase(language) || (filePath != null && filePath.endsWith(".java"));
    }

    @Override
    public List<CodeChunk> chunk(RepositoryFile file) {
        List<CodeChunk> chunks = new ArrayList<>();
        if (file.getContent() == null || file.getContent().trim().isEmpty()) {
            return chunks;
        }

        try {
            CompilationUnit cu = StaticJavaParser.parse(file.getContent());
            String packageName = cu.getPackageDeclaration().map(p -> p.getNameAsString()).orElse("");

            List<ClassOrInterfaceDeclaration> classes = cu.findAll(ClassOrInterfaceDeclaration.class);
            if (classes.isEmpty()) {
                // Fallback to whole file chunk
                chunks.add(createChunk(file, null, null, 1, countLines(file.getContent()), file.getContent()));
                return chunks;
            }

            for (ClassOrInterfaceDeclaration clazz : classes) {
                String className = clazz.getNameAsString();
                int classStart = clazz.getBegin().map(p -> p.line).orElse(1);
                int classEnd = clazz.getEnd().map(p -> p.line).orElse(1);

                // 1. Class Header / Fields Chunk
                StringBuilder headerBuilder = new StringBuilder();
                if (!packageName.isEmpty()) {
                    headerBuilder.append("package ").append(packageName).append(";\n\n");
                }
                
                // Annotations and class signature
                clazz.getAnnotations().forEach(a -> headerBuilder.append(a.toString()).append("\n"));
                headerBuilder.append("public class ").append(className);
                if (!clazz.getExtendedTypes().isEmpty()) {
                    headerBuilder.append(" extends ").append(clazz.getExtendedTypes(0));
                }
                if (!clazz.getImplementedTypes().isEmpty()) {
                    headerBuilder.append(" implements ").append(clazz.getImplementedTypes().toString());
                }
                headerBuilder.append(" {\n");

                for (FieldDeclaration field : clazz.getFields()) {
                    headerBuilder.append("    ").append(field.toString()).append("\n");
                }
                headerBuilder.append("}");

                int headerEndLine = clazz.getFields().isEmpty() 
                        ? classStart + 5 
                        : clazz.getFields().get(clazz.getFields().size() - 1).getEnd().map(p -> p.line).orElse(classStart + 10);

                chunks.add(createChunk(file, className, "Class Declaration & Fields", classStart, headerEndLine, headerBuilder.toString()));

                // 2. Method Chunks
                for (MethodDeclaration method : clazz.getMethods()) {
                    int mStart = method.getBegin().map(p -> p.line).orElse(classStart);
                    int mEnd = method.getEnd().map(p -> p.line).orElse(classEnd);
                    String methodName = method.getNameAsString();

                    String methodContent = String.format("// File: %s (Lines: %d-%d)\n// Class: %s, Method: %s\n%s",
                            file.getPath(), mStart, mEnd, className, methodName, method.toString());

                    chunks.add(createChunk(file, className, methodName, mStart, mEnd, methodContent));
                }
            }

        } catch (Exception e) {
            // Graceful fallback for unparseable java files
            chunks.addAll(createSlidingWindowChunks(file));
        }

        return chunks;
    }

    private CodeChunk createChunk(RepositoryFile file, String symbol, String method, int startLine, int endLine, String content) {
        CodeChunk chunk = new CodeChunk();
        chunk.setRepositoryId(file.getRepositoryId());
        chunk.setRepositoryFileId(file.getId());
        chunk.setPath(file.getPath());
        chunk.setLanguage("Java");
        chunk.setSymbol(symbol);
        chunk.setMethod(method);
        chunk.setStartLine(startLine);
        chunk.setEndLine(endLine);
        chunk.setContent(content);
        return chunk;
    }

    private List<CodeChunk> createSlidingWindowChunks(RepositoryFile file) {
        List<CodeChunk> chunks = new ArrayList<>();
        String[] lines = file.getContent().split("\n");
        int windowSize = 50;
        int step = 40;

        for (int i = 0; i < lines.length; i += step) {
            int end = Math.min(lines.length, i + windowSize);
            StringBuilder sb = new StringBuilder();
            for (int j = i; j < end; j++) {
                sb.append(lines[j]).append("\n");
            }
            chunks.add(createChunk(file, file.getName(), null, i + 1, end, sb.toString()));
            if (end == lines.length) break;
        }
        return chunks;
    }

    private int countLines(String content) {
        if (content == null || content.isEmpty()) return 1;
        return content.split("\n").length;
    }
}
