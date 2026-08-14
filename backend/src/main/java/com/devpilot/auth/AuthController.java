package com.devpilot.auth;

import com.devpilot.auth.dto.JwtResponse;
import com.devpilot.auth.dto.LoginRequest;
import com.devpilot.auth.dto.SignupRequest;
import com.devpilot.common.dto.ApiResponse;
import com.devpilot.security.JwtUtils;
import com.devpilot.security.UserDetailsImpl;
import com.devpilot.user.User;
import com.devpilot.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<String>> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error("Error: Email is already in use!"));
        }

        User user = new User(
                signUpRequest.getName(),
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()),
                "USER",
                "ACTIVE"
        );

        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success("User registered successfully!"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponse>> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        String role = userDetails.getAuthorities() != null && !userDetails.getAuthorities().isEmpty()
                ? userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "")
                : "USER";

        JwtResponse jwtResponse = new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getName(),
                role);

        return ResponseEntity.ok(ApiResponse.success(jwtResponse));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUser(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities() != null && !userDetails.getAuthorities().isEmpty()
                ? userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "")
                : "USER";
        Map<String, Object> userData = Map.of(
                "id", userDetails.getId(),
                "name", userDetails.getName(),
                "email", userDetails.getUsername(),
                "role", role
        );
        return ResponseEntity.ok(ApiResponse.success(userData));
    }
}
