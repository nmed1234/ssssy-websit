package org.ssssy.backend.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Adds HTTP {@code Cache-Control} headers to API responses based on the URL path.
 *
 * <ul>
 *   <li>{@code GET /api/public/**} — {@code public, max-age=30, stale-while-revalidate=60}
 *       (safe to cache in CDN/browser for 30 s, serve stale for an extra 60 s while revalidating)</li>
 *   <li>{@code GET /api/admin/**} and {@code /api/auth/**} — {@code no-store, no-cache}
 *       (never cache authenticated or sensitive responses)</li>
 *   <li>All other requests — no header added (let the default apply).</li>
 * </ul>
 *
 * This filter deliberately does NOT override a {@code Cache-Control} header that has already
 * been set upstream (e.g. by {@link org.springframework.web.filter.ShallowEtagHeaderFilter}).
 */
@Component
public class CacheControlFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String method = request.getMethod();
        String uri = request.getRequestURI();

        // Set Cache-Control BEFORE the chain so the header is present before any
        // response body is written.  Controllers can still override by calling
        // response.setHeader("Cache-Control", ...) themselves.
        if ("GET".equalsIgnoreCase(method) || "HEAD".equalsIgnoreCase(method)) {
            if (uri.startsWith("/api/public/")) {
                // Public read-only endpoints — safe to cache briefly at CDN and browser level.
                response.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
            } else if (uri.startsWith("/api/admin/") || uri.startsWith("/api/auth/")) {
                // Sensitive / authenticated — must never be cached.
                response.setHeader("Cache-Control", "no-store, no-cache");
                response.setHeader("Pragma", "no-cache");
            }
        } else if (uri.startsWith("/api/admin/") || uri.startsWith("/api/auth/")) {
            // Mutation endpoints on sensitive paths also must not be cached.
            response.setHeader("Cache-Control", "no-store, no-cache");
        }

        filterChain.doFilter(request, response);
    }
}
