import { useState, useEffect, useRef, useCallback } from "react";
import { Room, RoomEvent, ConnectionState, Track } from "livekit-client";
import { getVoiceToken } from "../api/voice.api";

export function useVoice(roomId, isMutedByGM = false) {
    const [participants, setParticipants] = useState([]);
    const [isMicEnabled, setIsMicEnabled] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);
    const [speakingMap, setSpeakingMap] = useState({});

    const livekitRoom = useRef(null);
    const isMicEnabledRef = useRef(false);
    const isConnectingRef = useRef(false);

    const refreshParticipants = useCallback((room) => {
        if (!room) return;
        const all = [
            room.localParticipant,
            ...Array.from(room.remoteParticipants.values()),
        ].filter(Boolean);

        setParticipants(
            all.map((p) => {
                const audioPub = Array.from(p.audioTrackPublications?.values?.() || [])[0];
                const isParticipantMicOn = audioPub ? !audioPub.isMuted : false;

                return {
                    identity: p.identity,
                    name: p.name || p.identity,
                    isLocal: p === room.localParticipant,
                    isMuted: p === room.localParticipant ? !isMicEnabledRef.current : !isParticipantMicOn,
                };
            })
        );
    }, []);

    const disconnect = useCallback(() => {
        if (livekitRoom.current) {
            try {
                livekitRoom.current.disconnect(true);
            } catch (e) {
                console.warn("[Voice] Disconnect warning:", e);
            }
            livekitRoom.current = null;
        }
        isConnectingRef.current = false;
        setIsConnecting(false);
        setIsConnected(false);
        setIsMicEnabled(false);
        isMicEnabledRef.current = false;
        setParticipants([]);
    }, []);

    const connect = useCallback(async () => {
        if (!roomId) return;
        if (
            isConnectingRef.current ||
            livekitRoom.current?.state === ConnectionState.Connected ||
            livekitRoom.current?.state === ConnectionState.Connecting
        ) {
            return;
        }

        try {
            isConnectingRef.current = true;
            setIsConnecting(true);
            setError(null);

            const { token, url } = await getVoiceToken(roomId);

            const room = new Room({
                adaptiveStream: true,
                dynacast: true,
                stopLocalTrackOnUnpublish: true,
                disconnectOnPageLeave: true,
                audioCaptureDefaults: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });

            room.on(RoomEvent.TrackSubscribed, (track) => {
                if (track.kind === Track.Kind.Audio) {
                    const audioElement = track.attach();
                    document.body.appendChild(audioElement);
                }
                refreshParticipants(room);
            });

            room.on(RoomEvent.TrackUnsubscribed, (track) => {
                track.detach().forEach((element) => element.remove());
                refreshParticipants(room);
            });

            room.on(RoomEvent.ParticipantConnected, () => refreshParticipants(room));
            room.on(RoomEvent.ParticipantDisconnected, () => refreshParticipants(room));

            room.on(RoomEvent.Reconnecting, () => {
                setIsConnecting(true);
            });

            room.on(RoomEvent.Reconnected, () => {
                setIsConnecting(false);
                setIsConnected(true);
                refreshParticipants(room);
            });

            room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
                const map = {};
                speakers.forEach((s) => {
                    map[s.identity] = true;
                });
                setSpeakingMap(map);
            });

            room.on(RoomEvent.Disconnected, () => {
                setIsConnected(false);
                setIsConnecting(false);
                isConnectingRef.current = false;
                setIsMicEnabled(false);
                isMicEnabledRef.current = false;
                setParticipants([]);
            });

            await room.connect(url, token);

            await room.localParticipant.setMicrophoneEnabled(false);
            isMicEnabledRef.current = false;
            setIsMicEnabled(false);

            livekitRoom.current = room;
            setIsConnected(true);
            refreshParticipants(room);
        } catch (err) {
            console.error("[Voice] Connection failed:", err);
            if (!livekitRoom.current || livekitRoom.current.state === ConnectionState.Disconnected) {
                setError("عدم برقراری ارتباط با سرور صدا");
            }
        } finally {
            isConnectingRef.current = false;
            setIsConnecting(false);
        }
    }, [roomId, refreshParticipants]);

    // واکنش آنی به Mute شدن توسط GM: قطع قطعی صدا
    useEffect(() => {
        if (isMutedByGM && livekitRoom.current && isMicEnabledRef.current) {
            isMicEnabledRef.current = false;
            setIsMicEnabled(false);
            livekitRoom.current.localParticipant.setMicrophoneEnabled(false);
            refreshParticipants(livekitRoom.current);
        }
    }, [isMutedByGM, refreshParticipants]);

    const toggleMicrophone = useCallback(async () => {
        // اگر توسط GM میوت شده باشد، اجازه روشن کردن میکروفون را ندارد
        if (isMutedByGM) return;

        const room = livekitRoom.current;
        if (!room || room.state !== ConnectionState.Connected) return;

        try {
            const nextState = !isMicEnabledRef.current;
            isMicEnabledRef.current = nextState;
            setIsMicEnabled(nextState);
            await room.localParticipant.setMicrophoneEnabled(nextState);
            refreshParticipants(room);
        } catch (err) {
            console.error("[Voice] Toggle microphone error:", err);
        }
    }, [isMutedByGM, refreshParticipants]);

    useEffect(() => {
        connect();
        return () => {
            disconnect();
        };
    }, [roomId]);

    useEffect(() => {
        const isTypingContext = () => {
            const activeEl = document.activeElement;
            if (!activeEl) return false;
            const tagName = activeEl.tagName.toUpperCase();
            return (
                tagName === "INPUT" ||
                tagName === "TEXTAREA" ||
                tagName === "SELECT" ||
                activeEl.isContentEditable
            );
        };

        const handleKeyDown = (e) => {
            if (e.code === "Space" && !e.repeat && isConnected && !isTypingContext()) {
                if (!isMutedByGM) {
                    e.preventDefault();
                    toggleMicrophone();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isConnected, isMutedByGM, toggleMicrophone]);

    return {
        participants,
        isMicEnabled,
        isConnected,
        isConnecting,
        error,
        speakingMap,
        toggleMicrophone,
        disconnect,
        reconnect: connect,
    };
}