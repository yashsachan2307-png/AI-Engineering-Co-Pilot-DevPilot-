package com.devpilot.repository;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "repositories")
public class Repository {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long githubAccountId;

    @Column(nullable = false)
    private Long githubId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String owner;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String defaultBranch;

    @Column(nullable = false)
    private String visibility;

    private String language;

    @Column(nullable = false)
    private String githubUrl;

    @Column(nullable = false)
    private LocalDateTime githubUpdatedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime importedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "repositoryId", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RepositoryBranch> branches = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getGithubAccountId() { return githubAccountId; }
    public void setGithubAccountId(Long githubAccountId) { this.githubAccountId = githubAccountId; }

    public Long getGithubId() { return githubId; }
    public void setGithubId(Long githubId) { this.githubId = githubId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDefaultBranch() { return defaultBranch; }
    public void setDefaultBranch(String defaultBranch) { this.defaultBranch = defaultBranch; }

    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }

    public LocalDateTime getGithubUpdatedAt() { return githubUpdatedAt; }
    public void setGithubUpdatedAt(LocalDateTime githubUpdatedAt) { this.githubUpdatedAt = githubUpdatedAt; }

    public LocalDateTime getImportedAt() { return importedAt; }
    public void setImportedAt(LocalDateTime importedAt) { this.importedAt = importedAt; }

    public List<RepositoryBranch> getBranches() { return branches; }
    public void setBranches(List<RepositoryBranch> branches) { this.branches = branches; }
}
