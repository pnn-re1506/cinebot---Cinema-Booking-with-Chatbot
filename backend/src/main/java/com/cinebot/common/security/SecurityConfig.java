package com.cinebot.common.security;

import com.cinebot.common.CinebotProperties;
import com.cinebot.common.error.ErrorCode;
import com.cinebot.common.error.ProblemResponses;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import java.util.List;
import javax.crypto.SecretKey;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * Stateless JWT access (HS256) and the authorization matrix (ARCHITECTURE §7.1, §7.4). Booking tokens are checked
 * in the booking services, so {@code /api/bookings/**} is permitted here.
 */
@Configuration
public class SecurityConfig {

    @Bean
    SecretKey jwtSecretKey(CinebotProperties properties) {
        return JwtSecrets.hmacSha256(properties.jwtSecret());
    }

    @Bean
    JwtDecoder jwtDecoder(SecretKey jwtSecretKey) {
        return NimbusJwtDecoder.withSecretKey(jwtSecretKey)
                .macAlgorithm(org.springframework.security.oauth2.jose.jws.MacAlgorithm.HS256)
                .build();
    }

    @Bean
    JwtEncoder jwtEncoder(SecretKey jwtSecretKey) {
        return new NimbusJwtEncoder(new ImmutableSecret<>(jwtSecretKey));
    }

    @Bean
    RefreshCookieSettings refreshCookieSettings() {
        return RefreshCookieSettings.contract();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(CinebotProperties properties) {
        CorsConfiguration cors = new CorsConfiguration();
        cors.setAllowedOrigins(List.of(AuthRequestGuardFilter.normalize(properties.frontendOrigin())));
        cors.setAllowCredentials(true);
        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cors.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Accept",
                "Accept-Language",
                "X-Requested-With",
                "X-Booking-Token",
                "X-Client-Id"));
        cors.setExposedHeaders(List.of("Retry-After"));
        cors.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cors);
        return source;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, CinebotProperties properties, ObjectMapper objectMapper)
            throws Exception {
        var entryPoint = (org.springframework.security.web.AuthenticationEntryPoint)
                (request, response, authException) ->
                        ProblemResponses.write(response, objectMapper, ErrorCode.UNAUTHENTICATED);
        var denied = (org.springframework.security.web.access.AccessDeniedHandler)
                (request, response, accessDeniedException) ->
                        ProblemResponses.write(response, objectMapper, ErrorCode.FORBIDDEN);
        AuthRequestGuardFilter authGuard = new AuthRequestGuardFilter(
                java.util.Set.of(AuthRequestGuardFilter.normalize(properties.frontendOrigin())), objectMapper);

        http.csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(handler -> handler
                        .authenticationEntryPoint(entryPoint)
                        .accessDeniedHandler(denied))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/movies/**", "/api/showtimes/**", "/api/snacks", "/api/cinema")
                                .permitAll()
                        .requestMatchers("/api/bookings/**", "/api/payments/**", "/api/auth/**").permitAll()
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/webjars/**",
                                "/actuator/health",
                                "/actuator/health/**")
                                .permitAll()
                        .requestMatchers("/api/me/**").authenticated()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/staff/**").hasAnyRole("STAFF", "ADMIN")
                        .requestMatchers("/api/kiosk/**").denyAll()
                        .anyRequest().denyAll())
                .oauth2ResourceServer(oauth -> oauth
                        .authenticationEntryPoint(entryPoint)
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())))
                .addFilterBefore(authGuard, CorsFilter.class);
        return http.build();
    }

    static JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            String role = jwt.getClaimAsString("role");
            if (role == null || role.isBlank()) {
                return List.of();
            }
            String authority = role.startsWith("ROLE_") ? role : "ROLE_" + role;
            return List.of(new SimpleGrantedAuthority(authority));
        });
        return converter;
    }
}
