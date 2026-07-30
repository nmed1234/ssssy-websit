package org.ssssy.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.User;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

  Optional<User> findByUsername(String username);

  Optional<User> findByEmail(String email);

  boolean existsByUsername(String username);

  boolean existsByEmail(String email);

  Page<User> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrFirstNameArContainingIgnoreCaseOrLastNameArContainingIgnoreCase(
      String username, String email, String firstNameAr, String lastNameAr, Pageable pageable);

  /** Find all active users with the given role name (e.g. "EDITOR", "ADMIN"). */
  @org.springframework.data.jpa.repository.Query(
      "SELECT u FROM User u WHERE u.role.name = :roleName AND u.isActive = true AND u.deletedAt IS NULL")
  java.util.List<User> findActiveUsersByRoleName(@org.springframework.data.repository.query.Param("roleName") String roleName);
}
