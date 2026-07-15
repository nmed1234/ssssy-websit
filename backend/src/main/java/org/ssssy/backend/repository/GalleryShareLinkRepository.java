package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.ssssy.backend.model.entity.GalleryShareLink;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GalleryShareLinkRepository extends JpaRepository<GalleryShareLink, UUID> {

  Optional<GalleryShareLink> findByToken(String token);

  List<GalleryShareLink> findByAlbumIdOrderByCreatedAtDesc(UUID albumId);
}
