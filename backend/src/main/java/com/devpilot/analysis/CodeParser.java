package com.devpilot.analysis;

import com.devpilot.repository.RepositoryFile;
import java.util.List;

public interface CodeParser {
    boolean supports(String language);
    List<CodeSymbol> parse(RepositoryFile file);
}
