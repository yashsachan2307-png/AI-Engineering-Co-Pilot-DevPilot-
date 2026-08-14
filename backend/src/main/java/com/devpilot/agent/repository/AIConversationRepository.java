package com.devpilot.agent.repository;

import com.devpilot.agent.domain.AIConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIConversationRepository extends JpaRepository<AIConversation, Long> {
    List<AIConversation> findByRepositoryIdOrderByUpdatedAtDesc(Long repositoryId);
}
