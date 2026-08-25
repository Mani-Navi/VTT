package com.VTT.V10.room;

import com.VTT.V10.room.dto.CreateRoomRequest;
import com.VTT.V10.room.dto.JoinRoomRequest;
import com.VTT.V10.room.dto.RoomResponse;
import com.VTT.V10.room.dto.RoomTemplateResponse;
import com.VTT.V10.room.dto.UpdateRoomRequest;
import com.VTT.V10.user.User;
import com.VTT.V10.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final PlayerPermissionRepository permissionRepository;
    private final RoomSettingsRepository settingsRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<RoomTemplateResponse> getAvailableTemplates() {
        return templateRepository.findAll().stream()
                .map(t -> RoomTemplateResponse.builder()
                        .id(t.getId())
                        .title(t.getTitle())
                        .description(t.getDescription())
                        .maxPlayers(t.getMaxPlayers())
                        .expireDays(t.getExpireDays())
                        .baseMapUrl(t.getBaseMapUrl())
                        .musicUrl(t.getMusicUrl())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> getUserRooms(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر یافت نشد"));

        return memberRepository.findAllByUserId(user.getId())
                .stream()
                .map(member -> {
                    Room room = member.getRoom();
                    RoomResponse response = convertToResponse(room);
                    response.setRole(member.getRole() == RoomMember.Role.ADMIN ? "GM" : "Player");
                    return response;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public RoomResponse createRoom(CreateRoomRequest request, String userEmail) {
        User owner = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر یافت نشد"));

        boolean exists = roomRepository.findAll().stream()
                .anyMatch(r -> r.getOwner().getId().equals(owner.getId()) && r.getName().trim().equalsIgnoreCase(request.getName().trim()));
        if (exists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "شما قبلاً اتاقی با همین نام ایجاد کرده‌اید");
        }

        String encodedPassword = (request.getPassword() != null && !request.getPassword().trim().isEmpty())
                ? passwordEncoder.encode(request.getPassword().trim())
                : null;

        Room.RoomBuilder roomBuilder = Room.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .password(encodedPassword)
                .code(generateRandomCode())
                .owner(owner)
                .isActive(true)
                .expireDays(30)
                .lastActive(LocalDateTime.now());

        if (request.getTemplateId() != null) {
            RoomTemplate template = templateRepository.findById(request.getTemplateId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "سناریو یافت نشد"));

            roomBuilder.type(Room.RoomType.OFFICIAL)
                    .template(template)
                    .maxPlayers(template.getMaxPlayers() != null ? template.getMaxPlayers() : 10)
                    .expireDays(template.getExpireDays() != null ? template.getExpireDays() : 30)
                    .musicUrl(template.getMusicUrl());
        } else {
            roomBuilder.type(Room.RoomType.STANDARD)
                    .maxPlayers(10);
        }

        Room room = roomRepository.save(roomBuilder.build());

        RoomMember admin = RoomMember.builder()
                .room(room)
                .user(owner)
                .role(RoomMember.Role.ADMIN)
                .joinedAt(LocalDateTime.now())
                .build();
        memberRepository.save(admin);

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

    // ویرایش مشخصات اتاق توسط GM
    @Transactional
    public RoomResponse updateRoom(UUID roomId, UpdateRoomRequest request, String userEmail) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "اتاق یافت نشد"));

        if (!room.getOwner().getEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "تنها دانجن‌مستر اجازه ویرایش مشخصات اتاق را دارد");
        }

        room.setName(request.getName().trim());
        room.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);

        if (request.getPassword() != null) {
            if (request.getPassword().trim().isEmpty()) {
                room.setPassword(null); // حذف پسورد
            } else {
                room.setPassword(passwordEncoder.encode(request.getPassword().trim()));
            }
        }

        Room updated = roomRepository.save(room);
        RoomResponse response = convertToResponse(updated);
        response.setRole("GM");
        return response;
    }

    @Transactional
    public RoomResponse joinRoom(JoinRoomRequest request, String userEmail) {
        Room room = roomRepository.findByCode(request.getRoomCode().trim().toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "اتاقی با این کد یافت نشد"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر یافت نشد"));

        if (!memberRepository.existsByRoomIdAndUserId(room.getId(), user.getId())) {
            if (room.getPassword() != null && !room.getPassword().isEmpty()) {
                if (request.getPassword() == null || !passwordEncoder.matches(request.getPassword(), room.getPassword())) {
                    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "رمز عبور اتاق اشتباه است");
                }
            }

            RoomMember member = RoomMember.builder()
                    .room(room)
                    .user(user)
                    .role(RoomMember.Role.PLAYER)
                    .joinedAt(LocalDateTime.now())
                    .build();
            memberRepository.save(member);

            permissionService.createDefaultPermissions(room, member);
        }

        RoomResponse response = convertToResponse(room);
        response.setRole(room.getOwner().getId().equals(user.getId()) ? "GM" : "Player");
        return response;
    }

    // خروج بازیکن از اتاق
    @Transactional
    public void leaveRoom(UUID roomId, String userEmail) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "اتاق یافت نشد"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر یافت نشد"));

        if (room.getOwner().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "دانجن‌مستر نمی‌تواند از اتاق خود خارج شود؛ در صورت نیاز باید اتاق را حذف کنید");
        }

        memberRepository.deleteByRoomIdAndUserId(roomId, user.getId());
    }

    @Transactional
    public void deleteRoom(UUID roomId, String userEmail) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "اتاق یافت نشد"));

        if (!room.getOwner().getEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "تنها سازنده اتاق اجازه حذف آن را دارد");
        }

        permissionRepository.deleteByRoomId(roomId);
        memberRepository.deleteByRoomId(roomId);
        journalRepository.deleteByRoomId(roomId);
        if (settingsRepository.existsById(roomId)) {
            settingsRepository.deleteById(roomId);
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
                .description(room.getDescription())
                .type(room.getType().name())
                .isProtected(room.getPassword() != null && !room.getPassword().isEmpty())
                .ownerUsername(room.getOwner() != null ? room.getOwner().getUsername() : "")
                .isActive(room.getIsActive() != null ? room.getIsActive() : true)
                .playerCount(1)
                .expiresAt(expiresAt)
                .templateId(room.getTemplate() != null ? room.getTemplate().getId() : null)
                .build();
    }
}