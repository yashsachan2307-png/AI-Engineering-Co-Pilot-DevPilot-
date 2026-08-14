package com.devpilot.github;

import com.devpilot.common.utils.EncryptionUtils;
import com.devpilot.github.dto.GitHubRepositoryResponse;
import com.devpilot.github.dto.GitHubTokenResponse;
import com.devpilot.github.dto.GitHubUserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
public class GitHubService {

    @Value("${devpilot.github.client-id}")
    private String clientId;

    @Value("${devpilot.github.client-secret}")
    private String clientSecret;

    @Value("${devpilot.github.redirect-uri}")
    private String redirectUri;

    private final GitHubAccountRepository gitHubAccountRepository;
    private final EncryptionUtils encryptionUtils;
    private final RestClient restClient = RestClient.create();

    public GitHubService(GitHubAccountRepository gitHubAccountRepository, EncryptionUtils encryptionUtils) {
        this.gitHubAccountRepository = gitHubAccountRepository;
        this.encryptionUtils = encryptionUtils;
    }

    public String getAuthorizationUrl() {
        return "https://github.com/login/oauth/authorize" +
                "?client_id=" + clientId +
                "&redirect_uri=" + redirectUri +
                "&scope=repo read:user";
    }

    @Transactional
    public GitHubAccount exchangeCodeForToken(String code, Long userId) {
        String url = String.format("https://github.com/login/oauth/access_token?client_id=%s&client_secret=%s&code=%s&redirect_uri=%s",
                clientId, clientSecret, code, redirectUri);

        GitHubTokenResponse tokenResponse = restClient.post()
                .uri(url)
                .header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .retrieve()
                .body(GitHubTokenResponse.class);

        if (tokenResponse == null || tokenResponse.getAccessToken() == null) {
            throw new RuntimeException("Failed to exchange GitHub code for token: " + 
                    (tokenResponse != null ? tokenResponse.getErrorDescription() : "Unknown error"));
        }

        String accessToken = tokenResponse.getAccessToken();
        GitHubUserResponse userResponse = fetchGitHubUser(accessToken);

        GitHubAccount account = gitHubAccountRepository.findByUserId(userId).orElse(new GitHubAccount());
        account.setUserId(userId);
        account.setGithubId(userResponse.getId());
        account.setUsername(userResponse.getLogin());
        account.setEncryptedAccessToken(encryptionUtils.encrypt(accessToken));

        return gitHubAccountRepository.save(account);
    }

    private GitHubUserResponse fetchGitHubUser(String accessToken) {
        return restClient.get()
                .uri("https://api.github.com/user")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .header("X-GitHub-Api-Version", "2022-11-28")
                .retrieve()
                .body(GitHubUserResponse.class);
    }

    public List<GitHubRepositoryResponse> fetchUserRepositories(Long userId) {
        String accessToken = getDecryptedAccessToken(userId);

        return restClient.get()
                .uri("https://api.github.com/user/repos?per_page=100&sort=updated")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .header("X-GitHub-Api-Version", "2022-11-28")
                .retrieve()
                .body(new ParameterizedTypeReference<List<GitHubRepositoryResponse>>() {});
    }

    public GitHubRepositoryResponse fetchRepositoryDetails(Long userId, Long githubRepositoryId) {
        String accessToken = getDecryptedAccessToken(userId);

        return restClient.get()
                .uri("https://api.github.com/repositories/" + githubRepositoryId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .header("X-GitHub-Api-Version", "2022-11-28")
                .retrieve()
                .body(GitHubRepositoryResponse.class);
    }

    private String getDecryptedAccessToken(Long userId) {
        GitHubAccount account = gitHubAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("GitHub account not connected for user"));
        return encryptionUtils.decrypt(account.getEncryptedAccessToken());
    }
}
