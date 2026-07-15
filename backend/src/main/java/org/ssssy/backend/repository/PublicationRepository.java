package org.ssssy.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.ssssy.backend.model.entity.Publication;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PublicationRepository extends JpaRepository<Publication, UUID> {

    Optional<Publication> findBySlug(String slug);

    List<Publication> findByIsActiveTrueOrderBySortOrderAsc();

    Page<Publication> findByIsActiveTrueOrderBySortOrderAsc(Pageable pageable);

    Page<Publication> findByIsActiveTrueAndYearOrderBySortOrderAsc(Integer year, Pageable pageable);

    Page<Publication> findByIsActiveTrueAndCategoryOrderBySortOrderAsc(String category, Pageable pageable);

    Page<Publication> findByIsActiveTrueAndYearAndCategoryOrderBySortOrderAsc(Integer year, String category, Pageable pageable);

    @Query("SELECT p FROM Publication p WHERE p.isActive = true AND (" +
           "LOWER(p.titleEn) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(p.titleAr) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(p.authors) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Publication> searchActive(@Param("q") String q, Pageable pageable);

    @Query("SELECT p FROM Publication p WHERE p.isActive = true AND (" +
           "LOWER(p.titleEn) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(p.titleAr) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(p.authors) LIKE LOWER(CONCAT('%', :q, '%'))) " +
           "AND (:year IS NULL OR p.year = :year) " +
           "AND (:category IS NULL OR p.category = :category)")
    Page<Publication> searchActiveFiltered(@Param("q") String q,
                                           @Param("year") Integer year,
                                           @Param("category") String category,
                                           Pageable pageable);
}
