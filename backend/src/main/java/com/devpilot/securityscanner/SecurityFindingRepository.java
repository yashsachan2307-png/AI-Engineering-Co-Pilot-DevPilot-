package com.devpilot.securityscanner;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SecurityFindingRepository extends JpaRepository<SecurityFinding, Long> {
    List<SecurityFinding> findByRepositoryId(Long repositoryId);
    void deleteByRepositoryId(Long repositoryId);
}
