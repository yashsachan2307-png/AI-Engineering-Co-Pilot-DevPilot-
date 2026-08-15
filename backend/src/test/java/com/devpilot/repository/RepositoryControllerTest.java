package com.devpilot.repository;

import com.devpilot.github.GitHubAccount;
import com.devpilot.github.GitHubAccountRepository;
import com.devpilot.github.GitHubService;
import com.devpilot.github.dto.GitHubRepositoryResponse;
import com.devpilot.security.UserDetailsImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class RepositoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GitHubService gitHubService;

    @MockBean
    private GitHubAccountRepository gitHubAccountRepository;

    @MockBean
    private RepositoryRepository repositoryRepository;

    @MockBean
    private RepositoryFileRepository repositoryFileRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private UserDetailsImpl userDetails;

    @BeforeEach
    void setUp() {
        userDetails = new UserDetailsImpl(1L, "1", "password", "Test User", List.of());
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    }

    @Test
    void testGetUserRepositories() throws Exception {
        GitHubAccount account = new GitHubAccount();
        account.setId(100L);
        account.setUserId(1L);

        Repository repo = new Repository();
        repo.setId(10L);
        repo.setName("test-repo");

        Mockito.when(gitHubAccountRepository.findByUserId(1L)).thenReturn(Optional.of(account));
        Mockito.when(repositoryRepository.findByGithubAccountId(100L)).thenReturn(List.of(repo));

        mockMvc.perform(get("/api/repositories")
                        .principal(() -> "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10))
                .andExpect(jsonPath("$[0].name").value("test-repo"));
    }

    @Test
    void testImportRepositorySuccess() throws Exception {
        GitHubAccount account = new GitHubAccount();
        account.setId(100L);
        account.setUserId(1L);

        GitHubRepositoryResponse mockDetails = new GitHubRepositoryResponse();
        mockDetails.setId(555L);
        mockDetails.setName("new-repo");
        GitHubRepositoryResponse.Owner owner = new GitHubRepositoryResponse.Owner();
        owner.setLogin("testowner");
        mockDetails.setOwner(owner);
        mockDetails.setDefaultBranch("main");
        mockDetails.setVisibility("public");

        Repository savedRepo = new Repository();
        savedRepo.setId(20L);
        savedRepo.setName("new-repo");

        Mockito.when(gitHubAccountRepository.findByUserId(1L)).thenReturn(Optional.of(account));
        Mockito.when(repositoryRepository.findByGithubIdAndGithubAccountId(555L, 100L)).thenReturn(Optional.empty());
        Mockito.when(gitHubService.fetchRepositoryDetails(1L, 555L)).thenReturn(mockDetails);
        Mockito.when(repositoryRepository.save(any(Repository.class))).thenReturn(savedRepo);

        mockMvc.perform(post("/api/repositories/import")
                        .principal(() -> "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("githubId", 555L))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(20))
                .andExpect(jsonPath("$.name").value("new-repo"));
    }
}
