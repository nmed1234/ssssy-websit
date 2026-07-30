package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * A single submission to a dynamic form.
 * The data field holds the submitted values as a JSON object keyed by field name.
 */
@Entity
@Table(name = "cms_form_submissions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FormSubmission {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "form_id", nullable = false)
  private FormDefinition form;

  /** Nullable — anonymous submissions are allowed when requiresAuth=false. */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  private User user;

  /**
   * JSON object with the submitted field values.
   * Key = field name from schema, value = submitted value.
   */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "data", columnDefinition = "jsonb", nullable = false)
  private String data;

  @Column(name = "submitter_name", length = 255)
  private String submitterName;

  @Column(name = "submitter_email", length = 255)
  private String submitterEmail;

  @Column(name = "ip_address", length = 45)
  private String ipAddress;

  @Column(name = "user_agent", columnDefinition = "TEXT")
  private String userAgent;

  /** PENDING, REVIEWED, SPAM */
  @Column(length = 30)
  @Builder.Default
  private String status = "PENDING";

  @Column(name = "admin_notes", columnDefinition = "TEXT")
  private String adminNotes;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
  }
}
