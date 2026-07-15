package org.ssssy.backend.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.ThemeSettingRequest;
import org.ssssy.backend.model.entity.ThemeSetting;
import org.ssssy.backend.repository.ThemeSettingRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ThemeSettingServiceTest {

    @Mock
    private ThemeSettingRepository themeSettingRepository;

    @InjectMocks
    private ThemeSettingService themeSettingService;

    private ThemeSetting mockSetting(String key, String value, String group) {
        return ThemeSetting.builder()
                .id(UUID.randomUUID())
                .settingKey(key)
                .settingValue(value)
                .settingType("color")
                .groupName(group)
                .label("Test Setting")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void getByKey_existingKey_returnsResponse() {
        ThemeSetting setting = mockSetting("shad_primary", "15 30% 35%", "colors");
        when(themeSettingRepository.findBySettingKey("shad_primary")).thenReturn(Optional.of(setting));

        var result = themeSettingService.getByKey("shad_primary");

        assertNotNull(result);
        assertEquals("shad_primary", result.getSettingKey());
        assertEquals("15 30% 35%", result.getSettingValue());
    }

    @Test
    void getByKey_missingKey_throwsResourceNotFoundException() {
        when(themeSettingRepository.findBySettingKey("nonexistent")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> themeSettingService.getByKey("nonexistent"));
    }

    @Test
    void getByGroup_returnsMatchingSettings() {
        List<ThemeSetting> settings = List.of(
                mockSetting("shad_primary", "15 30% 35%", "colors"),
                mockSetting("shad_secondary", "120 30% 35%", "colors")
        );
        when(themeSettingRepository.findByGroupNameOrderBySettingKeyAsc("colors")).thenReturn(settings);

        var result = themeSettingService.getByGroup("colors");

        assertEquals(2, result.size());
    }

    @Test
    void create_savesAndReturnsSetting() {
        ThemeSetting saved = mockSetting("new_key", "new_value", "general");
        when(themeSettingRepository.save(any())).thenReturn(saved);

        ThemeSettingRequest req = new ThemeSettingRequest();
        req.setSettingKey("new_key");
        req.setSettingValue("new_value");
        req.setGroupName("general");
        req.setSettingType("text");

        var result = themeSettingService.create(req);

        assertNotNull(result);
        assertEquals("new_key", result.getSettingKey());
        verify(themeSettingRepository).save(any());
    }

    @Test
    void delete_existingId_deletesSuccessfully() {
        UUID id = UUID.randomUUID();
        when(themeSettingRepository.existsById(id)).thenReturn(true);

        assertDoesNotThrow(() -> themeSettingService.delete(id));
        verify(themeSettingRepository).deleteById(id);
    }
}
