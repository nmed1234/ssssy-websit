package org.ssssy.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.entity.ContentVersionHistory;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.ContentItemRepository;
import org.ssssy.backend.repository.ContentVersionHistoryRepository;
import org.ssssy.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContentVersionHistoryServiceTest {

    @Mock
    private ContentVersionHistoryRepository contentVersionHistoryRepository;

    @Mock
    private ContentItemRepository contentItemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private ContentVersionHistoryService contentVersionHistoryService;

    private ContentVersionHistory mockVersion(String contentType, UUID contentId, int versionNumber) {
        return ContentVersionHistory.builder()
                .id(UUID.randomUUID())
                .contentType(contentType)
                .contentId(contentId)
                .versionNumber(versionNumber)
                .dataSnapshot("{\"title\":\"Test\"}")
                .changeDescription("Test change")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void getHistory_returnsVersionsForContent() {
        UUID contentId = UUID.randomUUID();
        List<ContentVersionHistory> versions = List.of(
                mockVersion("content-item", contentId, 2),
                mockVersion("content-item", contentId, 1)
        );
        when(contentVersionHistoryRepository
                .findByContentTypeAndContentIdOrderByVersionNumberDesc("content-item", contentId))
                .thenReturn(versions);

        var result = contentVersionHistoryService.getHistory("content-item", contentId);

        assertEquals(2, result.size());
        assertEquals(2, result.get(0).getVersionNumber());
    }

    @Test
    void getVersion_notFound_throwsResourceNotFoundException() {
        UUID contentId = UUID.randomUUID();
        when(contentVersionHistoryRepository
                .findByContentTypeAndContentIdAndVersionNumber("content-item", contentId, 99))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> contentVersionHistoryService.getVersion("content-item", contentId, 99));
    }

    @Test
    void snapshot_createsNewVersionWithNextNumber() throws Exception {
        UUID contentId = UUID.randomUUID();
        when(contentVersionHistoryRepository
                .countByContentTypeAndContentId("content-item", contentId))
                .thenReturn(2);
        when(objectMapper.writeValueAsString(any())).thenReturn("{\"title\":\"New\"}");

        ContentVersionHistory saved = mockVersion("content-item", contentId, 3);
        when(contentVersionHistoryRepository.save(any())).thenReturn(saved);

        var result = contentVersionHistoryService.snapshot(
                "content-item", contentId, new Object(), "Manual save", null);

        assertNotNull(result);
        assertEquals(3, result.getVersionNumber());
    }
}
