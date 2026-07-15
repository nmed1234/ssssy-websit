package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.PublicationRequest;
import org.ssssy.backend.model.dto.PublicationResponse;
import org.ssssy.backend.model.entity.Publication;
import org.ssssy.backend.repository.PublicationRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PublicationService {

    private final PublicationRepository publicationRepository;

    // ── Public ──────────────────────────────────────────────────────────────

    public Page<PublicationResponse> getPublications(String search, Integer year, String category, Pageable pageable) {
        if (search != null && !search.isBlank()) {
            return publicationRepository.searchActiveFiltered(search.trim(), year, category, pageable)
                    .map(this::toResponse);
        }
        if (year != null && category != null && !category.isBlank()) {
            return publicationRepository.findByIsActiveTrueAndYearAndCategoryOrderBySortOrderAsc(year, category, pageable)
                    .map(this::toResponse);
        }
        if (year != null) {
            return publicationRepository.findByIsActiveTrueAndYearOrderBySortOrderAsc(year, pageable)
                    .map(this::toResponse);
        }
        if (category != null && !category.isBlank()) {
            return publicationRepository.findByIsActiveTrueAndCategoryOrderBySortOrderAsc(category, pageable)
                    .map(this::toResponse);
        }
        return publicationRepository.findByIsActiveTrueOrderBySortOrderAsc(pageable)
                .map(this::toResponse);
    }

    public PublicationResponse getBySlug(String slug) {
        Publication pub = publicationRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Publication not found: " + slug));
        return toResponse(pub);
    }

    // ── Admin ────────────────────────────────────────────────────────────────

    public Page<PublicationResponse> getAll(Pageable pageable) {
        return publicationRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional
    public PublicationResponse create(PublicationRequest request) {
        Publication pub = Publication.builder()
                .titleEn(request.getTitleEn())
                .titleAr(request.getTitleAr())
                .slug(buildSlug(request))
                .abstractEn(request.getAbstractEn())
                .abstractAr(request.getAbstractAr())
                .authors(request.getAuthors())
                .year(request.getYear())
                .category(request.getCategory())
                .coverImageUrl(request.getCoverImageUrl())
                .pdfUrl(request.getPdfUrl())
                .fileSizeKb(request.getFileSizeKb())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .build();
        return toResponse(publicationRepository.save(pub));
    }

    @Transactional
    public PublicationResponse update(UUID id, PublicationRequest request) {
        Publication pub = publicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Publication not found: " + id));
        pub.setTitleEn(request.getTitleEn());
        pub.setTitleAr(request.getTitleAr());
        if (request.getSlug() != null && !request.getSlug().isBlank()) {
            pub.setSlug(request.getSlug());
        }
        pub.setAbstractEn(request.getAbstractEn());
        pub.setAbstractAr(request.getAbstractAr());
        pub.setAuthors(request.getAuthors());
        pub.setYear(request.getYear());
        pub.setCategory(request.getCategory());
        pub.setCoverImageUrl(request.getCoverImageUrl());
        pub.setPdfUrl(request.getPdfUrl());
        pub.setFileSizeKb(request.getFileSizeKb());
        if (request.getIsActive() != null) pub.setIsActive(request.getIsActive());
        if (request.getSortOrder() != null) pub.setSortOrder(request.getSortOrder());
        return toResponse(publicationRepository.save(pub));
    }

    @Transactional
    public void delete(UUID id) {
        if (!publicationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Publication not found: " + id);
        }
        publicationRepository.deleteById(id);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private String buildSlug(PublicationRequest request) {
        if (request.getSlug() != null && !request.getSlug().isBlank()) {
            return request.getSlug();
        }
        return request.getTitleEn()
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("\\s+", "-");
    }

    private PublicationResponse toResponse(Publication pub) {
        return PublicationResponse.builder()
                .id(pub.getId())
                .titleEn(pub.getTitleEn())
                .titleAr(pub.getTitleAr())
                .slug(pub.getSlug())
                .abstractEn(pub.getAbstractEn())
                .abstractAr(pub.getAbstractAr())
                .authors(pub.getAuthors())
                .year(pub.getYear())
                .category(pub.getCategory())
                .coverImageUrl(pub.getCoverImageUrl())
                .pdfUrl(pub.getPdfUrl())
                .fileSizeKb(pub.getFileSizeKb())
                .isActive(pub.getIsActive())
                .sortOrder(pub.getSortOrder())
                .createdAt(pub.getCreatedAt())
                .updatedAt(pub.getUpdatedAt())
                .build();
    }
}
