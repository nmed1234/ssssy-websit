package org.ssssy.backend.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.ComponentPresetRequest;
import org.ssssy.backend.model.dto.ComponentPresetResponse;
import org.ssssy.backend.model.entity.ComponentPreset;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.ComponentPresetRepository;
import org.ssssy.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ComponentPresetServiceTest {

    @Mock
    private ComponentPresetRepository componentPresetRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ComponentPresetService componentPresetService;

    private User mockUser() {
        return User.builder()
                .id(UUID.randomUUID())
                .username("editor")
                .email("editor@test.com")
                .firstNameEn("Test")
                .lastNameEn("Editor")
                .build();
    }

    private ComponentPreset mockPreset(UUID id, boolean isSystem) {
        return ComponentPreset.builder()
                .id(id)
                .nameEn("Hero Banner")
                .nameAr("بانر رئيسي")
                .componentType("hero-banner")
                .configJson("{}")
                .dataJson("{}")
                .stylingJson("{}")
                .isSystem(isSystem)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void getAll_returnsAll() {
        List<ComponentPreset> presets = List.of(mockPreset(UUID.randomUUID(), true), mockPreset(UUID.randomUUID(), false));
        when(componentPresetRepository.findAllByOrderByCreatedAtDesc()).thenReturn(presets);

        List<ComponentPresetResponse> result = componentPresetService.getAll();

        assertEquals(2, result.size());
        verify(componentPresetRepository).findAllByOrderByCreatedAtDesc();
    }

    @Test
    void getSystemPresets_returnsOnlySystem() {
        List<ComponentPreset> system = List.of(mockPreset(UUID.randomUUID(), true));
        when(componentPresetRepository.findByIsSystemTrueOrderByCreatedAtDesc()).thenReturn(system);

        List<ComponentPresetResponse> result = componentPresetService.getSystemPresets();

        assertEquals(1, result.size());
    }

    @Test
    void getById_notFound_throwsResourceNotFoundException() {
        UUID id = UUID.randomUUID();
        when(componentPresetRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> componentPresetService.getById(id));
    }

    @Test
    void create_savesAndReturnsPreset() {
        User user = mockUser();
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));

        ComponentPreset saved = mockPreset(UUID.randomUUID(), false);
        saved.setCreatedBy(user);
        when(componentPresetRepository.save(any())).thenReturn(saved);

        ComponentPresetRequest req = new ComponentPresetRequest();
        req.setNameEn("Test Hero");
        req.setComponentType("hero-banner");
        req.setIsSystem(false);

        ComponentPresetResponse result = componentPresetService.create(req, user.getId());

        assertNotNull(result);
        assertEquals("hero-banner", result.getComponentType());
        verify(componentPresetRepository).save(any());
    }

    @Test
    void delete_existingPreset_deletesSuccessfully() {
        UUID id = UUID.randomUUID();
        when(componentPresetRepository.existsById(id)).thenReturn(true);

        assertDoesNotThrow(() -> componentPresetService.delete(id));
        verify(componentPresetRepository).deleteById(id);
    }
}
