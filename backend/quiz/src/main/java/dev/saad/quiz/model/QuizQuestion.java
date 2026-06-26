package dev.saad.quiz.model;

import java.util.List;

/**
 * A single quiz question returned by the AI.
 *
 * <p>For MCQ mode: {@code options} contains exactly 4 choices and
 * {@code correctIndex} (0–3) identifies the correct one.</p>
 * <p>For free-text mode: both {@code options} and {@code correctIndex} are null.</p>
 * <p>{@code keyPoints} is always populated and is used as the evaluation rubric
 * when grading a candidate's answer.</p>
 */
public record QuizQuestion(
        String       question,
        List<String> options,       // null for free-text mode
        Integer      correctIndex,  // null for free-text mode
        List<String> keyPoints      // rubric for evaluation
) {}

