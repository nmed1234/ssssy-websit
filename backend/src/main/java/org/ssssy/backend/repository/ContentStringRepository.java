package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.ContentString;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ContentStringRepository extends JpaRepository<ContentString, UUID> {

  Optional<ContentString> findByStringKey(String stringKey);

  List<ContentString> findByStringGroupOrderByStringKey(String stringGroup);

  List<ContentString> findAllByOrderByStringKey();

  boolean existsByStringKey(String stringKey);
}
