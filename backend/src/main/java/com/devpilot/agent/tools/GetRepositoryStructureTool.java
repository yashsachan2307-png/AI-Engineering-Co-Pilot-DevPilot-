package com.devpilot.agent.tools;

import com.devpilot.repository.RepositoryFile;
import com.devpilot.repository.RepositoryFileRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class GetRepositoryStructureTool implements AgentTool {

    private final RepositoryFileRepository repositoryFileRepository;

    public GetRepositoryStructureTool(RepositoryFileRepository repositoryFileRepository) {
        this.repositoryFileRepository = repositoryFileRepository;
    }

    @Override
    public String getName() {
        return "getRepositoryStructure";
    }

    @Override
    public String getDescription() {
        return "Retrieve a list of all file paths in the repository to understand its structure.";
    }

    @Override
    public String getInputSchema() {
        return "{\"type\":\"object\",\"properties\":{}}";
    }

    @Override
    public String execute(Map<String, Object> input, Long repositoryId) {
        List<RepositoryFile> files = repositoryFileRepository.findByRepositoryId(repositoryId);
        if (files.isEmpty()) {
            return "Repository is empty or not indexed.";
        }

        String structure = files.stream()
                .map(RepositoryFile::getPath)
                .collect(Collectors.joining("\n"));
        
        return "Repository Structure:\n" + structure;
    }
}
