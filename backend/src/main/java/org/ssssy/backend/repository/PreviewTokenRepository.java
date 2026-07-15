package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.PreviewToken;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for short-lived preview tokens.
 *
 * Requirements: 8.4, 8.5
 */
public interface PreviewTokenRepository extends JpaRepository<PreviewToken, UUID> {

    /**
     * Resolves a token for a given page only when it has not yet expired.
     * Used by PreviewService.resolveToken() before returning the layout snapshot.
     *
     * @param token     the 64-char hex token string
     * @param expiresAt must be after the current instant (pass LocalDateTime.now())
     */
    Optional<PreviewToken> findByTokenAndExpiresAtAfter(String token, LocalDateTime expiresAt);

    /**
     * Finds any valid (non-expired) token for a page/token combination.
     * Convenience overload when the caller already holds both identifiers.
     */
    Optional<PreviewToken> findByPageIdAndTokenAndExpiresAtAfter(
            UUID pageId, String token, LocalDateTime expiresAt);
}
