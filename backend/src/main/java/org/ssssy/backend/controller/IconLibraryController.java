package org.ssssy.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.IconPackResponse;

import java.util.List;
import java.util.Map;

/**
 * Icon Library API — serves icon pack metadata to the frontend.
 * Icons themselves are rendered client-side (Lucide etc.).
 * This endpoint returns the pack catalogue and icon name lists.
 */
@RestController
@RequestMapping("/api/admin/icons")
@RequiredArgsConstructor
public class IconLibraryController {

    // Static icon packs catalogue
    private static final List<IconPackResponse> PACKS = List.of(
        IconPackResponse.builder()
            .packId("lucide").packName("Lucide")
            .description("Open-source icon library with ~1000 icons").iconCount(1000)
            .license("ISC").homepage("https://lucide.dev")
            .categories(List.of("Navigation","Actions","Communication","Media","Files","UI","Layout","Users","Data","Social","Science"))
            .build(),
        IconPackResponse.builder()
            .packId("heroicons").packName("Heroicons")
            .description("Hand-crafted SVG icons by Tailwind CSS team").iconCount(292)
            .license("MIT").homepage("https://heroicons.com")
            .categories(List.of("Solid","Outline","Mini"))
            .build(),
        IconPackResponse.builder()
            .packId("tabler").packName("Tabler Icons")
            .description("Free and open source icon library with 4000+ icons").iconCount(4202)
            .license("MIT").homepage("https://tabler-icons.io")
            .categories(List.of("General","Arrows","Brand","Design","Education","Finance","Food","Health","Nature","Technology","Travel"))
            .build(),
        IconPackResponse.builder()
            .packId("fa-free").packName("Font Awesome Free")
            .description("The web's most popular icon library — free tier").iconCount(2018)
            .license("CC BY 4.0 / MIT").homepage("https://fontawesome.com")
            .categories(List.of("Solid","Regular","Brands"))
            .build()
    );

    /** List all available icon packs */
    @GetMapping
    @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<IconPackResponse>>> getPacks() {
        return ResponseEntity.ok(ApiResponse.ok(PACKS));
    }

    /** Get metadata for a specific pack */
    @GetMapping("/{packId}")
    @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<IconPackResponse>> getPack(@PathVariable String packId) {
        return PACKS.stream()
                .filter(p -> p.getPackId().equals(packId))
                .findFirst()
                .map(p -> ResponseEntity.ok(ApiResponse.ok(p)))
                .orElse(ResponseEntity.notFound().build());
    }

    /** Get total icon count across all packs */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        int total = PACKS.stream().mapToInt(IconPackResponse::getIconCount).sum();
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
            "totalPacks", PACKS.size(),
            "totalIcons", total,
            "packs", PACKS.stream().map(p -> Map.of("packId", p.getPackId(), "count", p.getIconCount())).toList()
        )));
    }
}
