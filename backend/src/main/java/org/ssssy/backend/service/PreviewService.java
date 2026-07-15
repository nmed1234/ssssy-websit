package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.PreviewTokenExpiredException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.PreviewTokenResponse;
import org.ssssy.backend.model.entity.PreviewToken;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.PreviewTokenRepository;
import org.ssssy.backend.repository.UserRepository;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.UUID;

/**
 * Service for generating and resolving preview tokens.
 *
 * <p>Preview tokens allow authenticated editors to share an unsaved page layout
 * with a time-limited, unauthenticated preview URL.
 *
 * <p>Requirements: 8.4, 8.5, 8.7
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PreviewService {

    private static final int TOKEN_BYTE_LENGTH = 32;
    private static final int TOKEN_EXPIRY_HOURS = 1;

    private final PreviewTokenRepository previewTokenRepository;
    private final UserRepository userRepository;

    /**
     * Generates a preview token for the given page, stores a snapshot of the
     * layout JSON, and returns the token together with the preview URL.
     *
     * <p>Token generation: 32 random bytes via {@link SecureRandom}, hex-encoded
     * to a 64-character string. The token is stored in {@code preview_tokens}
     * with {@code expires_at = NOW() + 1 hour}.
     *
     * @param pageId     the UUID of the page being previewed
     * @param layoutJson the current (possibly unsaved) layout JSON snapshot
     * @param createdBy  the UUID of the authenticated user requesting the preview
     * @return a {@link PreviewTokenResponse} containing {@code token}, {@code previewUrl},
     *         and {@code expiresAt}
     * @throws ResourceNotFoundException if the user is not found
     *
     * Requirements: 8.4, 8.5
     */
    @Transactional
    public PreviewTokenResponse generateToken(UUID pageId, String layoutJson, UUID createdBy) {
        User user = userRepository.findById(createdBy)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + createdBy));

        String token = generateHexToken();
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(TOKEN_EXPIRY_HOURS);

        PreviewToken previewToken = PreviewToken.builder()
                .pageId(pageId)
                .token(token)
                .layoutJson(layoutJson)
                .createdBy(user)
                .expiresAt(expiresAt)
                .build();

        previewTokenRepository.save(previewToken);

        String previewUrl = "/api/preview/pages/" + pageId + "?token=" + token;

        log.debug("Generated preview token for page {} expiring at {}", pageId, expiresAt);

        return PreviewTokenResponse.builder()
                .token(token)
                .previewUrl(previewUrl)
                .expiresAt(expiresAt)
                .build();
    }

    /**
     * Resolves a preview token for the given page and returns the layout JSON
     * snapshot associated with it.
     *
     * <p>Looks up a {@code preview_tokens} row where {@code token = ?} AND
     * {@code expires_at > NOW()}. If no such row exists (token not found or expired),
     * throws {@link PreviewTokenExpiredException}, which maps to HTTP 403.
     *
     * @param pageId the UUID of the page being accessed
     * @param token  the 64-character hex preview token from the request
     * @return the {@code layoutJson} string stored with the token
     * @throws PreviewTokenExpiredException if the token is not found or has expired
     *
     * Requirements: 8.4, 8.7
     */
    @Transactional(readOnly = true)
    public String resolveToken(UUID pageId, String token) {
        PreviewToken previewToken = previewTokenRepository
                .findByPageIdAndTokenAndExpiresAtAfter(pageId, token, LocalDateTime.now())
                .orElseThrow(PreviewTokenExpiredException::new);

        log.debug("Resolved preview token for page {}", pageId);

        return previewToken.getLayoutJson();
    }

    /**
     * Generates a cryptographically secure 64-character hex token
     * from 32 random bytes using {@link SecureRandom}.
     *
     * @return a 64-character lowercase hex string
     */
    private String generateHexToken() {
        SecureRandom secureRandom = new SecureRandom();
        byte[] bytes = new byte[TOKEN_BYTE_LENGTH];
        secureRandom.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }
}
