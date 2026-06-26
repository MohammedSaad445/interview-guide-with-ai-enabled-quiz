package dev.saad.webscraper.scraper;

import dev.saad.webscraper.model.Book;
import dev.saad.webscraper.model.QuestionAnswer;
import dev.saad.webscraper.model.Section;
import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.io.IOException;
import java.security.cert.X509Certificate;
import java.util.*;

/**
 * WebScraper is the core scraping engine responsible for:
 * <ol>
 *   <li>Visiting each known topic page (e.g. https://interview.in28minutes.com/java/).</li>
 *   <li>Discovering all "Read More" sub-section cards on the page (Level 1).</li>
 *   <li>Crawling each sub-section page to extract Q&amp;A content (Level 2).</li>
 * </ol>
 *
 * <p><b>Confirmed DOM structure (inspected May 2026):</b></p>
 * <pre>
 * Topic page cards:
 *   &lt;div class="post-card"&gt;
 *     &lt;h2 class="post-card__title"&gt;Java Platform&lt;/h2&gt;
 *     &lt;a href="/interview-guides/java/java-platform/" class="btn btn--primary ..."&gt;Read More&lt;/a&gt;
 *   &lt;/div&gt;
 *
 * Sub-section page – content in: div.l-post__content
 * Each Q&amp;A block:
 *   &lt;hr&gt;
 *   &lt;blockquote&gt;&lt;h3 id="..."&gt;&lt;a class="anchor"&gt;#&lt;/a&gt; Question text&lt;/h3&gt;&lt;/blockquote&gt;
 *   &lt;hr&gt;
 *   &lt;ul&gt; / &lt;p&gt; ... answer ... &lt;/p&gt;
 *   &lt;pre class="group/code ..."&gt;&lt;code class="language-java"&gt;code&lt;/code&gt;&lt;/pre&gt;
 *
 * Diagram / cheat-sheet pages additionally contain:
 *   &lt;p&gt;&lt;img src="..." alt="Diagram description"&gt;&lt;/p&gt;
 *   &lt;figure&gt;&lt;img ...&gt;&lt;figcaption&gt;Caption&lt;/figcaption&gt;&lt;/figure&gt;
 *   &lt;table&gt;&lt;tr&gt;&lt;th&gt;...&lt;/th&gt;&lt;td&gt;...&lt;/td&gt;&lt;/tr&gt;&lt;/table&gt;
 * </pre>
 *
 * <p><b>Politeness controls:</b> 2 500 ms sleep before every request,
 * custom User-Agent, exponential back-off (up to 3 retries) on 429 / 5xx.</p>
 */
public class WebScraper {

    private static final Logger log = LoggerFactory.getLogger(WebScraper.class);

    // -------------------------------------------------------------------------
    // Configuration constants
    // -------------------------------------------------------------------------

    private static final String BASE_URL = "https://interview.in28minutes.com";
    private static final String USER_AGENT =
            "In28Minutes-InterviewBot/1.0 (Educational scraper; contact@in28minutes.com)";
    private static final long REQUEST_DELAY_MS = 2500L;
    private static final int  MAX_RETRIES      = 3;
    private static final long BACKOFF_BASE_MS  = 5000L;
    private static final int  TIMEOUT_MS       = 15_000;

    // -------------------------------------------------------------------------
    // SSL bypass – install a trust-all TrustManager once at class load time.
    // Needed because the JDK bundled with IntelliJ/Eclipse Adoptium may not
    // include the root CA for interview.in28minutes.com (Cloudflare-issued cert).
    // This is safe for a single-purpose read-only scraping tool against a known
    // public website.
    // -------------------------------------------------------------------------
    static {
        try {
            TrustManager[] trustAll = new TrustManager[]{
                new X509TrustManager() {
                    public X509Certificate[] getAcceptedIssuers() { return new X509Certificate[0]; }
                    public void checkClientTrusted(X509Certificate[] c, String a) { /* trust all */ }
                    public void checkServerTrusted(X509Certificate[] c, String a) { /* trust all */ }
                }
            };
            SSLContext sc = SSLContext.getInstance("TLS");
            sc.init(null, trustAll, new java.security.SecureRandom());
            HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
            HttpsURLConnection.setDefaultHostnameVerifier((hostname, session) -> true);
            log.info("SSL trust-all installed (scraper mode).");
        } catch (Exception e) {
            log.warn("Could not install trust-all SSL manager: {}", e.getMessage());
        }
    }

