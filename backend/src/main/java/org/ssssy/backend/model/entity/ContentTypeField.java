package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * A single field definition within a ContentTypeDefinition.
 * E.g. the "abstract" text field or "doi" URL field of a Research Paper type.
 */
@Entity
@Table(name = "content_type_fields")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContentTypeField {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "content_type_id", nullable = false)
  private ContentTypeDefinition contentType;

  /** Internal JSON key name — lowercase, underscored. */
  @Column(name = "field_name", nullable = false, length = 100)
  private String fieldName;

  @Column(name = "field_label_en", nullable = false, length = 255)
  private String fieldLabelEn;

  @Column(name = "field_label_ar", length = 255)
  private String fieldLabelAr;

  /**
   * Supported field types:
   * text | richtext | number | date | datetime | url | email |
   * select | multiselect | checkbox | radio | media | file
   */
  @Column(name = "field_type", nullable = false, length = 50)
  private String fieldType;

  @Column(name = "is_required")
  @Builder.Default
  private Boolean isRequired = false;

  /** Whether this field is indexed and returned in search results. */
  @Column(name = "is_searchable")
  @Builder.Default
  private Boolean isSearchable = false;

  /** Whether this field is shown in the admin list view. */
  @Column(name = "is_listed")
  @Builder.Default
  private Boolean isListed = true;

  @Column(name = "placeholder_en", length = 255)
  private String placeholderEn;

  @Column(name = "placeholder_ar", length = 255)
  private String placeholderAr;

  @Column(name = "help_text_en", columnDefinition = "TEXT")
  private String helpTextEn;

  @Column(name = "help_text_ar", columnDefinition = "TEXT")
  private String helpTextAr;

  /** For select/radio: [{value:"x",label:"X",labelAr:"ع"}] */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "options_json", columnDefinition = "jsonb")
  private String optionsJson;

  /** Validation rules: {min, max, pattern, message} */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "validation_json", columnDefinition = "jsonb")
  private String validationJson;

  @Column(name = "sort_order")
  @Builder.Default
  private Integer sortOrder = 0;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
  }
}
