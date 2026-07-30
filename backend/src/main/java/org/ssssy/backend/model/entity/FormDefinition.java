package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * A dynamic form defined by an admin in the UI.
 * The schema field holds a JSON array of field definitions (see FormFieldDefinition in SDK).
 * Example schema:
 *   [{"name":"email","type":"email","labelEn":"Email","required":true}, ...]
 */
@Entity
@Table(name = "cms_forms")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FormDefinition {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false, length = 255)
  private String title;

  @Column(name = "title_ar", length = 255)
  private String titleAr;

  @Column(nullable = false, unique = true, length = 100)
  private String slug;

  @Column(columnDefinition = "TEXT")
  private String description;

  /**
   * JSON array of field definitions.
   * Each element: {name, type, labelEn, labelAr, required, placeholder,
   *                options:[{value,label}], validation:{min,max,pattern,message}}
   * Supported types: text, email, textarea, richtext, number, date, datetime,
   *                  select, multiselect, checkbox, radio, file, hidden
   */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "schema_json", columnDefinition = "jsonb", nullable = false)
  private String schemaJson;

  @Column(name = "submit_label_en", length = 100)
  private String submitLabelEn;

  @Column(name = "submit_label_ar", length = 100)
  private String submitLabelAr;

  @Column(name = "success_message_en", columnDefinition = "TEXT")
  private String successMessageEn;

  @Column(name = "success_message_ar", columnDefinition = "TEXT")
  private String successMessageAr;

  @Column(name = "redirect_url", length = 500)
  private String redirectUrl;

  /** Comma-separated email addresses to notify on submission. */
  @Column(name = "notification_emails", columnDefinition = "TEXT")
  private String notificationEmails;

  @Column(name = "requires_auth")
  @Builder.Default
  private Boolean requiresAuth = false;

  @Column(name = "is_active")
  @Builder.Default
  private Boolean isActive = true;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "created_by")
  private User createdBy;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
