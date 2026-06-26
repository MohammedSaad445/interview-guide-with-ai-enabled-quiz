package dev.saad.quiz.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Loads scraped interview Q&amp;A data from the classpath and formats
 * a compact context string for the AI prompt.
 *
 * <p>Data files are placed on the classpath at {@code data/{topic}.json}
 * by the Maven Resources Plugin during the build.</p>
 *
 * <p>To keep the AI prompt within a manageable token budget, this service
 * randomly samples up to {@code quiz.context.max-questions-per-section}
 * Q&amp;A pairs and truncates each answer to 300 characters.</p>
 */
@Service
public class DataLoaderService {

    private static final Logger log = LoggerFactory.getLogger(DataLoaderService.class);

    private final ObjectMapper objectMapper;
    private final int          maxQuestionsPerSection;

    public DataLoaderService(
            ObjectMapper objectMapper,
            @Value("${quiz.context.max-questions-per-section:20}") int maxQuestionsPerSection) {
        this.objectMapper           = objectMapper;
        this.maxQuestionsPerSection = maxQuestionsPerSection;
    }

    /**
     * Loads topic data from {@code classpath:data/{topic}.json},
     * optionally filters to a specific section, samples up to the cap,
     * and returns a formatted string ready for inclusion in an AI prompt.
     *
     * @param topic   topic slug (e.g. "java", "docker")
     * @param section optional section slug; null / blank = all sections
     * @return formatted Q&amp;A context string
     * @throws IOException if the JSON file is not found or cannot be read
     */
    @SuppressWarnings("unchecked")
    public String loadContext(String topic, String section) throws IOException {

        ClassPathResource resource = new ClassPathResource("data/" + topic.toLowerCase() + ".json");
        if (!resource.exists()) {
            throw new IOException("No data file found for topic: " + topic);
        }

        Map<String, Object> topicData =
                objectMapper.readValue(resource.getInputStream(), Map.class);

        List<Map<String, Object>> sections =
                (List<Map<String, Object>>) topicData.get("sections");

        if (sections == null || sections.isEmpty()) {
            log.warn("No sections found for topic '{}'", topic);
            return "No content available for " + topic;
        }

        // ── Collect Q&A pairs (optionally filtered by section slug) ──────
        List<Map<String, Object>> qaPool = new ArrayList<>();
        for (Map<String, Object> sec : sections) {
            String sectionSlug = (String) sec.get("slug");
            if (section != null && !section.isBlank() && !section.equals(sectionSlug)) {
                continue;
            }
            List<Map<String, Object>> qas =
                    (List<Map<String, Object>>) sec.get("questionAnswers");
            if (qas != null) {
                qaPool.addAll(qas);
            }
        }

        if (qaPool.isEmpty()) {
            log.warn("No Q&As found for topic '{}' section '{}'", topic, section);
            return "No content available.";
        }

        // ── Shuffle & sample to stay within token budget ─────────────────
        Collections.shuffle(qaPool);
        List<Map<String, Object>> sampled =
                qaPool.subList(0, Math.min(maxQuestionsPerSection, qaPool.size()));

        log.debug("Loaded {} Q&As for topic='{}' section='{}'", sampled.size(), topic, section);

        // ── Format as numbered study material ────────────────────────────
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < sampled.size(); i++) {
            Map<String, Object> qa = sampled.get(i);

            String question = (String) qa.get("question");
            String answer   = (String) qa.get("answer");

            if (question == null || question.isBlank()) continue;

            if (answer == null) answer = "";
            // Truncate long answers to control token count
            if (answer.length() > 300) {
                answer = answer.substring(0, 300) + "...";
            }
            // Strip newlines and bullet characters for cleaner prompt embedding
            answer = answer.replace('\n', ' ').replaceAll("[•◦]", "-").trim();

            sb.append(i + 1).append(". Q: ").append(question.trim()).append("\n");
            sb.append("   A: ").append(answer).append("\n\n");
        }

        return sb.toString().trim();
    }
}

