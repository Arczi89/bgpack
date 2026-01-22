package com.bgpack.repository;

import com.bgpack.entity.SearchPreset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SearchPresetRepository extends JpaRepository<SearchPreset, Long> {
    @Query("SELECT sp FROM SearchPreset sp ORDER BY sp.createdAt DESC")
    List<SearchPreset> findAllOrderByCreatedAtDesc();

    @Query("SELECT sp FROM SearchPreset sp WHERE sp.presetName = :presetName")
    List<SearchPreset> findByPresetName(@Param("presetName") String presetName);
}