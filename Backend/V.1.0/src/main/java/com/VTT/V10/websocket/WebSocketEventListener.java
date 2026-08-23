package com.VTT.V10.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final RoomSessionManager sessionManager;
    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());

        // جلوگیری از NullPointerException در صورتی که کاربر اهراز هویت نشده باشد
        if (accessor.getUser() != null) {
            String username = accessor.getUser().getName();
            String sessionId = accessor.getSessionId();
            String roomIdStr = accessor.getFirstNativeHeader("roomId");

            if (roomIdStr != null && sessionId != null) {
                try {
                    UUID roomId = UUID.fromString(roomIdStr);
                    sessionManager.addUser(roomId, sessionId, username);
                    broadcastOnlineUsers(roomId);
                } catch (IllegalArgumentException ignored) {
                    // شناسه نامعتبر اتاق نادیده گرفته می‌شود
                }
            }
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        if (event.getSessionId() != null) {
            RoomSessionManager.UserSessionInfo info = sessionManager.removeSession(event.getSessionId());
            if (info != null && info.roomId() != null) {
                broadcastOnlineUsers(info.roomId());
            }
        }
    }

    private void broadcastOnlineUsers(UUID roomId) {
        var users = sessionManager.getOnlineUsers(roomId);
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/users", users);
    }
}