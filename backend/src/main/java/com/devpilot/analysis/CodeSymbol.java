package com.devpilot.analysis;

import jakarta.persistence.*;

@Entity
@Table(name = "code_symbols")
public class CodeSymbol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long repositoryId;

    @Column(nullable = false)
    private Long repositoryFileId;

    @Column(nullable = false)
    private String type; // CLASS, INTERFACE, ENUM, METHOD, CONSTRUCTOR, FIELD, IMPORT

    @Column(nullable = false, length = 1000)
    private String name;

    @Column(length = 2000)
    private String signature;

    private Integer startLine;
    private Integer endLine;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getRepositoryId() { return repositoryId; }
    public void setRepositoryId(Long repositoryId) { this.repositoryId = repositoryId; }

    public Long getRepositoryFileId() { return repositoryFileId; }
    public void setRepositoryFileId(Long repositoryFileId) { this.repositoryFileId = repositoryFileId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSignature() { return signature; }
    public void setSignature(String signature) { this.signature = signature; }

    public Integer getStartLine() { return startLine; }
    public void setStartLine(Integer startLine) { this.startLine = startLine; }

    public Integer getEndLine() { return endLine; }
    public void setEndLine(Integer endLine) { this.endLine = endLine; }
}
