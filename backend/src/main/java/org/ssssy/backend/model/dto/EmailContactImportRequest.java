package org.ssssy.backend.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EmailContactImportRequest {
  @NotEmpty
  @Valid
  private List<EmailContactRequest> contacts;
}
