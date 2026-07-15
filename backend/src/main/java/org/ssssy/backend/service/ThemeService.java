package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.ThemeRequest;
import org.ssssy.backend.model.dto.ThemeResponse;
import org.ssssy.backend.model.entity.Theme;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.ThemeRepository;
import org.ssssy.backend.repository.UserRepository;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ThemeService {

    private final ThemeRepository themeRepository;
    private final UserRepository userRepository;

    public List<ThemeResponse> getAll() {
        return themeRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ThemeResponse getById(UUID id) {
        return themeRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Theme not found: " + id));
    }

    public ThemeResponse getActiveTheme() {
        return themeRepository.findByIsActiveTrue()
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("No active theme found"));
    }

    @Transactional
    public ThemeResponse create(ThemeRequest request, UUID userId) {
        User creator = userId != null ? userRepository.findById(userId).orElse(null) : null;
        Theme theme = Theme.builder()
                .nameEn(request.getNameEn())
                .nameAr(request.getNameAr())
                .themeJson(request.getThemeJson() != null ? request.getThemeJson() : "{}")
                .isActive(false)
                .isSystem(Boolean.TRUE.equals(request.getIsSystem()))
                .createdBy(creator)
                .build();
        return toResponse(themeRepository.save(theme));
    }

    @Transactional
    public ThemeResponse update(UUID id, ThemeRequest request) {
        Theme theme = themeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Theme not found: " + id));
        if (request.getNameEn() != null) theme.setNameEn(request.getNameEn());
        if (request.getNameAr() != null) theme.setNameAr(request.getNameAr());
        if (request.getThemeJson() != null) theme.setThemeJson(request.getThemeJson());
        return toResponse(themeRepository.save(theme));
    }

    @Transactional
    public ThemeResponse activate(UUID id) {
        // Deactivate all others first
        themeRepository.findAllByOrderByCreatedAtDesc().forEach(t -> {
            t.setIsActive(false);
            themeRepository.save(t);
        });
        Theme theme = themeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Theme not found: " + id));
        theme.setIsActive(true);
        return toResponse(themeRepository.save(theme));
    }

    @Transactional
    public void delete(UUID id) {
        Theme theme = themeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Theme not found: " + id));
        if (Boolean.TRUE.equals(theme.getIsSystem())) {
            throw new IllegalStateException("Cannot delete a system theme");
        }
        themeRepository.delete(theme);
    }

    private ThemeResponse toResponse(Theme t) {
        return ThemeResponse.builder()
                .id(t.getId())
                .nameEn(t.getNameEn())
                .nameAr(t.getNameAr())
                .themeJson(t.getThemeJson())
                .isActive(t.getIsActive())
                .isSystem(t.getIsSystem())
                .createdByName(t.getCreatedBy() != null
                        ? t.getCreatedBy().getFirstNameEn() + " " + t.getCreatedBy().getLastNameEn() : null)
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
