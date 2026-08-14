package com.devpilot.agent.tools;

import com.devpilot.repository.RepositoryFile;
import com.devpilot.repository.RepositoryFileRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class GetFileTool implements AgentTool {

    private final RepositoryFileRepository repositoryFileRepository;

    public GetFileTool(RepositoryFileRepository repositoryFileRepository) {
        this.repositoryFileRepository = repositoryFileRepository;
    }

    @Override
    public String getName() {
        return "getFile";
    }

    @Override
    public String getDescription() {
        return "Retrieve the exact content of a specific file from the repository by its path.";
    }

    @Override
    public String getInputSchema() {
        return "{\"type\":\"object\",\"properties\":{\"path\":{\"type\":\"string\",\"description\":\"The file path\"}},\"required\":[\"path\"]}";
    }

    @Override
    public String execute(Map<String, Object> input, Long repositoryId) {
        String path = (String) input.get("path");
        if (path == null || path.trim().isEmpty()) {
            return "Error: path is required.";
        }

        List<RepositoryFile> files = repositoryFileRepository.findByRepositoryId(repositoryId);
        for (RepositoryFile file : files) {
            if (file.getPath().equals(path) || file.getPath().endsWith(path)) {
                return "File: " + file.getPath() + "\n```\n" + file.getContent() + "\n```";
            }
        }

        return "File not found: " + path;
    }
}
