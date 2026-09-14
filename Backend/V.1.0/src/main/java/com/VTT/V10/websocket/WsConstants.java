package com.VTT.V10.websocket;

public final class WsConstants {

    private WsConstants() {
        // Prevent instantiation
    }

    public static final String TOPIC_ROOM_PREFIX = "/topic/room/";
    public static final String TOPIC_USERS_SUFFIX = "/users";
    public static final String TOPIC_SETTINGS_SUFFIX = "/settings";

    public static final String ACTION_MOVE = "MOVE";
    public static final String ACTION_ADD = "ADD";
    public static final String ACTION_DELETE = "DELETE";
    public static final String ACTION_UPDATE = "UPDATE";

    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_HOST = "HOST";

    public static final String PERM_DRAWING = "DRAWING";
    public static final String PERM_TEXT = "TEXT";
    public static final String PERM_FOG = "FOG";
    public static final String PERM_SCENE = "SCENE";
    public static final String PERM_ASSETS = "ASSETS";
    public static final String PERM_EDIT_TOKEN = "EDIT_TOKEN";
}