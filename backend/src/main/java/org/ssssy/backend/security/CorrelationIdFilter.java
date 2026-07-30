package org.ssssy.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Assigns a correlation ID to every request so that log entries and HTTP
 * responses share a common token, enabling support teams to correlate a
 * client-reported error ID with a specific log line without exposing any
 * internal detail in the response body.
 *
 * Precedence:
 *   1. Use the incoming X-Correlation-ID or X-Request-ID header value
 *      (allows a reverse proxy or client to set the correlation ID).
 *   2. Otherwise generate a new UUID.
 *
 * The correlation ID is:
 *   - Stored in SLF4J MDC under key "correlationId" for the duration of
 *     the request (automatically included in log patterns via %X{correlationId}).
 *   - Written to the X-Correlation-ID response header so the client can
 *     quote it when reporting an issue.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorrelationIdFilter extends OncePerRequestFilter {

    private static final String CORRELATION_HEADER = "X-Correlation-ID";
    private static final String REQUEST_ID_HEADER  = "X-Request-ID";
    private static final String MDC_KEY            = "correlationId";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String correlationId = request.getHeader(CORRELATION_HEADER);
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = request.getHeader(REQUEST_ID_HEADER);
        }
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString();
        }

        MDC.put(MDC_KEY, correlationId);
        response.setHeader(CORRELATION_HEADER, correlationId);

        try {
            filterChain.doFilter(request, response);
        } finally {
            // Always clean up MDC to prevent leaking into the next request
            // if this thread is reused from a pool.
            MDC.remove(MDC_KEY);
        }
    }
}
