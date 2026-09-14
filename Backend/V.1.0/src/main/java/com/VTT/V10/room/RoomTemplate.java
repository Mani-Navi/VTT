package com.VTT.V10.room;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "room_templates")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class RoomTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String title;
    private String description;
    private Integer maxPlayers;
    private Integer expireDays;
    private String baseMapUrl;
    private String musicUrl;

    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TemplateJournal> defaultJournals;
}