package com.healthcare.auth.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String BEARER_AUTH = "BearerAuth";
    private static final String CONTACT_NAME = "Ripan Baidya";
    private static final String CONTACT_EMAIL = "official.ripanbaidya@gmail.com";
    private static final String LICENSE_NAME = "Apache 2.0";
    private static final String LICENSE_URL = "https://www.apache.org/licenses/LICENSE-2.0.html";

    @Value("${info.app.name}")
    private String name;

    @Value("${info.app.version}")
    private String version;

    @Value("${info.app.description}")
    private String description;

    @Bean
    public OpenAPI configOpenAPI() {
        return new OpenAPI()
                .info(buildInfo())
                .components(buildSecurityComponents())
                .addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH));
    }

    private Info buildInfo() {
        return new Info()
                .title(name)
                .version(version)
                .description(description)
                .contact(new Contact()
                        .name(CONTACT_NAME)
                        .email(CONTACT_EMAIL))
                .license(new License()
                        .name(LICENSE_NAME)
                        .url(LICENSE_URL));
    }

    private Components buildSecurityComponents() {
        return new Components()
                .addSecuritySchemes(BEARER_AUTH, new SecurityScheme()
                        .name("Authorization")
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("JWT Bearer token authentication"));
    }
}