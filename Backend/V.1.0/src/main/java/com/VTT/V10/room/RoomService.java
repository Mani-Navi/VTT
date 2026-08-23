package com.VTT.V10.room;

import com.VTT.V10.room.dto.CreateRoomRequest;
import com.VTT.V10.room.dto.RoomResponse;
import com.VTT.V10.user.User;
import com.VTT.V10.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoomService {
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final RoomMemberRepository memberRepository;
    private final RoomTemplateRepository templateRepository;
    private final JournalRepository journalRepository;
    private final PlayerPermissionService permissionService;

    // ۱. ساخت اتاق جدید
    @Transactional
    public RoomResponse createRoom(CreateRoomRequest request, String userEmail) {
        User owner = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("کاربر یافت نشد"));

        Room.RoomBuilder roomBuilder = Room.builder()
                .name(request.getName())
                .code(generateRandomCode())
                .owner(owner)
                .isActive(true)
                .lastActive(LocalDateTime.now());

        // منطق اتاق رسمی (OFFICIAL) یا استاندارد (STANDARD)
        if (request.getTemplateId() != null) {
            RoomTemplate template = templateRepository.findById(request.getTemplateId())
                    .orElseThrow(() -> new RuntimeException("سناریو یافت نشد"));

            roomBuilder.type(Room.RoomType.OFFICIAL)
                    .template(template)
                    .maxPlayers(template.getMaxPlayers())
                    .expireDays(template.getExpireDays())
                    .musicUrl(template.getMusicUrl());
        } else {
            roomBuilder.type(Room.RoomType.STANDARD)
                    .expireDays(7) // انقضای پیش‌فرض ۷ روز
                    .maxPlayers(10);
        }

        Room room = roomRepository.save(roomBuilder.build());

        // سازنده اتاق به عنوان ADMIN اضافه می‌شود
        RoomMember admin = RoomMember.builder()
                .room(room).user(owner).role(RoomMember.Role.ADMIN).build();
        memberRepository.save(admin);

        // کپی نوت‌های سناریو برای اتاق رسمی
        if (room.getType() == Room.RoomType.OFFICIAL && room.getTemplate().getDefaultJournals() != null) {
            for (TemplateJournal tj : room.getTemplate().getDefaultJournals()) {
                Journal journal = Journal.builder()
                        .room(room).title(tj.getTitle()).content(tj.getContent())
                        .isAdminOnly(tj.getIsAdminOnly()).build();
                journalRepository.save(journal);
            }
        }

        return convertToResponse(room);
    }

    // ۲. عضویت در اتاق (متدی که در کنترلر شما قرمز بود)
    @Transactional
    public RoomResponse joinRoom(String roomCode, String userEmail) {
        Room room = roomRepository.findByCode(roomCode.toUpperCase())
                .orElseThrow(() -> new RuntimeException("اتاقی با این کد یافت نشد"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("کاربر یافت نشد"));

        // اگر از قبل عضو است، فقط اطلاعات اتاق را برگردان
        if (memberRepository.existsByRoomIdAndUserId(room.getId(), user.getId())) {
            return convertToResponse(room);
        }

        // ایجاد عضویت جدید با نقش PLAYER
        RoomMember member = RoomMember.builder()
                .room(room).user(user).role(RoomMember.Role.PLAYER).build();
        memberRepository.save(member);

        // ایجاد دسترسی‌های پیش‌فرض برای بازیکن
        permissionService.createDefaultPermissions(room, member);

        return convertToResponse(room);
    }

    // ۳. آپدیت زمان آخرین فعالیت (Keep-alive)
    @Transactional
    public void updateLastActive(UUID roomId) {
        roomRepository.findById(roomId).ifPresent(room -> {
            room.setLastActive(LocalDateTime.now());
            roomRepository.save(room);
        });
    }

    private String generateRandomCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private RoomResponse convertToResponse(Room room) {
        return RoomResponse.builder()
                .id(room.getId())
                .code(room.getCode())
                .name(room.getName())
                .type(room.getType().name())
                .ownerUsername(room.getOwner().getUsername())
                .build();
    }
}