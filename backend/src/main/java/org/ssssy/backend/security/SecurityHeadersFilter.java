package org.ssssy.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.stream.Collectors;

/**
 * Applies HTTP security response headers on every request.
 * Runs very early in the filter chain so downstream filters/handlers
 * always have the headers present.
 *
 * <p>frame-ancestors on the pdf-proxy response must list the frontend origin
 * explicitly.  'self' on the backend response means localhost:8080, NOT
 * localhost:3000 — so the iframe hosted on port 3000 would be blocked.
 * We read app.cors.allowed-origins and build the directive dynamically.</p>
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class SecurityHeadersFilter extends OncePerRequestFilter {

    private static final String DEFAULT_CSP =
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' data: blob: *; " +
            "font-src 'self' data:; " +
            "connect-src 'self'; " +
            "frame-ancestors 'none'; " +
            "object-src 'none'; " +
            "base-uri 'self'; " +
            "form-action 'self';";

    /** Built once at startup from app.cors.allowed-origins. */
    private final String pdfCsp;

    /**
     * @param allowedOrigins Comma-separated frontend origins from
     *                       {@code app.cors.allowed-origins}, e.g.
     *                       {@code http://localhost:3000} or
     *                       {@code https://ssssyria.org,https://www.ssssyria.org}
     */
    public SecurityHeadersFilter(
            @Value("${app.cors.allowed-origins:http://localhost:3000}") String allowedOrigins) {

        // Convert "https://a.com,https://b.com" → "https://a.com https://b.com"
        // so it can be dropped directly into the frame-ancestors value.
        String frameAncestors = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(o -> !o.isEmpty())
                .collect(Collectors.joining(" "));

        // Always include 'self' (covers the backend origin itself) plus every
        // configured frontend origin.
        pdfCsp = "default-src 'self'; " +
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
                "style-src 'self' 'unsafe-inline'; " +
                "img-src 'self' data: blob: *; " +
                "font-src 'self' data:; " +
                "connect-src 'self'; " +
                "frame-ancestors 'self' " + frameAncestors + "; " +
                "object-src 'none'; " +
                "base-uri 'self'; " +
                "form-action 'self';";
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        boolean isPdfEndpoint = isPdfEndpoint(request.getRequestURI());

        response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("X-XSS-Protection", "0");
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
        response.setHeader("Cross-Origin-Opener-Policy", "same-origin");
        // pdf-proxy: cross-origin so the browser can consume the response inside
        // an <iframe> on the frontend origin. Everything else stays same-origin.
        response.setHeader("Cross-Origin-Resource-Policy", isPdfEndpoint ? "cross-origin" : "same-origin");
        response.setHeader("Content-Security-Policy", isPdfEndpoint ? pdfCsp : DEFAULT_CSP);

        // X-Frame-Options is kept only for non-pdf responses as a fallback for
        // browsers that predate CSP (frame-ancestors supersedes it in modern browsers).
        // On the pdf-proxy response it is intentionally omitted: the CSP
        // frame-ancestors directive already allows the frontend origin, and having
        // both headers together causes browsers to log
        // "Ignoring x-frame-options because of frame-ancestors directive".
        if (!isPdfEndpoint) {
            response.setHeader("X-Frame-Options", "DENY");
        }

        filterChain.doFilter(request, response);
    }

    private boolean isPdfEndpoint(String uri) {
        return uri != null && (uri.contains("/pdf") || uri.contains("/proxy/pdf"));
    }
}
