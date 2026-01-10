package com.bgpack.repository;

import com.bgpack.entity.SearchPreset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SearchPresetRepository extends JpaRepository<SearchPreset, Long> {

    @Query("SELECT sp FROM SearchPreset sp WHERE sp.user.id = :userId ORDER BY sp.createdAt DESC")
    List<SearchPreset> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT sp FROM SearchPreset sp WHERE sp.user.id = :userId AND sp.presetName = :presetName")
    List<SearchPreset> findByUserIdAndPresetName(@Param("userId") Long userId,
                                                 @Param("presetName") String presetName);
}