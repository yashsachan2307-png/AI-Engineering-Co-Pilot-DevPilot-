package com.devpilot.analysis;

import com.devpilot.repository.RepositoryFile;
import java.util.List;

public interface StaticCodeAnalyzer {
    boolean supports(String language);
    List<StaticAnalysisFinding> analyze(RepositoryFile file);
}
