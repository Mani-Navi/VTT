package com.VTT.V10.websocket;

import com.VTT.V10.room.*;
import com.VTT.V10.room.dto.RoomSettingsResponse;
import com.VTT.V10.user.User;
import com.VTT.V10.user.UserRepository;
import com.VTT.V10.websocket.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Controller
@RequiredArgsConstructor
public class RoomWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final TokenService tokenService;
    private final DrawingService drawingService;
    private final FogService fogService;
    private final RoomService roomService;
    private final RoomRepository roomRepository;
    private final RoomSettingsService roomSettingsService;
    private final RoomMemberRepository roomMemberRepository;
    private final PlayerPermissionRepository permissionRepository;
    private final RoomSessionManager sessionManager;
    private final UserRepository userRepository;
    private final SceneRepository sceneRepository;

    @MessageMapping("/room/{roomId}/presence/join")
    public void handlePresenceJoin(
            @DestinationVariable UUID roomId,
            @Header("simpSessionId") String sessionId,
            Principal principal
    ) {
        if (principal == null || sessionId == null) return;

        Optional<User> userOpt = userRepository.findByEmail(principal.getName());
        userOpt.ifPresent(user -> {
            sessionManager.addUser(roomId, sessionId, user.getId(), user.getUsername(), user.getEmail());
            roomService.updateLastActive(roomId, user.getUsername());
        });
    }

    @MessageMapping("/room/{roomId}/presence/leave")
    public void handlePresenceLeave(
            @DestinationVariable UUID roomId,
            Principal principal
    ) {
        if (principal == null) return;
        Optional<User> userOpt = userRepository.findByEmail(principal.getName());
        userOpt.ifPresent(user -> sessionManager.removeUser(roomId, user.getId()));
    }

    @MessageMapping("/room/{roomId}/token/move")
    public void handleTokenMove(
            @DestinationVariable UUID roomId,
            @Payload SocketEvent<TokenMoveEvent> event,
            Principal principal
    ) {
        if (event == null || event.getData() == null || principal == null) return;

        roomService.updateLastActive(roomId, principal.getName());
        try {
            tokenService.updateTokenFromEvent(event.getData(), principal.getName(), roomId);
        } catch (Exception e) {
            log.warn("Token save warning: {}", e.getMessage());
        }
        messagingTemplate.convertAndSend("/topic/room/" + roomId, event);
    }

    @MessageMapping("/room/{roomId}/conditions")
    public void handleConditionPoolUpdate(
            @DestinationVariable UUID roomId,
            @Payload SocketEvent<ConditionPoolEvent> event,
            Principal principal
    ) {
        if (event == null || principal == null || event.getData() == null) return;

        roomService.updateLastActive(roomId, principal.getName());

        var memberOpt = roomMemberRepository.findByRoomIdAndUserEmail(roomId, principal.getName());
        if (memberOpt.isPresent() && (memberOpt.get().getRole() == RoomMember.Role.ADMIN || isHost(roomId, principal.getName()))) {
            var activeSceneOpt = sceneRepository.findByRoomIdAndIsActiveTrue(roomId);
            if (activeSceneOpt.isEmpty()) {
                var scenes = sceneRepository.findByRoomId(roomId);
                if (!scenes.isEmpty()) {
                    activeSceneOpt = Optional.of(scenes.get(0));
                }
            }

            activeSceneOpt.ifPresent(scene -> {
                scene.setAvailableConditions(event.getData().getAvailableConditions());
                sceneRepository.save(scene);
            });

            messagingTemplate.convertAndSend("/topic/room/" + roomId, event);
        }
    }

    @MessageMapping("/room/{roomId}/role-title")
    public void handleRoleTitleUpdate(
            @DestinationVariable UUID roomId,
            @Payload SocketEvent<Map<String, Object>> event,
            Principal principal
    ) {
        if (event == null || principal == null || event.getData() == null) return;
        roomService.updateLastActive(roomId, principal.getName());

        try {
            Map<String, Object> data = event.getData();
            String title = (String) data.get("title");
            String targetType = (String) data.get("targetType");

            Optional<Room> roomOpt = roomRepository.findById(roomId);
            if (roomOpt.isPresent() && title != null && !title.isBlank()) {
                Room room = roomOpt.get();
                if ("HOST".equalsIgnoreCase(targetType)) {
                    room.setHostRoleTitle(title.trim());
                } else {
                    room.setPlayerRoleTitle(title.trim());
                }
                roomRepository.save(room);
            }
        } catch (Exception e) {
            log.warn("Error saving role title on room: {}", e.getMessage());
        }

        messagingTemplate.convertAndSend("/topic/room/" + roomId, event);
    }

    @MessageMapping("/room/{roomId}/event")
    public void handleGenericEvent(
            @DestinationVariable UUID roomId,
            @Payload SocketEvent<Object> event,
            Principal principal
    ) {
        if (event == null) return;
        if (principal != null) {
            roomService.updateLastActive(roomId, principal.getName());
        }
        messagingTemplate.convertAndSend("/topic/room/" + roomId, event);
    }

    @MessageMapping("/room/{roomId}/drawing")
    public void handleDrawing(
            @DestinationVariable UUID roomId,
            @Payload SocketEvent<DrawingEvent> event,
            Principal principal
    ) {
        if (principal == null || event == null || event.getData() == null) return;

        roomService.updateLastActive(roomId, principal.getName());

        if (hasPermission(roomId, principal.getName(), "DRAWING")) {
            try {
                if (event.getData().getSceneId() != null) {
                    drawingService.saveOrUpdateDrawing(event.getData().getSceneId(), event.getData());
                }
            } catch (Exception e) {
                log.warn("Drawing save/update in DB warning: {}", e.getMessage());
            }
            messagingTemplate.convertAndSend("/topic/room/" + roomId, event);
        }
    }

    @MessageMapping("/room/{roomId}/drawing/delete")
    public void handleDrawingDelete(
            @DestinationVariable UUID roomId,
            @Payload SocketEvent<DrawingEvent> event,
            Principal principal
    ) {
        if (principal == null || event == null || event.getData() == null) return;

        roomService.updateLastActive(roomId, principal.getName());

        if (hasPermission(roomId, principal.getName(), "DRAWING")) {
            try {
                String targetId = event.getData().getClientDrawingId() != null
                        ? event.getData().getClientDrawingId()
                        : (event.getData().getId() != null ? event.getData().getId() : event.getData().getDrawingId());

                drawingService.deleteDrawing(event.getData().getSceneId(), targetId);
            } catch (Exception e) {
                log.warn("Drawing delete DB error: {}", e.getMessage());
            }
            // برادکست به همه اعضای اتاق
            messagingTemplate.convertAndSend("/topic/room/" + roomId, event);
        }
    }

    @MessageMapping("/room/{roomId}/fog")
    public void handleFog(
            @DestinationVariable UUID roomId,
            @Payload SocketEvent<FogEvent> event,
            Principal principal
    ) {
        if (principal == null || event == null || event.getData() == null) return;

        roomService.updateLastActive(roomId, principal.getName());

        if (hasPermission(roomId, principal.getName(), "FOG")) {
            try {
                fogService.handleFogUpdate(event.getData());
            } catch (Exception e) {
                log.warn("Fog save in DB warning: {}", e.getMessage());
            }
            messagingTemplate.convertAndSend("/topic/room/" + roomId, event);
        }
    }

    @MessageMapping("/room/{roomId}/dice")
    public void handleDiceRoll(
            @DestinationVariable UUID roomId,
            @Payload SocketEvent<DiceRollEvent> event,
            Principal principal
    ) {
        if (event == null) return;
        if (principal != null) {
            roomService.updateLastActive(roomId, principal.getName());
        }
        messagingTemplate.convertAndSend("/topic/room/" + roomId, event);
    }

    @MessageMapping("/room/{roomId}/settings")
    public void handleSettingsUpdate(
            @DestinationVariable UUID roomId,
            @Payload SocketEvent<RoomSettingsResponse> event,
            Principal principal
    ) {
        if (principal == null || event == null || event.getData() == null) return;

        roomService.updateLastActive(roomId, principal.getName());

        var memberOpt = roomMemberRepository.findByRoomIdAndUserEmail(roomId, principal.getName());
        if (memberOpt.isPresent() && (memberOpt.get().getRole() == RoomMember.Role.ADMIN || isHost(roomId, principal.getName()))) {
            roomSettingsService.updateSettings(roomId, event.getData());
            messagingTemplate.convertAndSend("/topic/room/" + roomId + "/settings", event);
        }
    }

    private boolean isHost(UUID roomId, String email) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(email);
            Optional<Room> roomOpt = roomRepository.findById(roomId);
            if (userOpt.isPresent() && roomOpt.isPresent()) {
                Room room = roomOpt.get();
                if (room.getOwner() != null && userOpt.get().getId() != null) {
                    return room.getOwner().getId().equals(userOpt.get().getId());
                }
            }
        } catch (Exception ignored) {}
        return false;
    }

    private boolean hasPermission(UUID roomId, String email, String action) {
        try {
            if (isHost(roomId, email)) return true;

            var memberOpt = roomMemberRepository.findByRoomIdAndUserEmail(roomId, email);
            if (memberOpt.isEmpty()) return false;

            RoomMember member = memberOpt.get();
            if (member.getRole() == RoomMember.Role.ADMIN) return true;

            var permOpt = permissionRepository.findByMemberId(member.getId());
            if (permOpt.isEmpty()) return false;

            PlayerPermission perm = permOpt.get();
            return switch (action) {
                case "DRAWING" -> Boolean.TRUE.equals(perm.getCanDrawing());
                case "FOG" -> Boolean.TRUE.equals(perm.getCanFog());
                case "SCENE" -> Boolean.TRUE.equals(perm.getCanScene());
                case "ASSETS" -> Boolean.TRUE.equals(perm.getCanAssets());
                case "EDIT_TOKEN" -> Boolean.TRUE.equals(perm.getCanEditToken());
                default -> false;
            };
        } catch (Exception e) {
            log.error("Error checking permission for user {} in room {}: {}", email, roomId, e.getMessage());
            return false;
        }
    }
}