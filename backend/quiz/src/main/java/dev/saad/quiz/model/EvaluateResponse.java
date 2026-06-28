package dev.saad.quiz.model;

/**
 * AI evaluation result for a single answer.
 *
 * @param verdict  "correct", "partial", or "incorrect"
 * @param score    quality score 0–100 (100 = perfect, 0 = completely wrong)
 * @param feedback 2–3 sentence explanation of the verdict from Gemini
 */
public record EvaluateResponse(
        String verdict,
        int    score,
        String feedback
) {}

