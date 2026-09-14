package com.VTT.V10.room;

import com.VTT.V10.room.dto.JournalResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JournalService {

    private final JournalRepository journalRepository;
    private final RoomMemberRepository memberRepository;

    @Transactional(readOnly = true)
    public List<JournalResponse> getRoomJournals(UUID roomId, String userEmail) {
        RoomMember member = memberRepository.findByRoomIdAndUserEmail(roomId, userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "شما عضو این اتاق نیستید"));

        return journalRepository.findByRoomId(roomId).stream()
                .filter(j -> member.getRole() == RoomMember.Role.ADMIN || !Boolean.TRUE.equals(j.getIsAdminOnly()))
                .map(j -> JournalResponse.builder()
                        .id(j.getId())
                        .title(j.getTitle())
                        .content(j.getContent())
                        .isAdminOnly(j.getIsAdminOnly())
                        .build())
                .collect(Collectors.toList());
    }
}