package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.audit.AuditService;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.*;
import org.ssssy.backend.model.entity.Role;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.RoleRepository;
import org.ssssy.backend.repository.UserRepository;
import org.ssssy.backend.repository.AuditLogRepository;

import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

  private final UserRepository userRepository;
  private final RoleRepository roleRepository;
  private final PasswordEncoder passwordEncoder;
  private final AuditService auditService;
  private final AuditLogRepository auditLogRepository;

  public Page<UserResponse> getAllUsers(Pageable pageable) {
    return userRepository.findAll(pageable)
        .map(this::toUserResponse);
  }

  public UserResponse getUserById(UUID id) {
    User user = userRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    return toUserResponse(user);
  }

  public Page<UserResponse> searchUsers(String query, Pageable pageable) {
    return userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrFirstNameArContainingIgnoreCaseOrLastNameArContainingIgnoreCase(
        query, query, query, query, pageable)
        .map(this::toUserResponse);
  }

  @Transactional
  public UserResponse createUser(CreateUserRequest request) {
    if (userRepository.existsByUsername(request.getUsername())) {
      throw new BadRequestException("Username already taken");
    }
    if (userRepository.existsByEmail(request.getEmail())) {
      throw new BadRequestException("Email already registered");
    }

    Role role = roleRepository.findById(request.getRoleId())
        .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

    User user = User.builder()
        .username(request.getUsername())
        .email(request.getEmail())
        .passwordHash(passwordEncoder.encode(request.getPassword()))
        .firstNameAr(request.getFirstNameAr())
        .lastNameAr(request.getLastNameAr())
        .firstNameEn(request.getFirstNameEn())
        .lastNameEn(request.getLastNameEn())
        .phone(request.getPhone())
        .institution(request.getInstitution())
        .department(request.getDepartment())
        .position(request.getPosition())
        .specialization(request.getSpecialization())
        .biography(request.getBiography())
        .address(request.getAddress())
        .city(request.getCity())
        .country(request.getCountry())
        .role(role)
        .isActive(true)
        .isEmailVerified(false)
        .failedLoginAttempts(0)
        .build();

    user = userRepository.save(user);
    return toUserResponse(user);
  }

  @Transactional
  public UserResponse updateUser(UUID id, UpdateUserRequest request) {
    User user = userRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

    if (request.getFirstNameAr() != null) user.setFirstNameAr(request.getFirstNameAr());
    if (request.getLastNameAr() != null) user.setLastNameAr(request.getLastNameAr());
    if (request.getFirstNameEn() != null) user.setFirstNameEn(request.getFirstNameEn());
    if (request.getLastNameEn() != null) user.setLastNameEn(request.getLastNameEn());
    if (request.getPhone() != null) user.setPhone(request.getPhone());
    if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
    if (request.getInstitution() != null) user.setInstitution(request.getInstitution());
    if (request.getDepartment() != null) user.setDepartment(request.getDepartment());
    if (request.getPosition() != null) user.setPosition(request.getPosition());
    if (request.getSpecialization() != null) user.setSpecialization(request.getSpecialization());
    if (request.getBiography() != null) user.setBiography(request.getBiography());
    if (request.getAddress() != null) user.setAddress(request.getAddress());
    if (request.getCity() != null) user.setCity(request.getCity());
    if (request.getCountry() != null) user.setCountry(request.getCountry());
    if (request.getIsActive() != null) user.setIsActive(request.getIsActive());
    if (request.getRoleId() != null) {
      Role role = roleRepository.findById(request.getRoleId())
          .orElseThrow(() -> new ResourceNotFoundException("Role not found"));
      user.setRole(role);
    }

    user = userRepository.save(user);
    return toUserResponse(user);
  }

  @Transactional
  public UserResponse updateProfile(UUID id, UpdateProfileRequest request) {
    User user = userRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

    if (request.getFirstNameAr() != null) user.setFirstNameAr(request.getFirstNameAr());
    if (request.getLastNameAr() != null) user.setLastNameAr(request.getLastNameAr());
    if (request.getFirstNameEn() != null) user.setFirstNameEn(request.getFirstNameEn());
    if (request.getLastNameEn() != null) user.setLastNameEn(request.getLastNameEn());
    if (request.getPhone() != null) user.setPhone(request.getPhone());
    if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
    if (request.getInstitution() != null) user.setInstitution(request.getInstitution());
    if (request.getDepartment() != null) user.setDepartment(request.getDepartment());
    if (request.getPosition() != null) user.setPosition(request.getPosition());
    if (request.getSpecialization() != null) user.setSpecialization(request.getSpecialization());
    if (request.getBiography() != null) user.setBiography(request.getBiography());
    if (request.getAddress() != null) user.setAddress(request.getAddress());
    if (request.getCity() != null) user.setCity(request.getCity());
    if (request.getCountry() != null) user.setCountry(request.getCountry());

    user = userRepository.save(user);
    return toUserResponse(user);
  }

  @Transactional
  public void deleteUser(UUID id) {
    if (!userRepository.existsById(id)) {
      throw new ResourceNotFoundException("User not found: " + id);
    }
    userRepository.deleteById(id);
  }

  @Transactional
  public UserResponse assignRole(UUID userId, AssignRoleRequest request) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

    Role role = roleRepository.findById(request.getRoleId())
        .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + request.getRoleId()));

    user.setRole(role);
    user = userRepository.save(user);
    return toUserResponse(user);
  }

  public Page<AuditLogResponse> getUserActivities(UUID userId, Pageable pageable) {
    return auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
        .map(log -> AuditLogResponse.builder()
            .id(log.getId())
            .userId(log.getUserId())
            .action(log.getAction())
            .entityType(log.getEntityType())
            .entityId(log.getEntityId())
            .oldValue(log.getOldValue())
            .newValue(log.getNewValue())
            .ipAddress(log.getIpAddress())
            .userAgent(log.getUserAgent())
            .createdAt(log.getCreatedAt())
            .build());
  }

  private UserResponse toUserResponse(User user) {
    return UserResponse.builder()
        .id(user.getId())
        .username(user.getUsername())
        .email(user.getEmail())
        .firstNameAr(user.getFirstNameAr())
        .lastNameAr(user.getLastNameAr())
        .firstNameEn(user.getFirstNameEn())
        .lastNameEn(user.getLastNameEn())
        .phone(user.getPhone())
        .avatarUrl(user.getAvatarUrl())
        .institution(user.getInstitution())
        .department(user.getDepartment())
        .position(user.getPosition())
        .specialization(user.getSpecialization())
        .biography(user.getBiography())
        .address(user.getAddress())
        .city(user.getCity())
        .country(user.getCountry())
        .twoFactorEnabled(user.getTwoFactorEnabled())
        .role(user.getRole().getName())
        .roleDisplayNameAr(user.getRole().getDisplayNameAr())
        .roleDisplayNameEn(user.getRole().getDisplayNameEn())
        .isActive(user.getIsActive())
        .isEmailVerified(user.getIsEmailVerified())
        .emailVerifiedAt(user.getEmailVerifiedAt())
        .lastLoginAt(user.getLastLoginAt())
        .createdAt(user.getCreatedAt())
        .build();
  }
}
