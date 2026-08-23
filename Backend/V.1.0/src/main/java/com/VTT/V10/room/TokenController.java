package com.VTT.V10.room;

import com.VTT.V10.room.dto.AddTokenRequest;
import com.VTT.V10.room.dto.TokenResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tokens")
@RequiredArgsConstructor
public class TokenController {
    private final TokenService tokenService;

    @PostMapping
    public ResponseEntity<TokenResponse> addToken(@RequestBody AddTokenRequest request) {
        return ResponseEntity.ok(tokenService.addToken(request));
    }
}