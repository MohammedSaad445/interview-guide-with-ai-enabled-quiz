package dev.saad.quiz;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the Interview Guide Quiz backend.
 *
 * <p>This Spring Boot application serves two things:</p>
 * <ol>
 *   <li>REST API at {@code /api/quiz/**} — powered by Spring AI (GPT-4o) to generate
 *       and evaluate quiz questions from the scraped interview data.</li>
 *   <li>The bundled React frontend (Vite build) as static resources from
 *       {@code src/main/resources/static/}.</li>
 * </ol>
 *
 * <p>Run with: {@code mvn spring-boot:run} or {@code java -jar target/interview-guide-quiz-1.0.0.jar}</p>
 * <p>Then open: <a href="http://localhost:8080">http://localhost:8080</a></p>
 */
@SpringBootApplication
public class QuizApplication {

    public static void main(String[] args) {
        SpringApplication.run(QuizApplication.class, args);
    }
}
