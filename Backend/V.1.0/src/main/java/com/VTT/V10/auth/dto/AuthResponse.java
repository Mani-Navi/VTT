package com.VTT.V10.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data @Builder @AllArgsConstructor
public class AuthResponse {
    private String token;
    private UUID userId;
    private String username;
    private String email;
}