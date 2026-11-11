package com.cinebot.common.security;

import com.cinebot.common.error.ErrorCode;
import com.cinebot.common.error.ProblemResponses;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Set;
import org.springframework.http.HttpHeaders;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * CSRF guard for cookie-scoped auth endpoints (ARCHITECTURE §7.2). Requires {@code X-Requested-With:
 * XMLHttpRequest}. When {@code Origin} is present it must be on the frontend allow-list. Otherwise 403
 * {@code FORBIDDEN}.
 */
public class AuthRequestGuardFilter extends OncePerRequestFilter {

    static final String REQUESTED_WITH = "XMLHttpRequest";

    private final Set<String> allowedOrigins;
    private final ObjectMapper objectMapper;

    public AuthRequestGuardFilter(Set<String> allowedOrigins, ObjectMapper objectMapper) {
        this.allowedOrigins = Set.copyOf(allowedOrigins);
        this.objectMapper = objectMapper;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return !(uri.equals("/api/auth") || uri.startsWith("/api/auth/"));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if (!REQUESTED_WITH.equals(request.getHeader("X-Requested-With"))) {
            ProblemResponses.write(response, objectMapper, ErrorCode.FORBIDDEN);
            return;
        }
        String origin = request.getHeader(HttpHeaders.ORIGIN);
        if (origin != null && !origin.isBlank() && !allowedOrigins.contains(normalize(origin))) {
            ProblemResponses.write(response, objectMapper, ErrorCode.FORBIDDEN);
            return;
        }
        chain.doFilter(request, response);
    }

    static String normalize(String origin) {
        String trimmed = origin.trim();
        if (trimmed.endsWith("/")) {
            return trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed;
    }
}
