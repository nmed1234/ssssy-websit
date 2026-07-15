package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.ssssy.backend.model.entity.GalleryImage;

import java.util.List;
import java.util.UUID;

@Repository
public interface GalleryImageRepository extends JpaRepository<GalleryImage, UUID> {

  List<GalleryImage> findByAlbumIdOrderBySortOrderAsc(UUID albumId);

  int countByAlbumId(UUID albumId);
}
