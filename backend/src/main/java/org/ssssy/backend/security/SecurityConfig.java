package org.ssssy.backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.ssssy.backend.filter.CacheControlFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

  private final JwtAuthenticationFilter jwtAuthFilter;
  private final RateLimitFilter rateLimitFilter;
  private final SecurityHeadersFilter securityHeadersFilter;
  private final CorrelationIdFilter correlationIdFilter;
  private final CacheControlFilter cacheControlFilter;

  @Value("${app.swagger.enabled:false}")
  private boolean swaggerEnabled;

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .headers(headers -> headers
            // Disable Spring Security's automatic X-Frame-Options header —
            // SecurityHeadersFilter owns this header entirely so it can set
            // SAMEORIGIN on the pdf-proxy endpoint and DENY everywhere else.
            .frameOptions(fo -> fo.disable())
            .contentTypeOptions(Customizer.withDefaults())
            .httpStrictTransportSecurity(hsts -> hsts
                .maxAgeInSeconds(31536000)
                .includeSubDomains(true)
                .preload(true))
        )
        .authorizeHttpRequests(auth -> {
          auth
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/api/public/**").permitAll()
            .requestMatchers("/uploads/**").permitAll()
            // Public PDF download — only PDF MIME types are served (enforced in the handler).
            .requestMatchers(HttpMethod.GET, "/api/media/files/*/download").permitAll()
            .requestMatchers("/ws", "/ws/**", "/ws/info", "/ws/info/**").permitAll()
            .requestMatchers("/robots.txt", "/favicon.ico").permitAll()
            .requestMatchers("/actuator/health").permitAll();
          // Swagger/OpenAPI endpoints are only publicly accessible when explicitly enabled.
          if (swaggerEnabled) {
            auth.requestMatchers("/swagger-ui/**", "/api-docs/**").permitAll();
          }
          auth
            // Preview GET endpoint is public — token itself provides security (Requirements: 8.6, 8.7)
            .requestMatchers(HttpMethod.GET, "/api/preview/**").permitAll()
            .anyRequest().authenticated();
        })
        .addFilterBefore(correlationIdFilter, UsernamePasswordAuthenticationFilter.class)
        .addFilterBefore(securityHeadersFilter, UsernamePasswordAuthenticationFilter.class)
        .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
        .addFilterBefore(cacheControlFilter, UsernamePasswordAuthenticationFilter.class)
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    // Strength 12: ~300ms per hash on modern hardware — good resistance to offline attacks.
    return new BCryptPasswordEncoder(12);
  }

  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
      throws Exception {
    return config.getAuthenticationManager();
  }
}
