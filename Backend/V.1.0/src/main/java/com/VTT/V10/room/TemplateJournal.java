package com.VTT.V10.room;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "template_journals")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = "template")
public class TemplateJournal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    private RoomTemplate template;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Builder.Default
    private Boolean isAdminOnly = true;
}