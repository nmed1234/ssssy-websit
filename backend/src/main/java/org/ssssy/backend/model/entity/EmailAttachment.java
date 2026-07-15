package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "email_attachments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmailAttachment {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "message_id")
  private EmailMessage message;

  @Column(nullable = false, length = 500)
  private String filename;

  @Column(name = "mime_type", length = 200, nullable = false)
  private String mimeType;

  @Column(name = "size_bytes", nullable = false)
  private Integer sizeBytes;

  @Column(name = "storage_path", length = 1000, nullable = false)
  private String storagePath;

  @Column(name = "content_id", length = 500)
  private String contentId;

  @Column(name = "is_inline")
  private Boolean isInline;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    if (isInline == null) isInline = false;
  }
}
