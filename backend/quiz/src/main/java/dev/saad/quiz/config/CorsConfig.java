package dev.saad.quiz.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS configuration.
 *
 * <p>In production, the React frontend is bundled inside this Spring Boot JAR and
 * served from the same origin, so CORS is not needed.  This configuration exists
 * solely to enable the Vite dev-server (localhost:5173) to call the Spring Boot
 * backend (localhost:8080) during local development without browser CORS errors.</p>
 *
 * <p>The Vite dev-server also has a {@code /api} proxy configured in
 * {@code vite.config.js}, but keeping explicit CORS here avoids any race conditions
 * between the proxy and browser pre-flight requests.</p>
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")  // Vite dev server
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false);
    }
}

