package dev.saad.quiz.model;

import java.util.List;

/**
 * Incoming request payload for answer evaluation.
 *
 * @param question   the original quiz question text
 * @param keyPoints  rubric key points generated alongside the question
 * @param userAnswer the candidate's answer (MCQ option text or free-text string)
 */
public record EvaluateRequest(
        String       question,
        List<String> keyPoints,
        String       userAnswer
) {}

