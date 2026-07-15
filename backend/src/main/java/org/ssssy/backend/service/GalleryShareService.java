package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.GalleryShareLinkRequest;
import org.ssssy.backend.model.dto.GalleryShareLinkResponse;
import org.ssssy.backend.model.entity.GalleryAlbum;
import org.ssssy.backend.model.entity.GalleryShareLink;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.GalleryAlbumRepository;
import org.ssssy.backend.repository.GalleryShareLinkRepository;
import org.ssssy.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GalleryShareService {

  private final GalleryShareLinkRepository shareLinkRepository;
  private final GalleryAlbumRepository galleryAlbumRepository;
  private final UserRepository userRepository;

  @Value("${app.base-url:http://localhost:3000}")
  private String baseUrl;

  @Transactional
  public GalleryShareLinkResponse createShareLink(GalleryShareLinkRequest request, UUID userId) {
    GalleryAlbum album = galleryAlbumRepository.findById(request.getAlbumId())
        .orElseThrow(() -> new ResourceNotFoundException("Album not found: " + request.getAlbumId()));

    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    String token = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");

    GalleryShareLink link = GalleryShareLink.builder()
        .album(album)
        .token(token)
        .expiresAt(request.getExpiresAt())
        .maxViews(request.getMaxViews())
        .currentViews(0)
        .isActive(true)
        .createdBy(user)
        .build();

    link = shareLinkRepository.save(link);
    return toResponse(link);
  }

  public List<GalleryShareLinkResponse> getShareLinks(UUID albumId) {
    return shareLinkRepository.findByAlbumIdOrderByCreatedAtDesc(albumId)
        .stream().map(this::toResponse).collect(Collectors.toList());
  }

  @Transactional
  public void deleteShareLink(UUID id) {
    if (!shareLinkRepository.existsById(id)) {
      throw new ResourceNotFoundException("Share link not found: " + id);
    }
    shareLinkRepository.deleteById(id);
  }

  public GalleryShareLink validateShareLink(String token) {
    GalleryShareLink link = shareLinkRepository.findByToken(token)
        .orElseThrow(() -> new ResourceNotFoundException("Share link not found or invalid"));

    if (!link.getIsActive()) {
      throw new BadRequestException("Share link is no longer active");
    }

    if (link.getExpiresAt() != null && link.getExpiresAt().isBefore(LocalDateTime.now())) {
      link.setIsActive(false);
      shareLinkRepository.save(link);
      throw new BadRequestException("Share link has expired");
    }

    if (link.getMaxViews() != null && link.getCurrentViews() >= link.getMaxViews()) {
      throw new BadRequestException("Share link view limit reached");
    }

    return link;
  }

  @Transactional
  public void recordShareLinkView(GalleryShareLink link) {
    link.setCurrentViews(link.getCurrentViews() + 1);
    shareLinkRepository.save(link);
  }

  private GalleryShareLinkResponse toResponse(GalleryShareLink link) {
    return GalleryShareLinkResponse.builder()
        .id(link.getId())
        .albumId(link.getAlbum().getId())
        .albumTitle(link.getAlbum().getTitleEn())
        .token(link.getToken())
        .shareUrl(baseUrl + "/gallery/share/" + link.getToken())
        .expiresAt(link.getExpiresAt())
        .maxViews(link.getMaxViews())
        .currentViews(link.getCurrentViews())
        .isActive(link.getIsActive())
        .createdByName(link.getCreatedBy().getFirstNameEn() + " " + link.getCreatedBy().getLastNameEn())
        .createdAt(link.getCreatedAt())
        .build();
  }
}
