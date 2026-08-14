package com.devpilot.agent.tools;

import java.util.Map;

/**
 * Defines a tool that the AI agent can execute.
 */
public interface AgentTool {
    String getName();
    String getDescription();
    String getInputSchema();
    String execute(Map<String, Object> input, Long repositoryId);
}
