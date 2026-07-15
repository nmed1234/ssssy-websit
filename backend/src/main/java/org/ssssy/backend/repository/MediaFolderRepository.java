package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.MediaFolder;
import java.util.List;
import java.util.UUID;

public interface MediaFolderRepository extends JpaRepository<MediaFolder, UUID> {

  List<MediaFolder> findByParentIsNullOrderByName();

  List<MediaFolder> findByParentIdOrderByName(UUID parentId);
}
