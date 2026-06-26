package dev.saad.quiz.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.saad.quiz.model.EvaluateRequest;
import dev.saad.quiz.model.EvaluateResponse;
import dev.saad.quiz.model.QuizQuestion;
import dev.saad.quiz.model.QuizRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

/**
 * Core service that orchestrates AI-powered quiz generation and answer evaluation
 * using Spring AI's {@link ChatClient} backed by GPT-4o.
 *
 * <h3>Generation flow</h3>
 * <ol>
 *   <li>{@link DataLoaderService} samples up to N Q&amp;A pairs from the scraped JSON.</li>
 *   <li>A structured prompt is sent to GPT-4o asking it to generate quiz questions.</li>
 *   <li>Spring AI's {@code BeanOutputConverter} deserialises the JSON response directly
 *       into {@code List<QuizQuestion>}.</li>
 * </ol>
 *
 * <h3>Evaluation flow</h3>
 * <ol>
 *   <li>The question, its key-points rubric, and the user's answer are sent to GPT-4o.</li>
 *   <li>GPT-4o returns a verdict / score / feedback JSON that is mapped to
 *       {@link EvaluateResponse}.</li>
 * </ol>
 */
@Service
public class QuizService {

    private static final Logger log = LoggerFactory.getLogger(QuizService.class);

    private final ChatClient        chatClient;
    private final DataLoaderService dataLoaderService;
    private final ObjectMapper      objectMapper;

    public QuizService(ChatClient.Builder builder,
                       DataLoaderService dataLoaderService,
                       ObjectMapper objectMapper) {
        this.chatClient        = builder.build();
        this.dataLoaderService = dataLoaderService;
        this.objectMapper      = objectMapper;
    }

    // =========================================================================
    //  Quiz Generation
    // =========================================================================

    /**
     * Generates a list of quiz questions for the given request.
     *
     * @param request quiz parameters (topic, section, count, difficulty, mode)
     * @return list of AI-generated {@link QuizQuestion} objects
     * @throws IOException if the topic data file cannot be read
     */
    public List<QuizQuestion> generateQuestions(QuizRequest request) throws IOException {

        String context = dataLoaderService.loadContext(request.topic(), request.section());
        boolean isMcq  = "mcq".equalsIgnoreCase(request.mode());

        log.info("Generating {} {} {} questions for topic='{}' section='{}'",
                request.questionCount(), request.difficulty(),
                request.mode(), request.topic(), request.section());

        String systemPrompt = """
                You are a technical interview quiz generator specialising in software engineering topics.
                Your job is to create quiz questions that genuinely test a candidate's understanding.
                You MUST return only valid JSON — no markdown, no code fences, no extra text.
                """;

        String userPrompt = isMcq ? buildMcqPrompt(request, context)
                                  : buildFreeTextPrompt(request, context);

        // Use content() to get raw text, then parse manually.
        // This avoids the Spring AI BeanOutputConverter silently returning null when
        // GPT wraps its response in markdown code fences (```json ... ```).
        String raw = chatClient.prompt()
                .system(systemPrompt)
                .user(userPrompt)
                .call()
                .content();

        log.info("Raw AI response for generate:\n{}", raw);  // INFO so it's always visible

        if (raw == null || raw.isBlank()) {
            throw new IllegalStateException("AI returned an empty response for quiz generation.");
        }

        String json = extractJson(raw);
        List<QuizQuestion> questions = objectMapper.readValue(json, new TypeReference<List<QuizQuestion>>() {});

        if (questions == null) {
            throw new IllegalStateException("AI response parsed to null – raw content was: " + raw);
        }

        log.info("Generated {} questions successfully.", questions.size());
        return questions;
    }

    private String buildMcqPrompt(QuizRequest req, String context) {
        return """
                Based on the following %s interview study material, generate exactly %d %s-level \
                multiple-choice questions.

                Study material:
                %s

                Return a JSON array containing exactly %d objects. Each object MUST have:
                - "question"     : a clear, specific question string
                - "options"      : array of exactly 4 distinct answer choices (strings); only one is correct
                - "correctIndex" : integer 0–3 indicating which option is correct (0 = first option)
                - "keyPoints"    : array of 2–4 key concepts that a correct answer should demonstrate

                Rules:
                • Questions must test genuine understanding, not trivial recall.
                • All 4 options must be plausible; avoid obviously wrong distractors.
                • Difficulty level "%s" should be reflected in question depth.

                Return ONLY the JSON array.
                """.formatted(req.topic(), req.questionCount(), req.difficulty(),
                              context, req.questionCount(), req.difficulty());
    }

