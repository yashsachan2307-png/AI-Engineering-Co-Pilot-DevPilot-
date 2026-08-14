package com.devpilot.ingestion;

import com.devpilot.github.GitHubAccount;
import com.devpilot.github.GitHubAccountRepository;
import com.devpilot.common.utils.EncryptionUtils;
import com.devpilot.repository.Repository;
import com.devpilot.repository.RepositoryFile;
import com.devpilot.repository.RepositoryFileRepository;
import com.devpilot.repository.RepositoryRepository;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class IngestionService {

    private final IngestionJobRepository ingestionJobRepository;
    private final RepositoryRepository repositoryRepository;
    private final RepositoryFileRepository repositoryFileRepository;
    private final GitHubAccountRepository gitHubAccountRepository;
    private final EncryptionUtils encryptionUtils;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final long MAX_FILE_SIZE_BYTES = 500 * 1024; // 500 KB limit

    public IngestionService(IngestionJobRepository ingestionJobRepository,
                            RepositoryRepository repositoryRepository,
                            RepositoryFileRepository repositoryFileRepository,
                            GitHubAccountRepository gitHubAccountRepository,
                            EncryptionUtils encryptionUtils) {
        this.ingestionJobRepository = ingestionJobRepository;
        this.repositoryRepository = repositoryRepository;
        this.repositoryFileRepository = repositoryFileRepository;
        this.gitHubAccountRepository = gitHubAccountRepository;
        this.encryptionUtils = encryptionUtils;
    }

    @Transactional
    public IngestionJob startIngestion(Long repositoryId, Long userId) {
        Optional<IngestionJob> existingJob = ingestionJobRepository.findFirstByRepositoryIdOrderByStartedAtDesc(repositoryId);
        if (existingJob.isPresent() && (existingJob.get().getStatus().equals("QUEUED") || existingJob.get().getStatus().equals("PROCESSING"))) {
            throw new RuntimeException("Ingestion is already in progress for this repository.");
        }

        Repository repo = repositoryRepository.findById(repositoryId)
                .orElseThrow(() -> new RuntimeException("Repository not found"));

        GitHubAccount account = gitHubAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("GitHub account not linked"));

        if (!repo.getGithubAccountId().equals(account.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        IngestionJob job = new IngestionJob();
        job.setRepositoryId(repositoryId);
        job.setStatus("QUEUED");
        job = ingestionJobRepository.save(job);

        // Clear existing files before ingestion
        repositoryFileRepository.deleteByRepositoryId(repositoryId);

        String accessToken = encryptionUtils.decrypt(account.getEncryptedAccessToken());
        
        // Trigger async process
        processRepositoryAsync(job.getId(), repo.getOwner(), repo.getName(), repo.getDefaultBranch(), accessToken);
        
        return job;
    }

    @Async
    public void processRepositoryAsync(Long jobId, String owner, String name, String branch, String accessToken) {
        IngestionJob job = ingestionJobRepository.findById(jobId).orElse(null);
        if (job == null) return;

        try {
            job.setStatus("PROCESSING");
            ingestionJobRepository.save(job);

            String zipUrl = String.format("https://api.github.com/repos/%s/%s/zipball/%s", owner, name, branch);

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken);
            headers.set("Accept", "application/vnd.github+json");

            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);

            ResponseEntity<byte[]> response = restTemplate.exchange(zipUrl, HttpMethod.GET, entity, byte[].class);
            byte[] zipData = response.getBody();

            if (zipData == null) {
                throw new RuntimeException("Received empty zip file from GitHub");
            }

            List<RepositoryFile> filesToSave = new ArrayList<>();

            try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(zipData))) {
                ZipEntry entry;
                while ((entry = zis.getNextEntry()) != null) {
                    if (entry.isDirectory()) continue;

                    String fullPath = entry.getName();
                    // ZIP structure is usually: Owner-Repo-CommitSha/actual/path...
                    int firstSlashIndex = fullPath.indexOf('/');
                    String cleanPath = (firstSlashIndex != -1) ? fullPath.substring(firstSlashIndex + 1) : fullPath;

                    if (!FileFilterUtils.isPathAllowed(cleanPath)) continue;

                    String filename = cleanPath.substring(cleanPath.lastIndexOf('/') + 1);

                    if (!FileFilterUtils.isExtensionSupported(filename)) continue;
                    if (entry.getSize() > MAX_FILE_SIZE_BYTES) continue; // Skip very large files

                    byte[] contentBytes = readEntryBytes(zis);
                    if (contentBytes.length > MAX_FILE_SIZE_BYTES) continue;

                    RepositoryFile file = new RepositoryFile();
                    file.setRepositoryId(job.getRepositoryId());
                    file.setPath(cleanPath);
                    file.setName(filename);
                    
                    String ext = FileFilterUtils.getExtension(filename);
                    file.setExtension(ext);
                    file.setLanguage(FileFilterUtils.getLanguage(ext));
                    file.setSizeBytes((long) contentBytes.length);
                    
                    // Simple check to ensure valid string
                    String contentStr = new String(contentBytes, StandardCharsets.UTF_8);
                    // Avoid inserting garbled binary data posing as text
                    if (!contentStr.contains("\0")) {
                        file.setContent(contentStr);
                        filesToSave.add(file);
                    }
                }
            }

            repositoryFileRepository.saveAll(filesToSave);

            job.setStatus("COMPLETED");
            job.setCompletedAt(LocalDateTime.now());
            ingestionJobRepository.save(job);

        } catch (Exception e) {
            job.setStatus("FAILED");
            job.setErrorMessage(e.getMessage());
            job.setCompletedAt(LocalDateTime.now());
            ingestionJobRepository.save(job);
        }
    }

    private byte[] readEntryBytes(ZipInputStream zis) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        byte[] buffer = new byte[8192];
        int read;
        while ((read = zis.read(buffer)) != -1) {
            baos.write(buffer, 0, read);
        }
        return baos.toByteArray();
    }
}
