package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.UrlRedirect;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for automatic 301 redirects created on slug changes.
 *
 * Requirements: 6.7
 */
public interface UrlRedirectRepository extends JpaRepository<UrlRedirect, UUID> {

    /**
     * Look up an active redirect by the incoming request path.
     * Used by the public router middleware to intercept old URLs.
     */
    Optional<UrlRedirect> findByFromPath(String fromPath);

    /**
     * Returns all redirects linked to a page — used when a page is deleted
     * so the caller can decide whether to keep or clean up the redirect chain.
     */
    List<UrlRedirect> findByPageId(UUID pageId);
}
