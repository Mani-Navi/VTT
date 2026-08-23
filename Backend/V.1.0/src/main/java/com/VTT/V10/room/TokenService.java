package com.VTT.V10.room;

import com.VTT.V10.asset.Asset;
import com.VTT.V10.asset.AssetRepository;
import com.VTT.V10.room.dto.AddTokenRequest;
import com.VTT.V10.room.dto.TokenResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TokenService {
    private final TokenRepository tokenRepository;
    private final SceneRepository sceneRepository;
    private final AssetRepository assetRepository;

    // ۱. اضافه کردن یک توکن جدید به نقشه
    @Transactional
    public TokenResponse addToken(AddTokenRequest request) {
        Scene scene = sceneRepository.findById(request.getSceneId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "سکانس یافت نشد"));
        Asset asset = assetRepository.findById(request.getAssetId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "فایل آیکون/توکن یافت نشد"));

        Token token = Token.builder()
                .scene(scene)
                .asset(asset)
                .label(request.getLabel())
                .x(request.getX() != null ? request.getX() : 0.0)
                .y(request.getY() != null ? request.getY() : 0.0)
                .rotation(0.0)
                .hp(10)
                .maxHp(10)
                .build();

        tokenRepository.save(token);
        return convertToResponse(token);
    }

    // ۲. آپدیت مختصات توکن
    @Transactional
    public void updateTokenPosition(UUID tokenId, Double x, Double y, Double rotation) {
        tokenRepository.findById(tokenId).ifPresent(token -> {
            if (x != null) token.setX(x);
            if (y != null) token.setY(y);
            if (rotation != null) token.setRotation(rotation);
            tokenRepository.save(token);
        });
    }

    // ۳. دریافت تمام توکن‌های یک سکانس
    @Transactional(readOnly = true)
    public List<TokenResponse> getTokensByScene(UUID sceneId) {
        return tokenRepository.findBySceneId(sceneId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private TokenResponse convertToResponse(Token token) {
        String assetUrl = (token.getAsset() != null) ? token.getAsset().getFileUrl() : "";

        return TokenResponse.builder()
                .id(token.getId())
                .label(token.getLabel())
                .x(token.getX())
                .y(token.getY())
                .rotation(token.getRotation())
                .assetUrl(assetUrl)
                .hp(token.getHp())
                .maxHp(token.getMaxHp())
                .build();
    }
}