package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.BoardMember;
import java.util.List;
import java.util.UUID;

public interface BoardMemberRepository extends JpaRepository<BoardMember, UUID> {
  List<BoardMember> findByIsActiveTrueOrderBySortOrderAsc();
  List<BoardMember> findAllByOrderBySortOrderAsc();
}
