package com.devpilot.repository;

public interface RepositoryFileSummary {
    Long getId();
    Long getRepositoryId();
    String getPath();
    String getName();
    String getExtension();
    String getLanguage();
    Long getSizeBytes();
}
