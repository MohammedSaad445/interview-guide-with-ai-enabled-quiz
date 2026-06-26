package dev.saad.webscraper.json;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import dev.saad.webscraper.model.Book;
import dev.saad.webscraper.model.QuestionAnswer;
import dev.saad.webscraper.model.Section;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.List;

/**
 * Exports scraped Book data to JSON files consumed by the React website.
 *
 * <p>Output layout (relative to working dir):</p>
 * <pre>
 *   frontend/public/data/index.json          – array of all topic summaries
 *   frontend/public/data/{slug}.json         – full topic data (sections + Q&As)
 *   frontend/public/pdfs/{filename}.pdf      – copy of generated PDF
 * </pre>
 */
public class JsonExporter {

    private static final Logger log = LoggerFactory.getLogger(JsonExporter.class);

    // Paths are relative to backend/scraper/ working directory
    private static final String DATA_DIR   = "../../frontend/public/data";
    private static final String PDFS_DIR   = "../../frontend/public/pdfs";
    private static final String OUTPUT_DIR = "output";

    private final ObjectMapper mapper;

    public JsonExporter() {
        mapper = new ObjectMapper();
        mapper.enable(SerializationFeature.INDENT_OUTPUT);
    }

    // =========================================================================
    // Public API
    // =========================================================================

    public void exportAllBooks(List<Book> books) {
        if (books == null || books.isEmpty()) {
            log.warn("JsonExporter: no books to export.");
            return;
        }

        new File(DATA_DIR).mkdirs();
        new File(PDFS_DIR).mkdirs();

        ArrayNode indexArr = mapper.createArrayNode();

        for (Book book : books) {
            try {
                String slug   = slugify(book.getTopicName());
                int    totalQ = book.getSections().stream()
                        .mapToInt(s -> s.getQuestionAnswers().size()).sum();

                // ── Write per-topic JSON ──────────────────────────────────────
                File topicFile = new File(DATA_DIR, slug + ".json");
                mapper.writeValue(topicFile, buildTopicNode(book, slug));
                log.info("  [JSON] Exported: {}", topicFile.getName());

                // ── Copy PDF if it exists ──────────────────────────────────────
                File srcPdf = new File(OUTPUT_DIR, book.getFileName());
                if (srcPdf.exists()) {
                    Files.copy(srcPdf.toPath(),
                            new File(PDFS_DIR, book.getFileName()).toPath(),
                            StandardCopyOption.REPLACE_EXISTING);
                    log.info("  [PDF]  Copied: {}", book.getFileName());
                }

                // ── Add summary entry to index ────────────────────────────────
                ObjectNode entry = mapper.createObjectNode();
                entry.put("topicName",    book.getTopicName());
                entry.put("slug",         slug);
                entry.put("sectionCount", book.getSections().size());
                entry.put("questionCount", totalQ);
                entry.put("pdfFile",      book.getFileName());
                indexArr.add(entry);

            } catch (IOException e) {
                log.error("  [JSON] Failed to export '{}': {}", book.getTopicName(), e.getMessage());
            }
        }

        // ── Write index.json ──────────────────────────────────────────────────
        try {
            mapper.writeValue(new File(DATA_DIR, "index.json"), indexArr);
            log.info("  [JSON] index.json written ({} entries).", books.size());
        } catch (IOException e) {
            log.error("  [JSON] Failed to write index.json: {}", e.getMessage());
        }
    }

    // =========================================================================
    // Builders
    // =========================================================================

    private ObjectNode buildTopicNode(Book book, String slug) {
        ObjectNode node = mapper.createObjectNode();
        node.put("topicName", book.getTopicName());
        node.put("slug",      slug);
        node.put("topicUrl",  book.getTopicUrl() != null ? book.getTopicUrl() : "");
        node.put("pdfFile",   book.getFileName());

        ArrayNode sectionsArr = mapper.createArrayNode();
        for (Section sec : book.getSections()) {
            ObjectNode secNode = mapper.createObjectNode();
            secNode.put("title", sec.getTitle());
            secNode.put("slug",  slugify(sec.getTitle()));
            secNode.put("url",   sec.getUrl() != null ? sec.getUrl() : "");

            ArrayNode qasArr = mapper.createArrayNode();
            for (QuestionAnswer qa : sec.getQuestionAnswers()) {
                ObjectNode qaNode = mapper.createObjectNode();
                qaNode.put("question", qa.getQuestion() != null ? qa.getQuestion() : "");
                qaNode.put("answer",   qa.getAnswer()   != null ? qa.getAnswer()   : "");

                ArrayNode codeArr = mapper.createArrayNode();
                if (qa.getCodeBlocks() != null) {
                    qa.getCodeBlocks().forEach(codeArr::add);
                }
                qaNode.set("codeBlocks", codeArr);
                qasArr.add(qaNode);
            }
            secNode.set("questionAnswers", qasArr);
            sectionsArr.add(secNode);
        }
        node.set("sections", sectionsArr);
        return node;
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    private static String slugify(String text) {
        if (text == null || text.isBlank()) return "section";
        return text.trim()
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
    }
}

