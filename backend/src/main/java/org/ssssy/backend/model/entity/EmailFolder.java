package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "email_folders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmailFolder {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "account_id")
  private EmailAccount account;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "parent_id")
  private EmailFolder parent;

  @Column(nullable = false, length = 200)
  private String name;

  @Column(name = "folder_type", length = 50, nullable = false)
  private String folderType;

  @Column(name = "system_folder")
  private Boolean systemFolder;

  @Column(name = "sort_order")
  private Integer sortOrder;

  @Column(name = "unread_count")
  private Integer unreadCount;

  @Column(name = "total_count")
  private Integer totalCount;

  @Column(name = "imap_folder_name", length = 500)
  private String imapFolderName;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    if (folderType == null) folderType = "CUSTOM";
    if (systemFolder == null) systemFolder = false;
    if (unreadCount == null) unreadCount = 0;
    if (totalCount == null) totalCount = 0;
    if (sortOrder == null) sortOrder = 0;
  }
}
