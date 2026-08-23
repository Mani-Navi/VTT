package com.VTT.V10.room;

import com.VTT.V10.room.dto.CreateRoomRequest;
import com.VTT.V10.room.dto.RoomResponse;
import com.VTT.V10.user.User;
import com.VTT.V10.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final RoomMemberRepository memberRepository;
    private final RoomTemplateRepository templateRepository;
    private final JournalRepository journalRepository;
    private final PlayerPermissionService permissionService;

    // دریافت تمام اتاق‌های کاربر
    @Transactional(readOnly = true)
    public List<RoomResponse> getUserRooms(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر یافت نشد"));

        return memberRepository.findAllByUserId(user.getId())
                .stream()
                .map(member -> {
                    Room room = member.getRoom();
                    RoomResponse response = convertToResponse(room);
                    response.setRole(member.getRole().name().equals("ADMIN") ? "GM" : "Player");
                    return response;
                })
                .collect(Collectors.toList());
    }

    // ۱. ساخت اتاق جدید
    @Transactional
    public RoomResponse createRoom(CreateRoomRequest request, String userEmail) {
        User owner = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر یافت نشد"));

        int expireDays = request.getExpireDays() != null ? request.getExpireDays() : 30;

        Room.RoomBuilder roomBuilder = Room.builder()
                .name(request.getName())
                .code(generateRandomCode())
                .owner(owner)
                .isActive(true)
                .expireDays(expireDays)
                .lastActive(LocalDateTime.now());

        if (request.getTemplateId() != null) {
            RoomTemplate template = templateRepository.findById(request.getTemplateId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "سناریو یافت نشد"));

            roomBuilder.type(Room.RoomType.OFFICIAL)
                    .template(template)
                    .maxPlayers(template.getMaxPlayers())
                    .expireDays(template.getExpireDays())
                    .musicUrl(template.getMusicUrl());
        } else {
            roomBuilder.type(Room.RoomType.STANDARD)
                    .maxPlayers(10);
        }

        Room room = roomRepository.save(roomBuilder.build());

        // ثبت سازنده به عنوان ADMIN به همراه مقدار joinedAt
        RoomMember admin = RoomMember.builder()
                .room(room)
                .user(owner)
                .role(RoomMember.Role.ADMIN)
                .joinedAt(LocalDateTime.now())
                .build();
        memberRepository.save(admin);

        // کپی ژورنال‌ها در صورت وجود قالب
        if (room.getType() == Room.RoomType.OFFICIAL && room.getTemplate() != null && room.getTemplate().getDefaultJournals() != null) {
            for (TemplateJournal tj : room.getTemplate().getDefaultJournals()) {
                Journal journal = Journal.builder()
                        .room(room)
                        .title(tj.getTitle())
                        .content(tj.getContent())
                        .isAdminOnly(tj.getIsAdminOnly())
                        .build();
                journalRepository.save(journal);
            }
        }

        RoomResponse response = convertToResponse(room);
        response.setRole("GM");
        return response;
    }

    // ۲. عضویت در اتاق با کد
    @Transactional
    public RoomResponse joinRoom(String roomCode, String userEmail) {
        Room room = roomRepository.findByCode(roomCode.trim().toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "اتاقی با این کد یافت نشد"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر یافت نشد"));

        if (memberRepository.existsByRoomIdAndUserId(room.getId(), user.getId())) {
            return convertToResponse(room);
        }

        RoomMember member = RoomMember.builder()
                .room(room)
                .user(user)
                .role(RoomMember.Role.PLAYER)
                .joinedAt(LocalDateTime.now())
                .build();
        memberRepository.save(member);

        permissionService.createDefaultPermissions(room, member);

        RoomResponse response = convertToResponse(room);
        response.setRole("Player");
        return response;
    }

    // ۳. حذف اتاق توسط سازنده (GM)
    @Transactional
    public void deleteRoom(UUID roomId, String userEmail) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "اتاق یافت نشد"));

        if (!room.getOwner().getEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "شما اجازه حذف این اتاق را ندارید");
        }

        roomRepository.delete(room);
    }

    @Transactional
    public void updateLastActive(UUID roomId) {
        roomRepository.findById(roomId).ifPresent(room -> {
            room.setLastActive(LocalDateTime.now());
            roomRepository.save(room);
        });
    }

    private String generateRandomCode() {
        return UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }

    private RoomResponse convertToResponse(Room room) {
        LocalDateTime createdAt = room.getCreatedAt() != null ? room.getCreatedAt() : LocalDateTime.now();
        int expireDays = room.getExpireDays() != null ? room.getExpireDays() : 30;
        LocalDateTime expiresAt = createdAt.plusDays(expireDays);

        return RoomResponse.builder()
                .id(room.getId())
                .code(room.getCode())
                .name(room.getName())
                .type(room.getType().name())
                .ownerUsername(room.getOwner() != null ? room.getOwner().getUsername() : "")
                .isActive(room.getIsActive() != null ? room.getIsActive() : true)
                .playerCount(1)
                .expiresAt(expiresAt)
                .build();
    }
}