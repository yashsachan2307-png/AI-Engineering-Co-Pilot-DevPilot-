package com.devpilot.analysis;

import com.devpilot.repository.RepositoryFile;
import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.ImportDeclaration;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.body.ConstructorDeclaration;
import com.github.javaparser.ast.body.EnumDeclaration;
import com.github.javaparser.ast.body.FieldDeclaration;
import com.github.javaparser.ast.body.MethodDeclaration;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class JavaCodeParser implements CodeParser {

    @Override
    public boolean supports(String language) {
        return "Java".equalsIgnoreCase(language);
    }

    @Override
    public List<CodeSymbol> parse(RepositoryFile file) {
        List<CodeSymbol> symbols = new ArrayList<>();
        if (file.getContent() == null || file.getContent().trim().isEmpty()) {
            return symbols;
        }

        try {
            CompilationUnit cu = StaticJavaParser.parse(file.getContent());

            // Extract imports
            for (ImportDeclaration imp : cu.findAll(ImportDeclaration.class)) {
                CodeSymbol sym = createSymbol(file, "IMPORT", imp.getNameAsString(), null, imp.getBegin().map(p -> p.line).orElse(null), imp.getEnd().map(p -> p.line).orElse(null));
                symbols.add(sym);
            }

            // Extract classes and interfaces
            for (ClassOrInterfaceDeclaration type : cu.findAll(ClassOrInterfaceDeclaration.class)) {
                String symbolType = type.isInterface() ? "INTERFACE" : "CLASS";
                String name = type.getNameAsString();
                CodeSymbol sym = createSymbol(file, symbolType, name, name, type.getBegin().map(p -> p.line).orElse(null), type.getEnd().map(p -> p.line).orElse(null));
                symbols.add(sym);
            }

            // Extract enums
            for (EnumDeclaration type : cu.findAll(EnumDeclaration.class)) {
                String name = type.getNameAsString();
                CodeSymbol sym = createSymbol(file, "ENUM", name, name, type.getBegin().map(p -> p.line).orElse(null), type.getEnd().map(p -> p.line).orElse(null));
                symbols.add(sym);
            }

            // Extract methods
            for (MethodDeclaration method : cu.findAll(MethodDeclaration.class)) {
                String name = method.getNameAsString();
                String signature = method.getDeclarationAsString(true, true, true);
                CodeSymbol sym = createSymbol(file, "METHOD", name, signature, method.getBegin().map(p -> p.line).orElse(null), method.getEnd().map(p -> p.line).orElse(null));
                symbols.add(sym);
            }

            // Extract constructors
            for (ConstructorDeclaration constructor : cu.findAll(ConstructorDeclaration.class)) {
                String name = constructor.getNameAsString();
                String signature = constructor.getDeclarationAsString(true, true, true);
                CodeSymbol sym = createSymbol(file, "CONSTRUCTOR", name, signature, constructor.getBegin().map(p -> p.line).orElse(null), constructor.getEnd().map(p -> p.line).orElse(null));
                symbols.add(sym);
            }

            // Extract fields (optional, but requested "where useful")
            for (FieldDeclaration field : cu.findAll(FieldDeclaration.class)) {
                field.getVariables().forEach(var -> {
                    String name = var.getNameAsString();
                    CodeSymbol sym = createSymbol(file, "FIELD", name, var.getTypeAsString() + " " + name, field.getBegin().map(p -> p.line).orElse(null), field.getEnd().map(p -> p.line).orElse(null));
                    symbols.add(sym);
                });
            }

        } catch (Exception e) {
            // Log or ignore parse errors (malformed file)
            System.err.println("Failed to parse Java file " + file.getPath() + ": " + e.getMessage());
        }

        return symbols;
    }

    private CodeSymbol createSymbol(RepositoryFile file, String type, String name, String signature, Integer startLine, Integer endLine) {
        CodeSymbol sym = new CodeSymbol();
        sym.setRepositoryId(file.getRepositoryId());
        sym.setRepositoryFileId(file.getId());
        sym.setType(type);
        sym.setName(name != null && name.length() > 1000 ? name.substring(0, 999) : name);
        sym.setSignature(signature != null && signature.length() > 2000 ? signature.substring(0, 1999) : signature);
        sym.setStartLine(startLine);
        sym.setEndLine(endLine);
        return sym;
    }
}
