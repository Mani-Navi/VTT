package com.VTT.V10.room;

import com.VTT.V10.asset.Asset;
import com.VTT.V10.asset.AssetRepository;
import com.VTT.V10.room.dto.AddTokenRequest;
import com.VTT.V10.room.dto.TokenResponse;
import com.VTT.V10.websocket.dto.TokenMoveEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TokenService {
    private final TokenRepository tokenRepository;
    private final SceneRepository sceneRepository;
    private final AssetRepository assetRepository;

    @Transactional
    public TokenResponse addToken(AddTokenRequest request) {
        Scene scene = sceneRepository.findById(request.getSceneId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "صحنه یافت نشد"));

        Asset asset = null;
        if (request.getAssetId() != null) {
            asset = assetRepository.findById(request.getAssetId()).orElse(null);
        }

        String finalAvatar = request.getAvatarUrl();
        if ((finalAvatar == null || finalAvatar.isBlank()) && asset != null) {
            finalAvatar = asset.getFileUrl();
        }

        Token token = Token.builder()
                .scene(scene)
                .asset(asset)
                .label(request.getLabel() != null ? request.getLabel() : "توکن")
                .avatarUrl(finalAvatar)
                .x(request.getX() != null ? request.getX() : 0.0)
                .y(request.getY() != null ? request.getY() : 0.0)
                .size(request.getSize() != null ? request.getSize() : 1.0)
                .rotation(0.0)
                .hp(request.getHp() != null ? request.getHp() : 20)
                .maxHp(request.getMaxHp() != null ? request.getMaxHp() : 20)
                .ac(request.getAc() != null ? request.getAc() : 12)
                .controlledBy(request.getControlledBy())
                .gmNotes(request.getGmNotes())
                .isProp(Boolean.TRUE.equals(request.getIsProp()))
                .goldValue(request.getGoldValue())
                .xpValue(request.getXpValue())
                .isLooted(false)
                .showHp(request.getShowHp() != null ? request.getShowHp() : true)
                .showName(request.getShowName() != null ? request.getShowName() : true)
                .showAc(request.getShowAc() != null ? request.getShowAc() : false)
                .showConditions(request.getShowConditions() != null ? request.getShowConditions() : true)
                .showNotes(request.getShowNotes() != null ? request.getShowNotes() : false)
                .conditions(request.getConditions() != null ? request.getConditions() : new ArrayList<>())
                .build();

        tokenRepository.save(token);
        return convertToResponse(token);
    }

    @Transactional
    public void updateTokenFromEvent(TokenMoveEvent data) {
        if (data == null || data.getTokenId() == null) return;

        try {
            UUID tokenId = UUID.fromString(data.getTokenId());

            if (Boolean.TRUE.equals(data.getIsDeleted())) {
                tokenRepository.deleteById(tokenId);
                return;
            }

            tokenRepository.findById(tokenId).ifPresent(token -> {
                if (data.getX() != null) token.setX(data.getX());
                if (data.getY() != null) token.setY(data.getY());
                if (data.getRotation() != null) token.setRotation(data.getRotation());
                if (data.getSize() != null) token.setSize(data.getSize());
                if (data.getName() != null) token.setLabel(data.getName());
                if (data.getLabel() != null) token.setLabel(data.getLabel());
                if (data.getAvatarUrl() != null) token.setAvatarUrl(data.getAvatarUrl());
                if (data.getHp() != null) token.setHp(data.getHp());
                if (data.getMaxHp() != null) token.setMaxHp(data.getMaxHp());
                if (data.getAc() != null) token.setAc(data.getAc());
                if (data.getGmNotes() != null) token.setGmNotes(data.getGmNotes());
                if (data.getGoldValue() != null) token.setGoldValue(data.getGoldValue());
                if (data.getXpValue() != null) token.setXpValue(data.getXpValue());
                if (data.getIsHidden() != null) token.setIsHidden(data.getIsHidden());
                if (data.getIsLocked() != null) token.setIsLocked(data.getIsLocked());
                if (data.getShowHp() != null) token.setShowHp(data.getShowHp());
                if (data.getShowName() != null) token.setShowName(data.getShowName());
                if (data.getShowAc() != null) token.setShowAc(data.getShowAc());
                if (data.getShowConditions() != null) token.setShowConditions(data.getShowConditions());
                if (data.getShowNotes() != null) token.setShowNotes(data.getShowNotes());
                if (data.getConditions() != null) token.setConditions(data.getConditions());

                tokenRepository.save(token);
            });
        } catch (IllegalArgumentException ignored) {
        }
    }

    @Transactional(readOnly = true)
    public List<TokenResponse> getTokensByScene(UUID sceneId) {
        return tokenRepository.findBySceneId(sceneId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public TokenResponse convertToResponse(Token token) {
        String finalUrl = token.getAvatarUrl();
        if ((finalUrl == null || finalUrl.isBlank()) && token.getAsset() != null) {
            finalUrl = token.getAsset().getFileUrl();
        }

        return TokenResponse.builder()
                .id(token.getId())
                .label(token.getLabel())
                .x(token.getX())
                .y(token.getY())
                .rotation(token.getRotation())
                .size(token.getSize() != null ? token.getSize() : 1.0)
                .assetUrl(finalUrl != null ? finalUrl : "")
                .hp(token.getHp())
                .maxHp(token.getMaxHp())
                .ac(token.getAc())
                .elevation(token.getElevation())
                .isHidden(token.getIsHidden())
                .isLocked(token.getIsLocked())
                .controlledBy(token.getControlledBy())
                .gmNotes(token.getGmNotes())
                .isProp(token.getIsProp())
                .goldValue(token.getGoldValue())
                .xpValue(token.getXpValue())
                .isLooted(token.getIsLooted())
                .showHp(token.getShowHp() != null ? token.getShowHp() : true)
                .showName(token.getShowName() != null ? token.getShowName() : true)
                .showAc(token.getShowAc() != null ? token.getShowAc() : false)
                .showConditions(token.getShowConditions() != null ? token.getShowConditions() : true)
                .showNotes(token.getShowNotes() != null ? token.getShowNotes() : false)
                .conditions(token.getConditions() != null ? token.getConditions() : new ArrayList<>())
                .build();
    }
}