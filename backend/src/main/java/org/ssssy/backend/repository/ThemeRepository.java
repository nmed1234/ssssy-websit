package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.ssssy.backend.model.entity.Theme;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ThemeRepository extends JpaRepository<Theme, UUID> {
    List<Theme> findAllByOrderByCreatedAtDesc();
    Optional<Theme> findByIsActiveTrue();
    List<Theme> findByIsSystemTrue();
}
