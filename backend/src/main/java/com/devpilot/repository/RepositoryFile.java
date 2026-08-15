package com.devpilot.repository;

import jakarta.persistence.*;

@Entity
@Table(name = "repository_files", indexes = {
    @Index(name = "idx_repo_file_repo_id", columnList = "repositoryId")
})
public class RepositoryFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long repositoryId;

    @Column(nullable = false, length = 1000)
    private String path;

    @Column(nullable = false)
    private String name;

    private String extension;

    private String language;

    @Column(nullable = false)
    private Long sizeBytes;

    @Column(columnDefinition = "TEXT")
    private String content;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getRepositoryId() { return repositoryId; }
    public void setRepositoryId(Long repositoryId) { this.repositoryId = repositoryId; }

    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getExtension() { return extension; }
    public void setExtension(String extension) { this.extension = extension; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public Long getSizeBytes() { return sizeBytes; }
    public void setSizeBytes(Long sizeBytes) { this.sizeBytes = sizeBytes; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
