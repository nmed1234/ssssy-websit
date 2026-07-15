package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.EmailFolder;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmailFolderRepository extends JpaRepository<EmailFolder, UUID> {

  List<EmailFolder> findByAccountIdOrderBySortOrderAsc(UUID accountId);

  Optional<EmailFolder> findByAccountIdAndFolderType(UUID accountId, String folderType);

  List<EmailFolder> findByAccountIdAndSystemFolderTrue(UUID accountId);

  Optional<EmailFolder> findByAccountIdAndImapFolderName(UUID accountId, String imapFolderName);
}
