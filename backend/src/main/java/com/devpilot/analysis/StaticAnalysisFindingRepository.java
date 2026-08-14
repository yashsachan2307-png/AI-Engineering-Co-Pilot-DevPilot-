package com.devpilot.analysis;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface StaticAnalysisFindingRepository extends JpaRepository<StaticAnalysisFinding, Long> {
    List<StaticAnalysisFinding> findByRepositoryId(Long repositoryId);

    @Modifying
    @Transactional
    void deleteByRepositoryId(Long repositoryId);
}

