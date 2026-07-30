package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.InstalledPlugin;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InstalledPluginRepository extends JpaRepository<InstalledPlugin, UUID> {

  Optional<InstalledPlugin> findByPluginId(String pluginId);

  boolean existsByPluginId(String pluginId);

  List<InstalledPlugin> findAllByOrderByInstalledAtDesc();

  List<InstalledPlugin> findByStatusOrderByInstalledAtDesc(String status);

  List<InstalledPlugin> findByStatusInOrderByInstalledAtDesc(List<String> statuses);
}
