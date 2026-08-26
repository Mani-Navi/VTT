package com.VTT.V10.websocket;

import com.VTT.V10.room.dto.RoomMemberResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class RoomSessionManager {

    private final SimpMessagingTemplate messagingTemplate;
    private final com.VTT.V10.room.RoomService roomService;

    public RoomSessionManager(SimpMessagingTemplate messagingTemplate, @Lazy com.VTT.V10.room.RoomService roomService) {
        this.messagingTemplate = messagingTemplate;
        this.roomService = roomService;
    }

    // نگاشت RoomId -> Map<UserId, SessionId>
    private final Map<UUID, Map<UUID, String>> roomOnlineUsers = new ConcurrentHashMap<>();
    // نگاشت SessionId -> SessionDetails
    private final Map<String, UserSessionDetails> sessions = new ConcurrentHashMap<>();
    // نگاشت UserId -> RoomId (قانون تک‌اتاقی)
    private final Map<UUID, UUID> userActiveRoom = new ConcurrentHashMap<>();

    public synchronized void addUser(UUID roomId, String sessionId, UUID userId, String username, String email) {
        if (roomId == null || sessionId == null || userId == null) return;

        UUID previousRoomId = userActiveRoom.get(userId);
        if (previousRoomId != null && !previousRoomId.equals(roomId)) {
            Map<UUID, String> prevUsers = roomOnlineUsers.get(previousRoomId);
            if (prevUsers != null) {
                prevUsers.remove(userId);
            }
            sessions.entrySet().removeIf(e -> e.getValue().userId().equals(userId) && e.getValue().roomId().equals(previousRoomId));
            broadcastOnlineMembers(previousRoomId);
        }

        userActiveRoom.put(userId, roomId);
        sessions.put(sessionId, new UserSessionDetails(sessionId, roomId, userId, username, email));

        roomOnlineUsers.computeIfAbsent(roomId, k -> new ConcurrentHashMap<>()).put(userId, sessionId);

        broadcastOnlineMembers(roomId);
        log.info("Presence: User {} ({}) is ONLINE in Room {}", username, userId, roomId);
    }

    public synchronized void removeSession(String sessionId) {
        if (sessionId == null) return;

        UserSessionDetails details = sessions.remove(sessionId);
        if (details != null) {
            UUID userId = details.userId();
            UUID roomId = details.roomId();

            boolean hasOtherSessions = sessions.values().stream()
                    .anyMatch(s -> s.userId().equals(userId) && s.roomId().equals(roomId));

            if (!hasOtherSessions) {
                Map<UUID, String> users = roomOnlineUsers.get(roomId);
                if (users != null) {
                    users.remove(userId);
                }
                if (roomId.equals(userActiveRoom.get(userId))) {
                    userActiveRoom.remove(userId);
                }
                broadcastOnlineMembers(roomId);
                log.info("Presence: User {} ({}) is OFFLINE from Room {}", details.username(), userId, roomId);
            }
        }
    }

    public synchronized void removeUser(UUID roomId, UUID userId) {
        if (roomId == null || userId == null) return;
        Map<UUID, String> users = roomOnlineUsers.get(roomId);
        if (users != null) {
            users.remove(userId);
        }
        sessions.entrySet().removeIf(e -> e.getValue().userId().equals(userId) && e.getValue().roomId().equals(roomId));
        if (roomId.equals(userActiveRoom.get(userId))) {
            userActiveRoom.remove(userId);
        }
        broadcastOnlineMembers(roomId);
    }

    public synchronized void clearRoom(UUID roomId) {
        if (roomId == null) return;

        Map<UUID, String> users = roomOnlineUsers.remove(roomId);
        if (users != null) {
            for (UUID userId : users.keySet()) {
                if (roomId.equals(userActiveRoom.get(userId))) {
                    userActiveRoom.remove(userId);
                }
            }
        }
        sessions.entrySet().removeIf(e -> e.getValue().roomId().equals(roomId));
        broadcastOnlineMembers(roomId);
        log.info("Presence: Room {} memory cleared completely", roomId);
    }

    public UserSessionDetails getSessionDetails(String sessionId) {
        return sessions.get(sessionId);
    }

    public Set<UUID> getOnlineUserIds(UUID roomId) {
        if (roomId == null) return Collections.emptySet();
        Map<UUID, String> users = roomOnlineUsers.get(roomId);
        if (users == null) return Collections.emptySet();
        return new HashSet<>(users.keySet());
    }

    public void broadcastOnlineMembers(UUID roomId) {
        if (roomId == null) return;
        try {
            List<RoomMemberResponse> onlineMembers = roomService.getOnlineRoomMembers(roomId);
            messagingTemplate.convertAndSend("/topic/room/" + roomId + "/users", onlineMembers);
        } catch (Exception e) {
            log.error("Error broadcasting online members for room {}: {}", roomId, e.getMessage());
        }
    }

    public void broadcastOnlineUsers(UUID roomId) {
        broadcastOnlineMembers(roomId);
    }

    public record UserSessionDetails(String sessionId, UUID roomId, UUID userId, String username, String email) {}
}