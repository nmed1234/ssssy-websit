package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.ComponentPreset;

import java.util.List;
import java.util.UUID;

public interface ComponentPresetRepository extends JpaRepository<ComponentPreset, UUID> {

  List<ComponentPreset> findAllByOrderByCreatedAtDesc();

  List<ComponentPreset> findByComponentTypeOrderByCreatedAtDesc(String componentType);

  List<ComponentPreset> findByIsSystemTrueOrderByCreatedAtDesc();

  List<ComponentPreset> findByIsSystemFalseOrderByCreatedAtDesc();
}
