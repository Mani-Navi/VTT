package com.VTT.V10.room;

import com.VTT.V10.asset.Asset;
import com.VTT.V10.asset.AssetRepository;
import com.VTT.V10.room.dto.AddTokenRequest;
import com.VTT.V10.room.dto.TokenResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
                .orElseThrow(() -> new RuntimeException("سکانس یافت نشد"));
        Asset asset = assetRepository.findById(request.getAssetId())
                .orElseThrow(() -> new RuntimeException("فایل یافت نشد"));

        Token token = Token.builder()
                .scene(scene)
                .asset(asset)
                .label(request.getLabel())
                .x(request.getX())
                .y(request.getY())
                .rotation(0.0)
                .hp(10)
                .maxHp(10)
                .build();

        tokenRepository.save(token);
        return convertToResponse(token);
    }

    // ۲. آپدیت مختصات توکن (صدا زده شده توسط وب‌ساکت)
    @Transactional
    public void updateTokenPosition(UUID tokenId, Double x, Double y, Double rotation) {
        tokenRepository.findById(tokenId).ifPresent(token -> {
            token.setX(x);
            token.setY(y);
            token.setRotation(rotation);
            // به دلیل @Transactional، ذخیره خودکار انجام می‌شود اما صراحتا می‌نویسیم:
            tokenRepository.save(token);
        });
    }

    // ۳. دریافت تمام توکن‌های یک سکانس
    public List<TokenResponse> getTokensByScene(UUID sceneId) {
        return tokenRepository.findBySceneId(sceneId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private TokenResponse convertToResponse(Token token) {
        return TokenResponse.builder()
                .id(token.getId())
                .label(token.getLabel())
                .x(token.getX())
                .y(token.getY())
                .rotation(token.getRotation())
                .assetUrl(token.getAsset().getFileUrl())
                .hp(token.getHp())
                .maxHp(token.getMaxHp())
                .build();
    }
}