package org.ssssy.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.EmailDirectoryResponse;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/email/directory")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class EmailDirectoryController {

  private final UserRepository userRepository;

  @GetMapping
  public ResponseEntity<ApiResponse<List<EmailDirectoryResponse>>> getDirectory() {
    List<EmailDirectoryResponse> members = userRepository.findAll().stream()
        .filter(u -> Boolean.TRUE.equals(u.getIsActive()) && u.getDeletedAt() == null)
        .map(this::toResponse)
        .collect(Collectors.toList());
    return ResponseEntity.ok(ApiResponse.ok(members));
  }

  @GetMapping("/departments")
  public ResponseEntity<ApiResponse<List<String>>> getDepartments() {
    List<String> departments = userRepository.findAll().stream()
        .filter(u -> u.getDepartment() != null && !u.getDepartment().isBlank())
        .map(User::getDepartment)
        .distinct()
        .sorted()
        .collect(Collectors.toList());
    return ResponseEntity.ok(ApiResponse.ok(departments));
  }

  @GetMapping("/autocomplete")
  public ResponseEntity<ApiResponse<List<EmailDirectoryResponse>>> autocomplete(@RequestParam String q) {
    String query = q.toLowerCase();
    List<EmailDirectoryResponse> results = userRepository.findAll().stream()
        .filter(u -> Boolean.TRUE.equals(u.getIsActive()) && u.getDeletedAt() == null)
        .filter(u -> (u.getFirstNameEn() != null && u.getFirstNameEn().toLowerCase().contains(query))
            || (u.getLastNameEn() != null && u.getLastNameEn().toLowerCase().contains(query))
            || (u.getEmail() != null && u.getEmail().toLowerCase().contains(query))
            || (u.getDepartment() != null && u.getDepartment().toLowerCase().contains(query)))
        .limit(20)
        .map(this::toResponse)
        .collect(Collectors.toList());
    return ResponseEntity.ok(ApiResponse.ok(results));
  }

  private EmailDirectoryResponse toResponse(User user) {
    return EmailDirectoryResponse.builder()
        .userId(user.getId())
        .firstNameEn(user.getFirstNameEn())
        .lastNameEn(user.getLastNameEn())
        .firstNameAr(user.getFirstNameAr())
        .lastNameAr(user.getLastNameAr())
        .email(user.getEmail())
        .department(user.getDepartment())
        .position(user.getPosition())
        .institution(user.getInstitution())
        .build();
  }
}
