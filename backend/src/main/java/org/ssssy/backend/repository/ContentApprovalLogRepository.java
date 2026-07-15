package org.ssssy.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.ContentApprovalLog;

import java.util.List;
import java.util.UUID;

public interface ContentApprovalLogRepository extends JpaRepository<ContentApprovalLog, UUID> {

  List<ContentApprovalLog> findByContentTypeAndContentIdOrderByCreatedAtDesc(String contentType, UUID contentId);

  Page<ContentApprovalLog> findByContentTypeOrderByCreatedAtDesc(String contentType, Pageable pageable);

  Page<ContentApprovalLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
