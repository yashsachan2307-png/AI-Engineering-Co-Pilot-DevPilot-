package com.devpilot.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

@org.springframework.stereotype.Repository
public interface RepositoryBranchRepository extends JpaRepository<RepositoryBranch, Long> {
    List<RepositoryBranch> findByRepositoryId(Long repositoryId);
}