    private String buildFreeTextPrompt(QuizRequest req, String context) {
        return """
                Based on the following %s interview study material, generate exactly %d %s-level \
                open-ended questions that require explanation and deep understanding.

                Study material:
                %s

                Return a JSON array containing exactly %d objects. Each object MUST have:
                - "question"     : a thought-provoking open-ended question (avoid yes/no questions)
                - "options"      : null
                - "correctIndex" : null
                - "keyPoints"    : array of 3–5 key points that a comprehensive answer should cover

                Rules:
                • Questions should require candidates to explain concepts, not just name them.
                • Difficulty level "%s" should be reflected in question complexity.

                Return ONLY the JSON array.
                """.formatted(req.topic(), req.questionCount(), req.difficulty(),
                              context, req.questionCount(), req.difficulty());
    }

    // =========================================================================
    //  Answer Evaluation
    // =========================================================================

    /**
     * Evaluates a candidate's answer against the question's key-points rubric.
     *
     * @param request evaluation request containing question, key points and user answer
     * @return {@link EvaluateResponse} with verdict, score (0–100), and feedback
     */
    public EvaluateResponse evaluateAnswer(EvaluateRequest request) {

        log.debug("Evaluating answer for question: {}", request.question());

        String keyPointsText = (request.keyPoints() != null && !request.keyPoints().isEmpty())
                ? "- " + String.join("\n- ", request.keyPoints())
                : "- Demonstrate understanding of the concept.";

        String systemPrompt = """
                You are a fair and constructive technical interviewer evaluating a candidate's answer.
                Base your evaluation strictly on the provided key concepts rubric.
                You MUST return only valid JSON — no markdown, no code fences, no extra text.
                """;

        String userPrompt = """
                Question: %s

                Key concepts a correct answer should cover:
                %s

                Candidate's answer: %s

                Evaluate the answer and return a JSON object with exactly these fields:
                - "verdict"  : one of "correct", "partial", or "incorrect"
                - "score"    : integer 0–100 reflecting answer quality
                               (90–100 = excellent, 70–89 = good, 50–69 = partial,
                                25–49 = incomplete, 0–24 = incorrect/irrelevant)
                - "feedback" : 2–3 sentences explaining the verdict, what was done well,
                               and (if applicable) what key concepts were missing

                Return ONLY the JSON object.
                """.formatted(request.question(), keyPointsText, request.userAnswer());

        String raw = chatClient.prompt()
                .system(systemPrompt)
                .user(userPrompt)
                .call()
                .content();

        log.info("Raw AI response for evaluate:\n{}", raw);

        if (raw == null || raw.isBlank()) {
            throw new RuntimeException("AI returned an empty response for answer evaluation.");
        }

        try {
            String json = extractJson(raw);
            EvaluateResponse response = objectMapper.readValue(json, EvaluateResponse.class);
            if (response == null) {
                throw new RuntimeException("AI response parsed to null – raw content was: " + raw);
            }
            log.debug("Evaluation result: verdict={} score={}", response.verdict(), response.score());
            return response;
        } catch (IOException e) {
            throw new RuntimeException("Failed to parse evaluation response from AI: " + e.getMessage(), e);
        }
    }

    // =========================================================================
    //  JSON extraction utility
    // =========================================================================

    /**
     * Strips markdown code fences (e.g. {@code ```json ... ```} or {@code ``` ... ```})
     * and any leading/trailing whitespace from the raw AI response, returning only the
     * bare JSON string.
     *
     * <p>GPT-4o occasionally wraps its output in code fences despite being instructed
     * not to.  This method normalises such output so that Jackson can always parse it.</p>
     */
    private static String extractJson(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("AI response is null or blank — nothing to parse.");
        }
        String trimmed = raw.strip();
        // Strip ```json ... ``` or ``` ... ```
        if (trimmed.startsWith("```")) {
            int firstNewline = trimmed.indexOf('\n');
            if (firstNewline != -1) {
                trimmed = trimmed.substring(firstNewline + 1).strip();
            }
            if (trimmed.endsWith("```")) {
                trimmed = trimmed.substring(0, trimmed.lastIndexOf("```")).strip();
            }
        }
        if (trimmed.isBlank()) {
            throw new IllegalArgumentException(
                    "AI response contained only code fences with no JSON content. Raw: " + raw);
        }
        return trimmed;
    }
}

