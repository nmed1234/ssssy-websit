package org.ssssy.backend.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.ShallowEtagHeaderFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

  @Value("${app.cors.allowed-origins:http://localhost:3000}")
  private String allowedOrigins;

  @PostConstruct
  public void validateCorsConfig() {
    for (String origin : allowedOrigins.split(",")) {
      if ("*".equals(origin.trim())) {
        throw new IllegalStateException(
            "CORS wildcard origin is not allowed when credentials are enabled");
      }
    }
  }

  /**
   * Adds ETag support to all responses. When a client sends {@code If-None-Match}
   * matching the current ETag, Spring returns 304 Not Modified with no body —
   * reducing bandwidth for unchanged content.
   */
  @Bean
  public ShallowEtagHeaderFilter shallowEtagHeaderFilter() {
    return new ShallowEtagHeaderFilter();
  }

  @Bean
  public WebMvcConfigurer corsConfigurer() {
    return new WebMvcConfigurer() {
      @Override
      public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins(allowedOrigins.split(","))
            .allowedMethods("GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("Authorization", "Content-Type", "Accept",
                "X-Requested-With", "Cache-Control", "X-Correlation-ID", "Range")
            .exposedHeaders("Content-Disposition", "X-Correlation-ID", "Content-Length", "Accept-Ranges")
            .allowCredentials(true)
            .maxAge(3600);
      }
    };
  }
}
