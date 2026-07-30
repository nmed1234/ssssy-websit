package org.ssssy.backend.model.dto;

import lombok.*;

/** Request for a single field within a content type. */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContentTypeFieldRequest {

  private String fieldName;
  private String fieldLabelEn;
  private String fieldLabelAr;
  /** text|richtext|number|date|datetime|url|email|select|multiselect|checkbox|radio|media|file */
  private String fieldType;
  private Boolean isRequired;
  private Boolean isSearchable;
  private Boolean isListed;
  private String placeholderEn;
  private String placeholderAr;
  private String helpTextEn;
  private String helpTextAr;
  /** JSON string: [{value,label,labelAr}] for select/radio */
  private String optionsJson;
  /** JSON string: {min,max,pattern,message} */
  private String validationJson;
  private Integer sortOrder;
}
