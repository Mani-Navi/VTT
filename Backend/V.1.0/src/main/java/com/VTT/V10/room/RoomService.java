package com.VTT.V10.room;

import com.VTT.V10.room.dto.*;
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
import java.util.Optional;
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
                .filter(m -> !Boolean.TRUE.equals(m.getIsBanned()))
                .map(member -> convertToResponse(member.getRoom(), user))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RoomResponse getRoomById(UUID roomId, String userEmail) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "اتاق یافت نشد"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر یافت نشد"));

        RoomMember member = memberRepository.findByRoomIdAndUserId(roomId, user.getId())
                .orElse(null);

        if (member == null && !room.getOwner().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "شما عضو این اتاق نیستید");
        }

        if (member != null && Boolean.TRUE.equals(member.getIsBanned())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "شما از این اتاق مسدود (Ban) شده‌اید");
        }

        return convertToResponse(room, user);
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
                .isMuted(false)
                .isBanned(false)
                .joinedAt(LocalDateTime.now())
                .build();
        RoomMember savedAdmin = memberRepository.save(admin);

        PlayerPermission adminPermission = PlayerPermission.builder()
                .room(room)
                .member(savedAdmin)
                .canAssets(true)
                .canText(true)
                .canFog(true)
                .canDrawing(true)
                .canScene(true)
                .canRuler(true)
                .build();
        permissionRepository.save(adminPermission);

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

        return convertToResponse(room, owner);
    }

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
                room.setPassword(null);
            } else {
                room.setPassword(passwordEncoder.encode(request.getPassword().trim()));
            }
        }

        Room updated = roomRepository.save(room);
        return convertToResponse(updated, room.getOwner());
    }

    @Transactional
    public RoomResponse joinRoom(JoinRoomRequest request, String userEmail) {
        Room room = roomRepository.findByCode(request.getRoomCode().trim().toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "اتاقی با این کد یافت نشد"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر یافت نشد"));

        Optional<RoomMember> existingMember = memberRepository.findByRoomIdAndUserId(room.getId(), user.getId());
        if (existingMember.isPresent() && Boolean.TRUE.equals(existingMember.get().getIsBanned())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "شما توسط گیم‌مستر از این اتاق مسدود شده‌اید");
        }

        if (existingMember.isEmpty()) {
            if (room.getPassword() != null && !room.getPassword().isEmpty()) {
                if (request.getPassword() == null || !passwordEncoder.matches(request.getPassword(), room.getPassword())) {
                    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "رمز عبور اتاق اشتباه است");
                }
            }

            RoomMember.Role assignedRole = room.getOwner().getId().equals(user.getId())
                    ? RoomMember.Role.ADMIN
                    : RoomMember.Role.PLAYER;

            RoomMember member = RoomMember.builder()
                    .room(room)
                    .user(user)
                    .role(assignedRole)
                    .isMuted(false)
                    .isBanned(false)
                    .joinedAt(LocalDateTime.now())
                    .build();
            RoomMember savedMember = memberRepository.save(member);

            if (assignedRole == RoomMember.Role.ADMIN) {
                PlayerPermission adminPerm = PlayerPermission.builder()
                        .room(room)
                        .member(savedMember)
                        .canAssets(true)
                        .canText(true)
                        .canFog(true)
                        .canDrawing(true)
                        .canScene(true)
                        .canRuler(true)
                        .build();
                permissionRepository.save(adminPerm);
            } else {
                permissionService.createDefaultPermissions(room, savedMember);
            }
        }

        return convertToResponse(room, user);
    }

    @Transactional(readOnly = true)
    public List<RoomMemberResponse> getRoomMembers(UUID roomId, String requesterEmail) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "اتاق یافت نشد"));

        return memberRepository.findAllByRoomId(roomId).stream()
                .map(m -> {
                    PlayerPermission perm = permissionRepository.findByMemberId(m.getId()).orElse(null);
                    PermissionResponse permResp = perm != null ? permissionService.getMemberPermissions(m.getId()) : null;

                    boolean isOwner = room.getOwner() != null && room.getOwner().getId().equals(m.getUser().getId());

                    return RoomMemberResponse.builder()
                            .id(m.getId())
                            .userId(m.getUser().getId())
                            .username(m.getUser().getUsername())
                            .email(m.getUser().getEmail())
                            .role(m.getRole() == RoomMember.Role.ADMIN ? "GM" : "Player")
                            .isOwner(isOwner)
                            .isMuted(Boolean.TRUE.equals(m.getIsMuted()))
                            .isBanned(Boolean.TRUE.equals(m.getIsBanned()))
                            .permissions(permResp)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void kickMember(UUID roomId, UUID memberId, String requesterEmail) {
        RoomMember requester = memberRepository.findByRoomIdAndUserEmail(roomId, requesterEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "دسترسی غیرمجاز"));

        if (requester.getRole() != RoomMember.Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "تنها GM اجازه اخراج بازیکن را دارد");
        }

        RoomMember target = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "عضو یافت نشد"));

        if (target.getUser().getId().equals(target.getRoom().getOwner().getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "امکان اخراج سازنده اصلی اتاق وجود ندارد");
        }

        permissionRepository.deleteByMemberId(memberId);
        memberRepository.delete(target);
    }

    @Transactional
    public void banMember(UUID roomId, UUID memberId, String requesterEmail) {
        RoomMember requester = memberRepository.findByRoomIdAndUserEmail(roomId, requesterEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "دسترسی غیرمجاز"));

        if (requester.getRole() != RoomMember.Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "تنها GM اجازه مسدودسازی بازیکن را دارد");
        }

        RoomMember target = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "عضو یافت نشد"));

        if (target.getUser().getId().equals(target.getRoom().getOwner().getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "امکان مسدودسازی سازنده اصلی اتاق وجود ندارد");
        }

        target.setIsBanned(true);
        memberRepository.save(target);
    }

    @Transactional
    public RoomMemberResponse toggleMuteMember(UUID roomId, UUID memberId, String requesterEmail) {
        RoomMember requester = memberRepository.findByRoomIdAndUserEmail(roomId, requesterEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "دسترسی غیرمجاز"));

        if (requester.getRole() != RoomMember.Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "تنها GM اجازه تغییر وضعیت صدا را دارد");
        }

        RoomMember target = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "عضو یافت نشد"));

        target.setIsMuted(!Boolean.TRUE.equals(target.getIsMuted()));
        memberRepository.save(target);

        return RoomMemberResponse.builder()
                .id(target.getId())
                .userId(target.getUser().getId())
                .username(target.getUser().getUsername())
                .role(target.getRole() == RoomMember.Role.ADMIN ? "GM" : "Player")
                .isMuted(target.getIsMuted())
                .isBanned(target.getIsBanned())
                .build();
    }

    @Transactional
    public RoomMemberResponse changeMemberRole(UUID roomId, UUID memberId, String newRole, String requesterEmail) {
        RoomMember requester = memberRepository.findByRoomIdAndUserEmail(roomId, requesterEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "دسترسی غیرمجاز"));

        if (requester.getRole() != RoomMember.Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "تنها GM اجازه تغییر نقش اعضا را دارد");
        }

        RoomMember target = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "عضو یافت نشد"));

        RoomMember.Role role = "GM".equalsIgnoreCase(newRole) ? RoomMember.Role.ADMIN : RoomMember.Role.PLAYER;
        target.setRole(role);
        memberRepository.save(target);

        return RoomMemberResponse.builder()
                .id(target.getId())
                .userId(target.getUser().getId())
                .username(target.getUser().getUsername())
                .role(role == RoomMember.Role.ADMIN ? "GM" : "Player")
                .build();
    }

    @Transactional
    public void leaveRoom(UUID roomId, String userEmail) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "اتاق یافت نشد"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر یافت نشد"));

        if (room.getOwner().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "دانجن‌مستر نمی‌تواند از اتاق خود خارج شود؛ در صورت نیاز باید اتاق را حذف کنید");
        }

        Optional<RoomMember> member = memberRepository.findByRoomIdAndUserId(roomId, user.getId());
        member.ifPresent(m -> {
            permissionRepository.deleteByMemberId(m.getId());
            memberRepository.delete(m);
        });
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

    private RoomResponse convertToResponse(Room room, User currentUser) {
        LocalDateTime createdAt = room.getCreatedAt() != null ? room.getCreatedAt() : LocalDateTime.now();
        int expireDays = room.getExpireDays() != null ? room.getExpireDays() : 30;
        LocalDateTime expiresAt = createdAt.plusDays(expireDays);

        boolean isOwner = room.getOwner() != null && (
                room.getOwner().getId().equals(currentUser.getId()) ||
                        room.getOwner().getEmail().equalsIgnoreCase(currentUser.getEmail())
        );

        RoomMember.Role role = RoomMember.Role.PLAYER;
        Optional<RoomMember> memberOpt = memberRepository.findByRoomIdAndUserId(room.getId(), currentUser.getId());

        if (isOwner) {
            role = RoomMember.Role.ADMIN;
        } else if (memberOpt.isPresent()) {
            role = memberOpt.get().getRole();
        }

        boolean isGM = isOwner || role == RoomMember.Role.ADMIN;

        RoomResponse.UserPermissionDto permissionsDto;
        if (isGM) {
            permissionsDto = RoomResponse.UserPermissionDto.builder()
                    .canAssets(true)
                    .canText(true)
                    .canFog(true)
                    .canDrawing(true)
                    .canScene(true)
                    .canRuler(true)
                    .build();
        } else {
            PlayerPermission permissions = memberOpt.flatMap(m -> permissionRepository.findByMemberId(m.getId()))
                    .orElse(null);

            if (permissions != null) {
                permissionsDto = RoomResponse.UserPermissionDto.builder()
                        .canAssets(Boolean.TRUE.equals(permissions.getCanAssets()))
                        .canText(Boolean.TRUE.equals(permissions.getCanText()))
                        .canFog(Boolean.TRUE.equals(permissions.getCanFog()))
                        .canDrawing(Boolean.TRUE.equals(permissions.getCanDrawing()))
                        .canScene(Boolean.TRUE.equals(permissions.getCanScene()))
                        .canRuler(Boolean.TRUE.equals(permissions.getCanRuler()))
                        .build();
            } else {
                permissionsDto = RoomResponse.UserPermissionDto.builder()
                        .canAssets(false)
                        .canText(false)
                        .canFog(false)
                        .canDrawing(false)
                        .canScene(false)
                        .canRuler(true)
                        .build();
            }
        }

        int count = memberRepository.countByRoomId(room.getId());

        return RoomResponse.builder()
                .id(room.getId())
                .code(room.getCode())
                .name(room.getName())
                .description(room.getDescription())
                .type(room.getType() != null ? room.getType().name() : Room.RoomType.STANDARD.name())
                .isProtected(room.getPassword() != null && !room.getPassword().isEmpty())
                .ownerUsername(room.getOwner() != null ? room.getOwner().getUsername() : "")
                .role(isGM ? "GM" : "Player")
                .isOwner(isOwner)
                .permissions(permissionsDto)
                .isActive(room.getIsActive() != null ? room.getIsActive() : true)
                .playerCount(count > 0 ? count : 1)
                .expiresAt(expiresAt)
                .templateId(room.getTemplate() != null ? room.getTemplate().getId() : null)
                .build();
    }
}