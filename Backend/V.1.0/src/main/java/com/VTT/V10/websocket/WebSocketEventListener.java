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
        String username = accessor.getUser().getName();
        String sessionId = accessor.getSessionId();
        // فرض می‌کنیم roomId را از هدر در زمان اتصال می‌فرستیم
        String roomIdStr = accessor.getFirstNativeHeader("roomId");

        if (roomIdStr != null) {
            UUID roomId = UUID.fromString(roomIdStr);
            sessionManager.addUser(roomId, sessionId, username);
            broadcastOnlineUsers(roomId);
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        RoomSessionManager.UserSessionInfo info = sessionManager.removeSession(event.getSessionId());
        if (info != null) {
            broadcastOnlineUsers(info.roomId());
        }
    }

    private void broadcastOnlineUsers(UUID roomId) {
        var users = sessionManager.getOnlineUsers(roomId);
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/users", users);
    }
}