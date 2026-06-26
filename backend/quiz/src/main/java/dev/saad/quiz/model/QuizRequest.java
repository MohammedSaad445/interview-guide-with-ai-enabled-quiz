package dev.saad.quiz.model;

/**
 * Incoming request payload for quiz generation.
 *
 * @param topic         topic slug, e.g. "java", "docker"
 * @param section       optional section slug; null / blank = use all sections
 * @param questionCount how many questions to generate (5–20)
 * @param difficulty    "easy", "medium", or "hard"
 * @param mode          "mcq" (multiple choice) or "freetext" (open-ended)
 */
public record QuizRequest(
        String topic,
        String section,
        int    questionCount,
        String difficulty,
        String mode
) {}

