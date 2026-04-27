package com.healthcare.feedback.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class OpenApiConfig {

    @Value("${info.app.name}")
    private String name;

    @Value("${info.app.version}")
    private String version;

    @Value("${info.app.description}")
    private String description;

    private static final String BEARER_AUTH = "BearerAuth";

    @Bean
    public OpenAPI configOpenAPI() {
        Info info = new Info()
                .title("LuneCare - " + name)
                .version(version)
                .description(description)
                .contact(new Contact()
                        .name("Ripan Baidya")
                        .email("official.ripanbaidya@gmail.com"))
                .license(new License()
                        .name("Apache 2.0")
                        .url("https://www.apache.org/licenses/LICENSE-2.0.html"));

        return new OpenAPI()
                .info(info)
                .components(createComponents())
                .addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH));
    }

    private Components createComponents() {
        return new Components()
                .addSecuritySchemes(BEARER_AUTH, new SecurityScheme()
                        .name("Authorization")
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("JWT Bearer token authentication"));
    }
}
