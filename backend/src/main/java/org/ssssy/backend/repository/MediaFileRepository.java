package org.ssssy.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.model.entity.MediaFile;

import java.util.UUID;

public interface MediaFileRepository extends JpaRepository<MediaFile, UUID> {

  Page<MediaFile> findByFolderId(UUID folderId, Pageable pageable);

  Page<MediaFile> findByUserId(UUID userId, Pageable pageable);

  long countByFolderId(UUID folderId);

  @Query("SELECT COALESCE(SUM(m.sizeBytes), 0) FROM MediaFile m")
  Long sumSizeBytes();

  @Modifying
  @Transactional
  @Query("UPDATE MediaFile f SET f.folder = null WHERE f.folder.id = :folderId")
  void detachAllFromFolder(@Param("folderId") UUID folderId);

  @Query(value = "SELECT * FROM media_files WHERE fts_index @@ plainto_tsquery('english', :query)",
         countQuery = "SELECT count(*) FROM media_files WHERE fts_index @@ plainto_tsquery('english', :query)",
         nativeQuery = true)
  Page<MediaFile> searchByFts(@Param("query") String query, Pageable pageable);

  @Query(value = "SELECT * FROM media_files WHERE fts_index @@ plainto_tsquery('english', :query) AND folder_id = :folderId",
         countQuery = "SELECT count(*) FROM media_files WHERE fts_index @@ plainto_tsquery('english', :query) AND folder_id = :folderId",
         nativeQuery = true)
  Page<MediaFile> searchByFtsAndFolder(@Param("query") String query, @Param("folderId") UUID folderId, Pageable pageable);
}
