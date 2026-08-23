package com.VTT.V10.room;

import com.VTT.V10.room.dto.JournalResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JournalService {
    private final JournalRepository journalRepository;
    private final RoomMemberRepository memberRepository;

    public List<JournalResponse> getRoomJournals(UUID roomId, String userEmail) {
        // چک کردن اینکه آیا کاربر عضو اتاق است
        RoomMember member = memberRepository.findByRoomIdAndUserEmail(roomId, userEmail)
                .orElseThrow(() -> new RuntimeException("شما عضو این اتاق نیستید"));

        // دریافت تمام نوت‌ها و فیلتر بر اساس نقش (ADMIN همه چیز، PLAYER فقط عمومی)
        return journalRepository.findByRoomId(roomId).stream()
                .filter(j -> member.getRole() == RoomMember.Role.ADMIN || !j.getIsAdminOnly())
                .map(j -> JournalResponse.builder()
                        .id(j.getId())
                        .title(j.getTitle())
                        .content(j.getContent())
                        .isAdminOnly(j.getIsAdminOnly())
                        .build())
                .collect(Collectors.toList());
    }
}