package com.bgpack.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "collections", "searchPresets"})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", length = 50, nullable = false, unique = true)
    private String username;

    @Column(name = "created_at")
    private ZonedDateTime createdAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<UserCollection> collections;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<SearchPreset> searchPresets;

    @Column(name = "last_sync")
    private ZonedDateTime lastSync;

    public User(String username) {
        this.username = username;
    }

    public boolean isCacheStale() {
        if (lastSync == null) return true;
        return lastSync.isBefore(ZonedDateTime.now().minusDays(7));
    }

    public void updateSyncTimestamp() {
        this.lastSync = ZonedDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        createdAt = ZonedDateTime.now();
    }
}