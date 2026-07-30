package org.ssssy.backend.controller;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.PublicationRequest;
import org.ssssy.backend.model.dto.PublicationResponse;
import org.ssssy.backend.service.PublicationService;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PublicationController {

    private final PublicationService publicationService;

    // ── PDF proxy ─────────────────────────────────────────────────────────────
    // Streams an external PDF through our origin so the browser's <iframe>
    // viewer is not blocked by X-Frame-Options / CORP on the remote server.

    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .followRedirects(HttpClient.Redirect.ALWAYS)
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    /**
     * Fetches a remote PDF and returns it to the browser.
     *
     * <p>IMPORTANT — never call {@code response.sendError()} here.
     * {@code sendError()} triggers Spring Boot's error dispatch to {@code /error},
     * which Spring Security may intercept (returning 403) before the intended
     * status code reaches the client.  All error responses are written directly
     * via {@code response.setStatus()} + {@code getWriter().write()} instead.</p>
     */
    @GetMapping("/public/pdf-proxy")
    public void proxyPdf(@RequestParam String url, HttpServletResponse response) throws IOException {

        // Only allow http/https — block file:// data: etc.
        if (url == null || (!url.startsWith("http://") && !url.startsWith("https://"))) {
            writeError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid URL");
            return;
        }

        HttpRequest req;
        try {
            req = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(45))
                    .header("User-Agent",
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
                            "AppleWebKit/537.36 (KHTML, like Gecko) " +
                            "Chrome/125.0.0.0 Safari/537.36")
                    .header("Accept", "application/pdf,application/octet-stream,*/*;q=0.9")
                    .header("Accept-Language", "en-US,en;q=0.9")
                    .header("Accept-Encoding", "identity")
                    .header("Referer", "https://www.google.com/")
                    .header("Sec-Fetch-Dest", "document")
                    .header("Sec-Fetch-Mode", "navigate")
                    .header("Sec-Fetch-Site", "cross-site")
                    .GET()
                    .build();
        } catch (IllegalArgumentException e) {
            writeError(response, HttpServletResponse.SC_BAD_REQUEST, "Malformed URL");
            return;
        }

        HttpResponse<InputStream> upstream;
        try {
            upstream = HTTP_CLIENT.send(req, HttpResponse.BodyHandlers.ofInputStream());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            writeError(response, HttpServletResponse.SC_BAD_GATEWAY, "Proxy interrupted");
            return;
        } catch (IOException e) {
            log.warn("PDF proxy – connection failed for {}: {}", url, e.getMessage());
            writeError(response, HttpServletResponse.SC_BAD_GATEWAY, "Cannot reach remote server");
            return;
        }

        int status = upstream.statusCode();
        if (status < 200 || status >= 300) {
            log.warn("PDF proxy – upstream returned {} for {}", status, url);
            upstream.body().close();
            int replyStatus = (status >= 400 && status < 600) ? status : HttpServletResponse.SC_BAD_GATEWAY;
            writeError(response, replyStatus, "Remote server returned " + status);
            return;
        }

        // Buffer the full PDF before committing the response.
        // Once setStatus(200) + getOutputStream() are called the response is
        // committed and we can no longer change the status code.  Buffering
        // ensures a truncated stream never reaches the browser as a partial PDF.
        final byte[] pdfBytes;
        try (InputStream in = upstream.body()) {
            pdfBytes = in.readAllBytes();
        } catch (IOException e) {
            log.warn("PDF proxy – failed to read upstream body for {}: {}", url, e.getMessage());
            writeError(response, HttpServletResponse.SC_BAD_GATEWAY, "Remote PDF stream was interrupted");
            return;
        }

        // Validate %PDF- magic bytes on the fully-buffered content.
        if (pdfBytes.length < 4
                || pdfBytes[0] != '%' || pdfBytes[1] != 'P'
                || pdfBytes[2] != 'D' || pdfBytes[3] != 'F') {
            log.warn("PDF proxy – response for {} is not a PDF ({} bytes)", url, pdfBytes.length);
            writeError(response, HttpServletResponse.SC_BAD_GATEWAY,
                    "Remote server did not return a valid PDF file");
            return;
        }

        // All bytes received and validated — commit the response.
        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "inline");
        response.setHeader("Cache-Control", "public, max-age=3600");
        response.setContentLength(pdfBytes.length);
        try (OutputStream out = response.getOutputStream()) {
            out.write(pdfBytes);
            out.flush();
        } catch (IOException e) {
            log.debug("PDF proxy – client disconnected while writing {}: {}", url, e.getMessage());
        }
    }

    /** Write a plain-text error response directly, bypassing Spring's error dispatch. */
    private static void writeError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("text/plain;charset=UTF-8");
        response.getWriter().write(message);
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
