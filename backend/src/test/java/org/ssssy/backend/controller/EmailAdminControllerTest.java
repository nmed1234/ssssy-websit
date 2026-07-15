package org.ssssy.backend.controller;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.ssssy.backend.model.dto.*;
import org.ssssy.backend.service.EmailAccountService;
import org.ssssy.backend.service.EmailAliasService;
import org.ssssy.backend.service.EmailQuotaLogService;
import org.ssssy.backend.service.EmailScheduledSendService;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailAdminControllerTest {

  @Mock
  private EmailAccountService emailAccountService;

  @Mock
  private EmailScheduledSendService scheduledSendService;

  @Mock
  private EmailAliasService emailAliasService;

  @Mock
  private EmailQuotaLogService emailQuotaLogService;

  @InjectMocks
  private EmailAdminController controller;

  @Test
  void getAllAliases_returnsList() {
    EmailAliasResponse alias = EmailAliasResponse.builder()
        .id(UUID.randomUUID())
        .aliasAddress("info@ssssy.org")
        .isActive(true)
        .build();
    when(emailAliasService.getAllAliases()).thenReturn(List.of(alias));

    ResponseEntity<ApiResponse<List<EmailAliasResponse>>> response = controller.getAllAliases();

    assertTrue(response.getBody().isSuccess());
    assertEquals("info@ssssy.org", response.getBody().getData().get(0).getAliasAddress());
  }

  @Test
  void createAlias_createsAndReturns() {
    EmailAliasRequest request = new EmailAliasRequest();
    request.setAliasAddress("contact@ssssy.org");

    EmailAliasResponse responseData = EmailAliasResponse.builder()
        .id(UUID.randomUUID())
        .aliasAddress("contact@ssssy.org")
        .build();
    when(emailAliasService.createAlias(any())).thenReturn(responseData);

    ResponseEntity<ApiResponse<EmailAliasResponse>> response = controller.createAlias(request);

    assertTrue(response.getBody().isSuccess());
    assertEquals("contact@ssssy.org", response.getBody().getData().getAliasAddress());
  }

  @Test
  void deleteAlias_deletes() {
    UUID aliasId = UUID.randomUUID();
    doNothing().when(emailAliasService).deleteAlias(aliasId);

    ResponseEntity<ApiResponse<Void>> response = controller.deleteAlias(aliasId);

    assertTrue(response.getBody().isSuccess());
    verify(emailAliasService).deleteAlias(aliasId);
  }

  @Test
  void getMailQueue_returnsList() {
    EmailScheduledSendResponse scheduled = EmailScheduledSendResponse.builder()
        .id(UUID.randomUUID())
        .status("PENDING")
        .build();
    when(scheduledSendService.getAllScheduledSends()).thenReturn(List.of(scheduled));

    ResponseEntity<ApiResponse<List<EmailScheduledSendResponse>>> response = controller.getMailQueue();

    assertTrue(response.getBody().isSuccess());
    assertEquals("PENDING", response.getBody().getData().get(0).getStatus());
  }

  @Test
  void flushQueue_processesPending() {
    doNothing().when(scheduledSendService).processPendingScheduledSends();

    ResponseEntity<ApiResponse<Void>> response = controller.flushQueue();

    assertTrue(response.getBody().isSuccess());
    verify(scheduledSendService).processPendingScheduledSends();
  }

  @Test
  void getStats_returnsStats() {
    EmailAdminStatsResponse stats = EmailAdminStatsResponse.builder()
        .totalAccounts(10L)
        .activeAccounts(8L)
        .totalUsedBytes(1024L * 1024L)
        .build();
    when(emailAccountService.getAdminStats()).thenReturn(stats);

    ResponseEntity<ApiResponse<EmailAdminStatsResponse>> response = controller.getStats();

    assertTrue(response.getBody().isSuccess());
    assertEquals(10L, response.getBody().getData().getTotalAccounts());
  }

  @Test
  void getStorageReport_returnsReport() {
    EmailStorageReportResponse report = EmailStorageReportResponse.builder()
        .accountId(UUID.randomUUID())
        .emailAddress("test@ssssy.org")
        .quotaBytes(1024L)
        .usedBytes(512L)
        .usagePercent(50.0)
        .build();
    when(emailAccountService.getStorageReport()).thenReturn(List.of(report));

    ResponseEntity<ApiResponse<List<EmailStorageReportResponse>>> response = controller.getStorageReport();

    assertTrue(response.getBody().isSuccess());
    assertEquals("test@ssssy.org", response.getBody().getData().get(0).getEmailAddress());
    assertEquals(50.0, response.getBody().getData().get(0).getUsagePercent());
  }

  @Test
  void getAccounts_returnsList() {
    EmailAccountResponse account = EmailAccountResponse.builder()
        .id(UUID.randomUUID())
        .emailAddress("admin@ssssy.org")
        .build();
    when(emailAccountService.getAllAccounts()).thenReturn(List.of(account));

    ResponseEntity<ApiResponse<List<EmailAccountResponse>>> response = controller.getAllAccounts();

    assertTrue(response.getBody().isSuccess());
    assertEquals("admin@ssssy.org", response.getBody().getData().get(0).getEmailAddress());
  }
}
