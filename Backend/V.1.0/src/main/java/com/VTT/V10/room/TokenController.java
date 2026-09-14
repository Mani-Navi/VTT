package com.VTT.V10.room;

import com.VTT.V10.room.dto.AddTokenRequest;
import com.VTT.V10.room.dto.TokenResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/tokens")
@RequiredArgsConstructor
public class TokenController {

    private final TokenService tokenService;

    @PostMapping
    public ResponseEntity<TokenResponse> addToken(
            @Valid @RequestBody AddTokenRequest request,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "دسترسی غیرمجاز");
        }
        return ResponseEntity.ok(tokenService.addToken(request, authentication.getName()));
    }
}