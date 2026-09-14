package com.VTT.V10.room;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "journals")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "room")
@EqualsAndHashCode(of = "id")
public class Journal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "is_admin_only")
    @Builder.Default
    private Boolean isAdminOnly = true;

    @CreationTimestamp
    private LocalDateTime createdAt;
}