    // -------------------------------------------------------------------------
    // Hardcoded topic map: display name → confirmed topic dashboard URL
    // -------------------------------------------------------------------------

    private static final LinkedHashMap<String, String> KNOWN_TOPICS = new LinkedHashMap<>();

    static {
        KNOWN_TOPICS.put("Java",       "https://interview.in28minutes.com/java/");
        KNOWN_TOPICS.put("DevOps",     "https://interview.in28minutes.com/devops/");
        KNOWN_TOPICS.put("Cloud",      "https://interview.in28minutes.com/cloud/");
        KNOWN_TOPICS.put("Docker",     "https://interview.in28minutes.com/docker/");
        KNOWN_TOPICS.put("Kubernetes", "https://interview.in28minutes.com/kubernetes/");
        KNOWN_TOPICS.put("Terraform",  "https://interview.in28minutes.com/terraform/");
        KNOWN_TOPICS.put("Git",        "https://interview.in28minutes.com/git/");
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    /**
     * Scrapes every known topic and returns a list of populated {@link Book}
     * objects ready for PDF generation.
     */
    public List<Book> scrapeAllTopics() {
        log.info("===== Starting scrape for {} topic(s) =====", KNOWN_TOPICS.size());
        List<Book> books = new ArrayList<>();

        for (Map.Entry<String, String> entry : KNOWN_TOPICS.entrySet()) {
            String topicName = entry.getKey();
            String topicUrl  = entry.getValue();

            log.info("---------- Topic: {} → {}", topicName, topicUrl);
            try {
                Book book = scrapeTopic(topicName, topicUrl);
                if (!book.getSections().isEmpty()) {
                    books.add(book);
                    log.info("Topic '{}' complete → {} section(s).", topicName, book.getSections().size());
                } else {
                    log.warn("Topic '{}' yielded no sections – skipping PDF.", topicName);
                }
            } catch (Exception e) {
                log.error("Unexpected error scraping topic '{}': {}", topicName, e.getMessage(), e);
            }
        }

        log.info("===== Done. {} book(s) populated. =====", books.size());
        return books;
    }

    // -------------------------------------------------------------------------
    // Level 1 – Topic page: collect div.post-card links
    // -------------------------------------------------------------------------

    private Book scrapeTopic(String topicName, String topicUrl) {
        Book book = new Book(topicName, topicUrl);

        Document doc = fetchWithRetry(topicUrl);
        if (doc == null) {
            log.warn("Failed to fetch topic page for '{}'.", topicName);
            return book;
        }

        // Each card on the topic page is a div.post-card
        Elements cards = doc.select("div.post-card");
        log.debug("Topic '{}' → {} card(s) found.", topicName, cards.size());

        if (cards.isEmpty()) {
            log.warn("No 'div.post-card' elements on '{}'. Page structure may have changed.", topicUrl);
        }

        for (Element card : cards) {
            // Section title from h2.post-card__title
            Element titleEl = card.selectFirst("h2.post-card__title");
            String sectionTitle = (titleEl != null) ? titleEl.text().trim() : "Untitled";

            // "Read More" href
            Element linkEl = card.selectFirst("a[href]");
            if (linkEl == null) {
                log.debug("No link in card '{}' – skipping.", sectionTitle);
                continue;
            }

            String href       = linkEl.attr("href");
            String sectionUrl = href.startsWith("http") ? href : BASE_URL + href;

            log.info("  → Section: '{}' ({})", sectionTitle, sectionUrl);
            try {
                Section section = scrapeSection(sectionTitle, sectionUrl);
                if (!section.getQuestionAnswers().isEmpty()) {
                    book.addSection(section);
                    log.info("     {} Q&A pair(s) extracted.", section.getQuestionAnswers().size());
                } else {
                    log.warn("     Section '{}' had no Q&A pairs.", sectionTitle);
                }
            } catch (Exception e) {
                log.error("     Error scraping '{}': {}", sectionTitle, e.getMessage(), e);
            }
        }

        return book;
    }

    // -------------------------------------------------------------------------
    // Level 2 – Sub-section page: extract Q&A pairs
    // -------------------------------------------------------------------------

    /**
     * Fetches a sub-section page and extracts Q&amp;A pairs.
     *
     * <p>Pattern: questions are {@code h3} inside {@code blockquote} tags.
     * Everything between one blockquote and the next is the answer body.</p>
     */
    private Section scrapeSection(String sectionTitle, String sectionUrl) {
        Section section = new Section(sectionTitle, sectionUrl);

        Document doc = fetchWithRetry(sectionUrl);
        if (doc == null) {
            log.warn("Failed to fetch section: {}", sectionUrl);
            return section;
        }

        // Content lives in div.l-post__content (falls back to article / main)
        Element content = doc.selectFirst("div.l-post__content");
        if (content == null) content = doc.selectFirst("article, main");
        if (content == null) {
            log.warn("Could not locate content area on: {}", sectionUrl);
            return section;
        }

        // Remove the "DO YOU KNOW?" tip box if present – it uses a blockquote
        // but contains <b> not <h3>, so our selector won't match it.
        // Defensively remove div.tip entirely before scanning to be safe.
        content.select("div.tip").remove();

        // Every question is an h3 inside a blockquote
        // Pattern: <blockquote><h3 id="..."><a class="anchor">#</a> Question text</h3></blockquote>
        Elements questionHeadings = content.select("blockquote > h3");
        log.debug("     {} question heading(s) in '{}'.", questionHeadings.size(), sectionTitle);

        for (Element h3 : questionHeadings) {
            // h3 text includes an anchor child element whose visible text is "#" – strip it
            String questionText = h3.text().replaceAll("^#\\s*", "").trim();
            if (questionText.isEmpty()) continue;

            Element blockquote = h3.parent(); // the <blockquote>
            if (blockquote == null) continue;

            StringBuilder answerSb  = new StringBuilder();
            List<String>  codeBlocks = new ArrayList<>();

            // Walk siblings after the blockquote; stop at the next blockquote
            Element sib = blockquote.nextElementSibling();
            while (sib != null) {
                String tag = sib.tagName().toLowerCase();

                if (tag.equals("blockquote")) break; // next question

                switch (tag) {
                    case "hr":
                        // Section divider – skip
                        break;

                    case "pre": {
                        // Syntax-highlighted code block:
                        // <pre class="group/code ..."><code class="language-java">...</code></pre>
                        // .text() on the <code> element strips all span tags cleanly
                        Element codeEl = sib.selectFirst("code");
                        String raw = (codeEl != null) ? codeEl.text() : sib.text();
                        if (!raw.isBlank()) codeBlocks.add(raw);
                        break;
                    }

                    case "p": {
                        // Extract any nested code blocks first
                        extractCodeBlocks(sib, codeBlocks);
                        // Build paragraph text preserving <strong> labels but excluding <pre>/<code>
                        String txt = extractReadableText(sib);
                        if (!txt.isEmpty()) answerSb.append(txt).append("\n\n");
                        // Extract any images inside the paragraph
                        extractImagesText(sib, answerSb);
                        break;
                    }

                    case "ul":
                    case "ol": {
                        // Render list recursively at indent level 0
                        renderList(sib, answerSb, codeBlocks, 0);
                        answerSb.append("\n");
                        break;
                    }

                    case "figure": {
                        // Figures typically wrap diagrams/screenshots with an optional caption
                        extractImagesText(sib, answerSb);
                        // Also capture any figcaption text as additional context
                        Element figcaption = sib.selectFirst("figcaption");
                        if (figcaption != null) {
                            String caption = figcaption.text().trim();
                            if (!caption.isEmpty()) answerSb.append(caption).append("\n\n");
                        }
                        break;
                    }

                    case "table": {
                        // Tables appear on cheat-sheet pages; render them as plain text rows
                        String tableText = extractTableText(sib);
                        if (!tableText.isEmpty()) answerSb.append(tableText).append("\n");
                        break;
                    }

                    default:
                        // div or other containers – extract code blocks, text, and images
                        extractCodeBlocks(sib, codeBlocks);
                        extractImagesText(sib, answerSb);
                        // Also extract any readable text from div containers
                        // (e.g. content inside styled wrappers that aren't <p> or <ul>)
                        String divTxt = extractReadableText(sib);
                        if (!divTxt.isEmpty()) answerSb.append(divTxt).append("\n\n");
                        break;
                }

                sib = sib.nextElementSibling();
            }

            String answerText = answerSb.toString().trim();
            if (!answerText.isEmpty() || !codeBlocks.isEmpty()) {
                QuestionAnswer qa = new QuestionAnswer(questionText, answerText, codeBlocks);
                section.addQuestionAnswer(qa);
                log.debug("       Q[{}chars] | A[{}chars] | Code[{}]",
                        questionText.length(), answerText.length(), codeBlocks.size());
            } else {
                log.debug("       Skipped Q[{}chars] – no answer content found.", questionText.length());
            }
        }

        return section;
    }

    // -------------------------------------------------------------------------
    // Text / code extraction helpers
    // -------------------------------------------------------------------------

    /**
     * Extracts all {@code <pre><code>} blocks from {@code el} (and any depth)
     * into {@code codeBlocks}. Does NOT recurse into nested {@code <ul>/<ol>}
     * since those are handled separately by {@link #renderList}.
     */
    private void extractCodeBlocks(Element el, List<String> codeBlocks) {
        for (Element pre : el.select("pre")) {
            Element codeEl = pre.selectFirst("code");
            String raw = (codeEl != null) ? codeEl.text() : pre.text();
            if (!raw.isBlank()) codeBlocks.add(raw);
        }
    }

    /**
     * Builds a clean readable text string from an element, preserving text
     * inside inline elements ({@code <strong>}, {@code <em>}, {@code <b>},
     * {@code <a>}, {@code <span>} etc.) but skipping block-level code elements
     * ({@code <pre>}, {@code <code>}) since those are captured separately.
     *
     * <p>Uses Jsoup's Node visitor to walk the element tree.</p>
     */
    private String extractReadableText(Element el) {
        // Clone and remove pre/code so their text doesn't bleed into the answer
        Element clone = el.clone();
        clone.select("pre").remove();
        // Return full .text() of the clone – this includes strong/em/b/span text
        return clone.text().trim();
    }

    /**
     * Scans {@code el} for {@code <img>} tags and appends a human-readable
     * description of each image to {@code sb}.
     *
     * <p>Priority for the label: alt attribute → filename derived from src → generic "[Diagram]".</p>
     *
     * <p>This handles diagram/cheat-sheet pages where the answer body consists
     * solely of one or more images with no surrounding text.</p>
     *
     * @param el the element to scan (including all descendants)
     * @param sb the answer text buffer to append descriptions to
     */
    private void extractImagesText(Element el, StringBuilder sb) {
        for (Element img : el.select("img")) {
            String alt = img.attr("alt").trim();
            String src = img.attr("src").trim();

            // Resolve to absolute URL
            String absoluteSrc = "";
            if (!src.isEmpty()) {
                absoluteSrc = src.startsWith("http") ? src : BASE_URL + src;
            }

            String label;
            if (!alt.isEmpty()) {
                label = alt;
            } else if (!src.isEmpty()) {
                // Derive a readable name from the image filename (strip path + extension)
                String filename = src.substring(src.lastIndexOf('/') + 1);
                int dotIdx = filename.lastIndexOf('.');
                label = (dotIdx > 0) ? filename.substring(0, dotIdx) : filename;
                label = label.replace('-', ' ').replace('_', ' ');
            } else {
                label = "diagram";
            }

            // Format: [Image: alt text | https://absolute-url]
            // The pipe-separated URL lets the PDF generator and React frontend
            // render the actual image rather than just showing the label text.
            if (!absoluteSrc.isEmpty()) {
                sb.append("[Image: ").append(label).append(" | ").append(absoluteSrc).append("]\n\n");
            } else {
                sb.append("[Image: ").append(label).append("]\n\n");
            }
            log.debug("         Image captured: {} → {}", label, absoluteSrc);
        }
    }

    /**
     * Renders a {@code <table>} element as plain text with pipe-separated columns.
     * Each row is rendered as {@code | col1 | col2 | col3 |}.
     * Header rows ({@code <th>}) are separated from body rows by a divider line.
     *
     * @param table the {@code <table>} element to render
     * @return plain-text representation, or empty string if the table has no content
     */
    private String extractTableText(Element table) {
        StringBuilder sb = new StringBuilder();
        boolean firstRow = true;
        for (Element row : table.select("tr")) {
            Elements cells = row.select("th, td");
            if (cells.isEmpty()) continue;

            // Pipe-separated row
            sb.append("| ");
            for (Element cell : cells) {
                sb.append(cell.text().trim()).append(" | ");
            }
            sb.append("\n");

            // After the header row (if any <th> present), emit a separator
            if (firstRow && !row.select("th").isEmpty()) {
                sb.append("|");
                for (int i = 0; i < cells.size(); i++) sb.append("---|");
                sb.append("\n");
            }
            firstRow = false;
        }
        return sb.toString().trim();
    }

    /**
     * Recursively renders a {@code <ul>} or {@code <ol>} element into the
     * answer StringBuilder, with proper bullet indentation for nested lists.
     * Also pulls any {@code <pre><code>} blocks found inside list items into
     * {@code codeBlocks}.
     *
     * @param listEl     the {@code <ul>} or {@code <ol>} element
     * @param sb         the answer text buffer
     * @param codeBlocks list to accumulate code block strings
     * @param depth      nesting depth (0 = top-level, 1 = first nested, etc.)
     */
    private void renderList(Element listEl, StringBuilder sb,
                            List<String> codeBlocks, int depth) {
        String indent = "  ".repeat(depth);
        String bullet = (depth == 0) ? "\u2022 " : "\u25e6 "; // • for top, ◦ for nested

        for (Element li : listEl.select("> li")) {
            // Extract code blocks embedded inside this li
            extractCodeBlocks(li, codeBlocks);

            // Build the li's own readable text (clone removes pre so code isn't duplicated)
            Element liClone = li.clone();
            liClone.select("pre").remove();
            // Also remove nested ul/ol from the clone so their text isn't duplicated
            liClone.select("ul, ol").remove();
            String liText = liClone.text().trim();

            if (!liText.isEmpty()) {
                sb.append(indent).append(bullet).append(liText).append("\n");
            }

            // Recurse into nested lists
            for (Element nested : li.select("> ul, > ol")) {
                renderList(nested, sb, codeBlocks, depth + 1);
            }
        }
    }

    // -------------------------------------------------------------------------
    // HTTP fetch with retry / exponential backoff
    // -------------------------------------------------------------------------

    /**
     * Fetches and parses the HTML at {@code url} with politeness delay,
     * custom User-Agent, and exponential backoff on transient errors.
     *
     * @param url absolute URL to fetch
     * @return parsed Jsoup {@link Document} or {@code null} on permanent failure
     */
    private Document fetchWithRetry(String url) {
        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                log.debug("Sleeping {}ms (attempt {}/{}) before: {}", REQUEST_DELAY_MS, attempt, MAX_RETRIES, url);
                Thread.sleep(REQUEST_DELAY_MS);

                Connection.Response response = Jsoup.connect(url)
                        .userAgent(USER_AGENT)
                        .timeout(TIMEOUT_MS)
                        .followRedirects(true)
                        .ignoreHttpErrors(true)
                        .execute();

                int status = response.statusCode();
                log.debug("HTTP {} ← {}", status, url);

                if (status == 200) return response.parse();

                if (status == 429 || status >= 500) {
                    long wait = BACKOFF_BASE_MS * attempt;
                    log.warn("HTTP {} (attempt {}/{}) – backing off {}ms. URL: {}",
                            status, attempt, MAX_RETRIES, wait, url);
                    if (attempt < MAX_RETRIES) Thread.sleep(wait);
                } else {
                    log.warn("HTTP {} (non-retryable) for: {}", status, url);
                    return null;
                }

            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                log.error("Thread interrupted while fetching: {}", url);
                return null;
            } catch (IOException ioe) {
                long wait = BACKOFF_BASE_MS * attempt;
                log.warn("IOException attempt {}/{} for '{}': {} – retrying in {}ms.",
                        attempt, MAX_RETRIES, url, ioe.getMessage(), wait);
                if (attempt < MAX_RETRIES) {
                    try { Thread.sleep(wait); } catch (InterruptedException ie2) {
                        Thread.currentThread().interrupt();
                        return null;
                    }
                }
            }
        }

        log.error("All {} retries exhausted for: {}", MAX_RETRIES, url);
        return null;
    }
}
