package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "theme_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThemeSetting {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "setting_key", length = 100, nullable = false, unique = true)
  private String settingKey;

  @Column(name = "setting_value", nullable = false)
  private String settingValue;

  @Column(name = "setting_type", length = 50)
  private String settingType;

  @Column(name = "group_name", length = 50)
  private String groupName;

  @Column(length = 200)
  private String label;

  @CreationTimestamp
  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;
}
