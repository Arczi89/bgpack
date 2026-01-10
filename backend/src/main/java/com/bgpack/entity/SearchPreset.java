package com.bgpack.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.ZonedDateTime;
import java.util.Map;

@Entity
@Table(name = "search_presets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchPreset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "preset_name", length = 100, nullable = false)
    private String presetName;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "filter_criteria", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> filterCriteria;

    @Column(name = "created_at")
    private ZonedDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = ZonedDateTime.now();
    }
}