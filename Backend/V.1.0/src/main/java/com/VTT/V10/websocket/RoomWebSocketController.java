package com.VTT.V10.websocket;

import com.VTT.V10.room.*;
import com.VTT.V10.room.dto.RoomSettingsResponse;
import com.VTT.V10.websocket.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class RoomWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final TokenService tokenService;
    private final DrawingService drawingService;
    private final FogService fogService;
    private final RoomService roomService;
    private final RoomSettingsService roomSettingsService;
    private final RoomMemberRepository roomMemberRepository;
    private final PlayerPermissionRepository permissionRepository;

    // ۱. جابه‌جایی توکن (Token Move)
    @MessageMapping("/room/{roomId}/token/move")
    public void handleTokenMove(
            @DestinationVariable UUID roomId,
            @Payload SocketEvent<TokenMoveEvent> event
    ) {
        // تمدید زمان فعالیت اتاق
        roomService.updateLastActive(roomId);

        // آپدیت در دیتابیس
        tokenService.updateTokenPosition(
                event.getData().getTokenId(),
                event.getData().getX(),
                event.getData().getY(),
                event.getData().getRotation()
        );
        // پخش پیام
        messagingTemplate.convertAndSend("/topic/room/" + roomId, event);
    }

    // ۲. نقاشی (Drawing) - با چک کردن پرمیشن
    @MessageMapping("/room/{roomId}/drawing")
    public void handleDrawing(
            @DestinationVariable UUID roomId,
            @Payload SocketEvent<DrawingEvent> event,
            Principal principal
    ) {
        roomService.updateLastActive(roomId);

        if (hasPermission(roomId, principal.getName(), "DRAWING")) {
            drawingService.saveDrawing(event.getData().getSceneId(), event.getData());
            messagingTemplate.convertAndSend("/topic/room/" + roomId, event);
        }
    }

    // ۳. مه جنگ (Fog) - با چک کردن پرمیشن
    @MessageMapping("/room/{roomId}/fog")
    public void handleFog(
            @DestinationVariable UUID roomId,
            @Payload SocketEvent<FogEvent> event,
            Principal principal
    ) {
        roomService.updateLastActive(roomId);

        if (hasPermission(roomId, principal.getName(), "FOG")) {
            fogService.handleFogUpdate(event.getData());
            messagingTemplate.convertAndSend("/topic/room/" + roomId, event);
        }
    }

    // ۴. سیستم تاس‌ریز (Dice Roller)
    @MessageMapping("/room/{roomId}/dice")
    public void handleDiceRoll(
            @DestinationVariable UUID roomId,
            @Payload SocketEvent<DiceRollEvent> event
    ) {
        roomService.updateLastActive(roomId);
        // پخش نتیجه تاس برای همه
        messagingTemplate.convertAndSend("/topic/room/" + roomId, event);
    }

    // ۵. آپدیت تنظیمات اتاق (Settings)
    @MessageMapping("/room/{roomId}/settings")
    public void handleSettingsUpdate(
            @DestinationVariable UUID roomId,
            @Payload SocketEvent<RoomSettingsResponse> event,
            Principal principal
    ) {
        roomService.updateLastActive(roomId);

        // فقط GM اجازه تغییر تنظیمات را دارد
        RoomMember member = roomMemberRepository.findByRoomIdAndUserEmail(roomId, principal.getName()).orElseThrow();
        if (member.getRole() == RoomMember.Role.ADMIN) {
            roomSettingsService.updateSettings(roomId, event.getData());
            // اطلاع به بقیه برای تغییر تم یا گرید در فرانت‌اند
            messagingTemplate.convertAndSend("/topic/room/" + roomId + "/settings", event);
        }
    }

    /**
     * متد مرکزی برای بررسی سطح دسترسی کاربر
     */
    private boolean hasPermission(UUID roomId, String email, String action) {
        RoomMember member = roomMemberRepository.findByRoomIdAndUserEmail(roomId, email)
                .orElseThrow(() -> new RuntimeException("کاربر عضو این اتاق نیست"));

        if (member.getRole() == RoomMember.Role.ADMIN) return true;

        PlayerPermission perm = permissionRepository.findByMemberId(member.getId())
                .orElseThrow(() -> new RuntimeException("دسترسی‌ها یافت نشد"));

        return switch (action) {
            case "DRAWING" -> perm.getCanDrawing();
            case "FOG" -> perm.getCanFog();
            case "SCENE" -> perm.getCanScene();
            case "ASSETS" -> perm.getCanAssets();
            default -> false;
        };
    }
}