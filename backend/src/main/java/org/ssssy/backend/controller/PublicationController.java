package org.ssssy.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.PublicationRequest;
import org.ssssy.backend.model.dto.PublicationResponse;
import org.ssssy.backend.service.PublicationService;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PublicationController {

    private final PublicationService publicationService;

    // ── PDF proxy ─────────────────────────────────────────────────────────────
    // Fetches an external PDF server-side and re-serves it from our origin,
    // so the browser's <object> viewer is not blocked by X-Frame-Options.

    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .followRedirects(java.net.http.HttpClient.Redirect.NORMAL)
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @GetMapping("/public/pdf-proxy")
    public ResponseEntity<byte[]> proxyPdf(@RequestParam String url) {
        // Only proxy http/https URLs.
        if (url == null || (!url.startsWith("http://") && !url.startsWith("https://"))) {
            return ResponseEntity.badRequest().build();
        }
        try {
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(30))
                    .header("User-Agent", "Mozilla/5.0 (compatible; SSSSY-Bot/1.0)")
                    .GET()
                    .build();
            HttpResponse<byte[]> resp = HTTP_CLIENT.send(req, HttpResponse.BodyHandlers.ofByteArray());
            if (resp.statusCode() < 200 || resp.statusCode() >= 300) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
            }
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.set("Content-Disposition", "inline");
            // Tell the browser it is safe to display this — prevents OpaqueResponseBlocking.
            headers.set("X-Content-Type-Options", "nosniff");
            return new ResponseEntity<>(resp.body(), headers, HttpStatus.OK);
        } catch (IOException | InterruptedException e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
        }
    }

    // ── Public endpoints ─────────────────────────────────────────────────────

    @GetMapping("/public/publications")
    public ResponseEntity<ApiResponse<Page<PublicationResponse>>> getPublications(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "12") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("sortOrder").ascending());
        return ResponseEntity.ok(ApiResponse.ok(
                publicationService.getPublications(search, year, category, pageable)));
    }

    @GetMapping("/public/publications/{slug}")
    public ResponseEntity<ApiResponse<PublicationResponse>> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.ok(publicationService.getBySlug(slug)));
    }

    // ── Admin endpoints ───────────────────────────────────────────────────────

    @GetMapping("/admin/publications")
    @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Page<PublicationResponse>>> getAll(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "50") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("sortOrder").ascending());
        return ResponseEntity.ok(ApiResponse.ok(publicationService.getAll(pageable)));
    }

    @PostMapping("/admin/publications")
    @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PublicationResponse>> create(
            @Valid @RequestBody PublicationRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(publicationService.create(request)));
    }

    @PutMapping("/admin/publications/{id}")
    @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PublicationResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody PublicationRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(publicationService.update(id, request)));
    }

    @DeleteMapping("/admin/publications/{id}")
    @PreAuthorize("hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> delete(@PathVariable UUID id) {
        publicationService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Publication deleted successfully")));
    }
}
