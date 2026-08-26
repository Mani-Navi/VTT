package com.VTT.V10.websocket;

import com.VTT.V10.room.RoomService;
import com.VTT.V10.user.User;
import com.VTT.V10.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final RoomSessionManager sessionManager;
    private final UserRepository userRepository;
    private final RoomService roomService;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());

        if (accessor.getUser() != null) {
            String userEmail = accessor.getUser().getName();
            String sessionId = accessor.getSessionId();
            String roomIdStr = accessor.getFirstNativeHeader("roomId");

            if (roomIdStr != null && sessionId != null) {
                try {
                    UUID roomId = UUID.fromString(roomIdStr);
                    Optional<User> userOpt = userRepository.findByEmail(userEmail);

                    if (userOpt.isPresent()) {
                        User user = userOpt.get();
                        sessionManager.addUser(roomId, sessionId, user.getId(), user.getUsername(), user.getEmail());
                    }
                } catch (IllegalArgumentException ignored) {
                }
            }
        }
    }

    @EventListener
    public void handleWebSocketSubscribeListener(SessionSubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = accessor.getDestination();

        if (destination != null && destination.startsWith("/topic/room/") && destination.endsWith("/users")) {
            try {
                String[] parts = destination.split("/");
                if (parts.length >= 4) {
                    UUID roomId = UUID.fromString(parts[3]);
                    sessionManager.broadcastOnlineMembers(roomId);
                }
            } catch (Exception ignored) {
            }
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        if (sessionId != null) {
            RoomSessionManager.UserSessionDetails details = sessionManager.getSessionDetails(sessionId);
            if (details != null) {
                roomService.updateGmLastSeenOnDisconnect(details.roomId(), details.userId());
            }
            sessionManager.removeSession(sessionId);
        }
    }
}