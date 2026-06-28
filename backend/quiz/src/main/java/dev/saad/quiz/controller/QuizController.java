package dev.saad.quiz.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import dev.saad.quiz.model.EvaluateRequest;
import dev.saad.quiz.model.EvaluateResponse;
import dev.saad.quiz.model.QuizQuestion;
import dev.saad.quiz.model.QuizRequest;
import dev.saad.quiz.service.QuizService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * REST controller exposing the AI quiz endpoints.
 *
 * <pre>
 *   POST /api/quiz/generate  –  generate a set of quiz questions
 *   POST /api/quiz/evaluate  –  evaluate a single answer with AI feedback
 * </pre>
 */
@RestController
@RequestMapping("/api/quiz")
public class QuizController {

    private static final Logger log = LoggerFactory.getLogger(QuizController.class);

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    // ── POST /api/quiz/generate ───────────────────────────────────────────────

    /**
     * Generates a list of quiz questions using Gemini based on the scraped topic data.
     *
     * @param request quiz configuration (topic, section, count, difficulty, mode)
     * @return 200 with {@code List<QuizQuestion>}, or 400/500 with an error message
     */
    @PostMapping("/generate")
    public ResponseEntity<?> generate(@RequestBody QuizRequest request) {
        if (request.topic() == null || request.topic().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "topic is required."));
        }
        try {
            List<QuizQuestion> questions = quizService.generateQuestions(request);
            if (questions == null || questions.isEmpty()) {
                return ResponseEntity.internalServerError()
                        .body(Map.of("error", "AI returned no questions. Please try again."));
            }
            return ResponseEntity.ok(questions);
        } catch (JsonProcessingException e) {
            // JSON parse failure from the AI response — NOT a missing-data error
            log.error("Failed to parse AI response for topic '{}': {}", request.topic(), e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "AI returned malformed JSON. Raw parse error: " + e.getOriginalMessage()));
        } catch (IOException e) {
            log.warn("Topic data not found: {}", request.topic());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "No data found for topic: " + request.topic()
                                          + ". Make sure the scraper has been run."));
        } catch (Exception e) {
            log.error("Failed to generate quiz for topic '{}': {}", request.topic(), e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "AI quiz generation failed: " + e.getMessage()));
        }
    }

    // ── POST /api/quiz/evaluate ───────────────────────────────────────────────

    /**
     * Evaluates a candidate's answer against the question's key-points rubric.
     *
     * @param request evaluation data (question, keyPoints, userAnswer)
     * @return 200 with {@link EvaluateResponse}, or 500 with an error message
     */
    @PostMapping("/evaluate")
    public ResponseEntity<?> evaluate(@RequestBody EvaluateRequest request) {
        if (request.userAnswer() == null || request.userAnswer().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "userAnswer is required."));
        }
        try {
            EvaluateResponse response = quizService.evaluateAnswer(request);
            if (response == null) {
                return ResponseEntity.internalServerError()
                        .body(Map.of("error", "AI returned an empty evaluation. Please try again."));
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to evaluate answer: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "AI evaluation failed: " + e.getMessage()));
        }
    }
}

