package org.ssssy.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Exposes the OpenAPI / Swagger UI beans only when {@code app.swagger.enabled=true}.
 * In production this property defaults to {@code false}, effectively returning 404
 * for {@code /swagger-ui/**} and {@code /api-docs/**}.
 */
@Configuration
@ConditionalOnProperty(name = "app.swagger.enabled", havingValue = "true")
public class OpenApiConfig {

  @Bean
  public OpenAPI openAPI() {
    return new OpenAPI()
        .info(new Info()
            .title("SSSSY Backend API")
            .description("Syrian Soil Science Society Website API")
            .version("1.0.0"))
        .addSecurityItem(new SecurityRequirement().addList("Bearer"))
        .components(new Components()
            .addSecuritySchemes("Bearer",
                new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")));
  }
}
