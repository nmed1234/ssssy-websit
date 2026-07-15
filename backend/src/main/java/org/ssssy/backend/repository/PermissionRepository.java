package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.Permission;
import java.util.UUID;

public interface PermissionRepository extends JpaRepository<Permission, UUID> {
}
