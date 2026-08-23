package com.VTT.V10.websocket;

import org.springframework.stereotype.Component;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RoomSessionManager {
    // نقشه: RoomID -> Set of Usernames
    private final Map<UUID, Set<String>> roomUsers = new ConcurrentHashMap<>();
    // نقشه: SessionID -> UserInfo (برای زمان دیسکانکت)
    private final Map<String, UserSessionInfo> sessions = new ConcurrentHashMap<>();

    public void addUser(UUID roomId, String sessionId, String username) {
        roomUsers.computeIfAbsent(roomId, k -> Collections.synchronizedSet(new HashSet<>())).add(username);
        sessions.put(sessionId, new UserSessionInfo(roomId, username));
    }

    public UserSessionInfo removeSession(String sessionId) {
        UserSessionInfo info = sessions.remove(sessionId);
        if (info != null) {
            Set<String> users = roomUsers.get(info.roomId);
            if (users != null) {
                users.remove(info.username);
            }
        }
        return info;
    }

    public Set<String> getOnlineUsers(UUID roomId) {
        return roomUsers.getOrDefault(roomId, Collections.emptySet());
    }

    public record UserSessionInfo(UUID roomId, String username) {}
}