package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.ThemeSetting;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ThemeSettingRepository extends JpaRepository<ThemeSetting, UUID> {

  List<ThemeSetting> findAllByOrderByGroupNameAscSettingKeyAsc();

  List<ThemeSetting> findByGroupNameOrderBySettingKeyAsc(String groupName);

  Optional<ThemeSetting> findBySettingKey(String settingKey);
}
