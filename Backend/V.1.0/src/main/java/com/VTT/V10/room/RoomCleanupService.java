package com.VTT.V10.room;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RoomCleanupService {

    private final RoomRepository roomRepository;

    @Scheduled(fixedRate = 3600000) // هر یک ساعت
    @Transactional
    public void deactivateExpiredRooms() {
        roomRepository.deactivateExpiredRooms(LocalDateTime.now());
    }
}