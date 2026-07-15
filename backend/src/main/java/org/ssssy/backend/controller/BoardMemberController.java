package org.ssssy.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.BoardMemberRequest;
import org.ssssy.backend.model.dto.BoardMemberResponse;
import org.ssssy.backend.service.BoardMemberService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BoardMemberController {

  private final BoardMemberService boardMemberService;

  @GetMapping("/public/board-members")
  public ResponseEntity<ApiResponse<List<BoardMemberResponse>>> getActiveMembers() {
    return ResponseEntity.ok(ApiResponse.ok(boardMemberService.getActiveMembers()));
  }

  @GetMapping("/admin/board-members")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<BoardMemberResponse>>> getAllMembers() {
    return ResponseEntity.ok(ApiResponse.ok(boardMemberService.getAllMembers()));
  }

  @PostMapping("/admin/board-members")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<BoardMemberResponse>> createMember(
      @Valid @RequestBody BoardMemberRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(boardMemberService.createMember(request)));
  }

  @PutMapping("/admin/board-members/{id}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<BoardMemberResponse>> updateMember(
      @PathVariable UUID id, @Valid @RequestBody BoardMemberRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(boardMemberService.updateMember(id, request)));
  }

  @DeleteMapping("/admin/board-members/{id}")
  @PreAuthorize("hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, String>>> deleteMember(@PathVariable UUID id) {
    boardMemberService.deleteMember(id);
    return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Board member deleted successfully")));
  }
}
