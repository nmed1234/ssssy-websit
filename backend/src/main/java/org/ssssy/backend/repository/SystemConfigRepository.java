package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.SystemConfig;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SystemConfigRepository extends JpaRepository<SystemConfig, UUID> {
  Optional<SystemConfig> findByConfigKey(String configKey);
  List<SystemConfig> findByConfigGroup(String configGroup);
}
