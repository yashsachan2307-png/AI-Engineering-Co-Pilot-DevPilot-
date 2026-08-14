package com.devpilot.analysis;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CodeSymbolRepository extends JpaRepository<CodeSymbol, Long> {
    List<CodeSymbol> findByRepositoryId(Long repositoryId);
    void deleteByRepositoryId(Long repositoryId);
}
