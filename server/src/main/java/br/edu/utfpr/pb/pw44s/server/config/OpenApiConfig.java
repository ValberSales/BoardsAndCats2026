package br.edu.utfpr.pb.pw44s.server.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Insira o token JWT retornado no login para autenticar as requisições protegidas.")
                        )
                )
                .info(new Info()
                        .title("Boards & Cats API")
                        .version("1.0.0")
                        .description("API REST para o e-commerce de jogos de tabuleiro Boards & Cats. " +
                                     "Inclui gerenciamento de produtos, categorias, carrinho, pedidos, pagamentos e área administrativa.")
                        .contact(new Contact()
                                .name("Boards & Cats Team")
                                .email("support@boardscats.com")
                        )
                );
    }
}
