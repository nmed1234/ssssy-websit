package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.ContentVersionHistory;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ContentVersionHistoryRepository extends JpaRepository<ContentVersionHistory, UUID> {

  List<ContentVersionHistory> findByContentTypeAndContentIdOrderByVersionNumberDesc(
      String contentType, UUID contentId);

  Optional<ContentVersionHistory> findByContentTypeAndContentIdAndVersionNumber(
      String contentType, UUID contentId, int versionNumber);

  int countByContentTypeAndContentId(String contentType, UUID contentId);
}
