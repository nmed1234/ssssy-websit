package org.ssssy.backend.repository;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.ssssy.backend.model.entity.GalleryAlbum;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GalleryAlbumRepository extends JpaRepository<GalleryAlbum, UUID> {

  Optional<GalleryAlbum> findBySlug(String slug);

  List<GalleryAlbum> findByIsPublishedTrue(Sort sort);

  boolean existsBySlug(String slug);
}
