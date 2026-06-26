package dev.saad.webscraper.pdf;

import dev.saad.webscraper.model.Book;
import dev.saad.webscraper.model.QuestionAnswer;
import dev.saad.webscraper.model.Section;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * PdfGenerator renders one premium-styled PDF book per {@link Book}.
 */
public class PdfGenerator {

    private static final Logger log = LoggerFactory.getLogger(PdfGenerator.class);
    private static final String OUTPUT_DIR = "output";

    // ── Colour palette ───────────────────────────────────────────────────────────
    private static final Color C_NAVY         = new Color(0x1E, 0x3A, 0x5F); // deep blue (cover/divider)
    private static final Color C_NAVY_LIGHT   = new Color(0x2B, 0x4E, 0x80);
    private static final Color C_ACCENT       = new Color(0x1A, 0x73, 0xE8); // Google-blue accent
    private static final Color C_ACCENT_LIGHT = new Color(0x42, 0x8E, 0xF5);
    private static final Color C_HIGHLIGHT    = new Color(0xF9, 0xAB, 0x00); // amber
    private static final Color C_CORAL        = new Color(0xE8, 0x4A, 0x4A); // coral Q bar
    private static final Color C_TEAL         = new Color(0x00, 0x89, 0x7B); // teal
    private static final Color C_WHITE        = new Color(0xFF, 0xFF, 0xFF);
    private static final Color C_OFF_WHITE    = new Color(0xF8, 0xF9, 0xFA);
    private static final Color C_Q_BG         = new Color(0xE8, 0xF0, 0xFE); // light blue Q bg
    private static final Color C_ANSWER_BG    = new Color(0xF8, 0xF9, 0xFA); // very light grey answer bg
    private static final Color C_LIGHT_GREY   = new Color(0xDA, 0xDC, 0xE0);
    private static final Color C_MID_GREY     = new Color(0xBD, 0xC1, 0xC6);
    private static final Color C_DARK_TEXT    = new Color(0x1A, 0x1A, 0x2E); // near-black
    private static final Color C_BODY_TEXT    = new Color(0x20, 0x27, 0x35); // dark body
    private static final Color C_MUTED        = new Color(0x5F, 0x63, 0x68);
    private static final Color C_CODE_BG      = new Color(0xF6, 0xF8, 0xFA); // GitHub-style light code bg
    private static final Color C_CODE_HEADER  = new Color(0xEB, 0xED, 0xF0);
    private static final Color C_CODE_TEXT    = new Color(0x24, 0x29, 0x2E); // dark code text
    private static final Color C_CODE_BORDER  = new Color(0xC9, 0xD1, 0xD9);
    private static final Color C_TOC_ODD      = new Color(0xF8, 0xF9, 0xFA);
    private static final Color C_TOC_EVEN     = new Color(0xF0, 0xF3, 0xF8);
    private static final Color C_CHAPTER_DIV  = new Color(0x1E, 0x3A, 0x5F); // keep cover/divider dark

    // ── Fonts ────────────────────────────────────────────────────────────────────
    private static final Font F_COVER_EYEBROW;
    private static final Font F_COVER_TITLE;
    private static final Font F_COVER_SUBTITLE;
    private static final Font F_COVER_META;
    private static final Font F_SECTION_DIV_TITLE;
    private static final Font F_SECTION_DIV_SUBTITLE;
    private static final Font F_TOC_HEADING;
    private static final Font F_TOC_CHAPTER;
    private static final Font F_TOC_ITEM;
    private static final Font F_TOC_COUNT;
    private static final Font F_TOC_NUM;
    private static final Font F_Q_LABEL;
    private static final Font F_Q_TEXT;
    private static final Font F_ANSWER;
    private static final Font F_ANSWER_STRONG;
    private static final Font F_BULLET_L1;
    private static final Font F_BULLET_L2;
    private static final Font F_CODE;
    private static final Font F_CODE_LANG;
    private static final Font F_FOOTER;
    private static final Font F_CHAPTER_BADGE;

    static {
        try {
            BaseFont bold   = BaseFont.createFont(BaseFont.HELVETICA_BOLD,    BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
            BaseFont normal = BaseFont.createFont(BaseFont.HELVETICA,         BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
            BaseFont oblq   = BaseFont.createFont(BaseFont.HELVETICA_OBLIQUE, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
            BaseFont boldob = BaseFont.createFont(BaseFont.HELVETICA_BOLDOBLIQUE, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
            BaseFont cour   = BaseFont.createFont(BaseFont.COURIER,           BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
            BaseFont courB  = BaseFont.createFont(BaseFont.COURIER_BOLD,      BaseFont.CP1252, BaseFont.NOT_EMBEDDED);

            F_COVER_EYEBROW       = new Font(oblq,   12, Font.ITALIC,  C_TEAL);
            F_COVER_TITLE         = new Font(bold,    58, Font.BOLD,    C_WHITE);
            F_COVER_SUBTITLE      = new Font(normal,  18, Font.NORMAL,  new Color(0xCC, 0xD6, 0xE8));
            F_COVER_META          = new Font(oblq,    10, Font.ITALIC,  new Color(0x88, 0x99, 0xBB));

            F_SECTION_DIV_TITLE   = new Font(bold,    28, Font.BOLD,    C_WHITE);
            F_SECTION_DIV_SUBTITLE= new Font(normal,  14, Font.NORMAL,  new Color(0xAA, 0xBB, 0xDD));

            F_TOC_HEADING         = new Font(bold,    22, Font.BOLD,    C_NAVY);
            F_TOC_CHAPTER         = new Font(bold,    10, Font.BOLD,    C_WHITE);
            F_TOC_ITEM            = new Font(normal,  11, Font.NORMAL,  C_DARK_TEXT);
            F_TOC_COUNT           = new Font(boldob,   9, Font.BOLDITALIC, C_ACCENT);
            F_TOC_NUM             = new Font(bold,    10, Font.BOLD,    C_WHITE);

            F_Q_LABEL             = new Font(bold,     9, Font.BOLD,    C_WHITE);
            F_Q_TEXT              = new Font(bold,    12, Font.BOLD,    C_DARK_TEXT);
            F_ANSWER              = new Font(normal,  11, Font.NORMAL,  C_BODY_TEXT);
            F_ANSWER_STRONG       = new Font(bold,    11, Font.BOLD,    C_DARK_TEXT);
            F_BULLET_L1           = new Font(normal,  11, Font.NORMAL,  C_BODY_TEXT);
            F_BULLET_L2           = new Font(normal,  10, Font.NORMAL,  new Color(0x4A, 0x5A, 0x6A));
            F_CODE                = new Font(cour,     9, Font.NORMAL,  C_CODE_TEXT);
            F_CODE_LANG           = new Font(courB,    8, Font.BOLD,    new Color(0x1A, 0x73, 0xE8));
            F_FOOTER              = new Font(normal,   8, Font.NORMAL,  C_MUTED);
            F_CHAPTER_BADGE       = new Font(bold,    10, Font.BOLD,    C_WHITE);

        } catch (Exception e) {
            throw new ExceptionInInitializerError("Font init failed: " + e.getMessage());
        }
    }

    // =========================================================================
    // Public API
    // =========================================================================

    public void generateAllBooks(List<Book> books) {
        if (books == null || books.isEmpty()) { log.warn("No books to generate."); return; }
        File outDir = new File(OUTPUT_DIR);
        if (!outDir.exists() && !outDir.mkdirs()) {
            log.error("Cannot create output dir: {}", outDir.getAbsolutePath()); return;
        }
        log.info("===== PDF generation: {} book(s) =====", books.size());
        int ok = 0;
        for (Book book : books) {
            try { generateBook(book, outDir); ok++; }
            catch (Exception e) { log.error("PDF failed for '{}': {}", book.getTopicName(), e.getMessage(), e); }
        }
        log.info("===== Done. {}/{} PDF(s) in '{}' =====", ok, books.size(), outDir.getAbsolutePath());
    }

    // =========================================================================
    // Per-book
    // =========================================================================

    private void generateBook(Book book, File outDir) throws IOException, DocumentException {
        File out = new File(outDir, book.getFileName());
        log.info("Generating: {}", out.getName());
        Document doc = new Document(PageSize.A4, 54, 48, 54, 70);
        PdfWriter writer = PdfWriter.getInstance(doc, new FileOutputStream(out));
        writer.setPageEvent(new FooterEvent(book.getTopicName()));
        doc.open();

        addCover(doc, writer, book);
        addTOC(doc, book);
        int chNum = 1;
        for (Section sec : book.getSections()) {
            addChapterDivider(doc, writer, sec, chNum);
            addChapterContent(doc, sec, chNum++);
        }

        doc.close();
        log.info("  Written: {} ({} KB)", out.getName(), out.length() / 1024);
    }

    // =========================================================================
    // Cover page  –  full dark canvas with layered shapes
    // =========================================================================

    private void addCover(Document doc, PdfWriter writer, Book book) throws DocumentException {
        Rectangle page = doc.getPageSize();
        float W = page.getWidth(), H = page.getHeight();
        PdfContentByte cb = writer.getDirectContentUnder();

        cb.saveState();

        // Base fill – dark navy
        cb.setColorFill(C_NAVY);
        cb.rectangle(0, 0, W, H);
        cb.fill();

        // Large decorative circle top-right (very subtle)
        cb.setColorFill(new Color(0x1E, 0x25, 0x4A));
        cb.circle(W + 20, H - 30, 200);
        cb.fill();

        // Second circle mid-left
        cb.setColorFill(new Color(0x10, 0x18, 0x35));
        cb.circle(-60, H * 0.4f, 220);
        cb.fill();

        // Bottom gradient panel – slightly lighter navy
        cb.setColorFill(new Color(0x0E, 0x13, 0x28));
        cb.rectangle(0, 0, W, H * 0.28f);
        cb.fill();

        // Left accent bar (teal)
        cb.setColorFill(C_TEAL);
        cb.rectangle(0, 0, 7f, H);
        cb.fill();

        // Bottom accent bar (amber / highlight)
        cb.setColorFill(C_HIGHLIGHT);
        cb.rectangle(0, 0, W, 7f);
        cb.fill();

        // Top thin line (accent blue)
        cb.setColorFill(C_ACCENT_LIGHT);
        cb.rectangle(0, H - 5f, W, 5f);
        cb.fill();

        // Small decorative square top-right corner
        cb.setColorFill(C_HIGHLIGHT);
        cb.rectangle(W - 40, H - 5f, 40, 5f);
        cb.fill();

        cb.restoreState();

        // ── Content ──
        float topPad = H * 0.28f;
        addSpacer(doc, topPad / 14f);

        // Eyebrow
        Paragraph eyebrow = new Paragraph("in28minutes.com  ·  Interview Preparation Series", F_COVER_EYEBROW);
        eyebrow.setAlignment(Element.ALIGN_CENTER);
        doc.add(eyebrow);

        addSpacer(doc, 1.2f);

        // Thin teal divider
        doc.add(centeredDivider(W * 0.45f, C_TEAL, 1.5f));

        addSpacer(doc, 0.8f);

        // Main topic title
        Paragraph title = new Paragraph(book.getTopicName().toUpperCase(), F_COVER_TITLE);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(4f);
        doc.add(title);

        // Subtitle line
        Paragraph subtitle = new Paragraph("Interview Guide", F_COVER_SUBTITLE);
        subtitle.setAlignment(Element.ALIGN_CENTER);
        doc.add(subtitle);

        addSpacer(doc, 1.8f);

        // Amber divider
        doc.add(centeredDivider(W * 0.3f, C_HIGHLIGHT, 2f));

        addSpacer(doc, 2f);

        // Stats row
        int totalQ = book.getSections().stream().mapToInt(s -> s.getQuestionAnswers().size()).sum();
        String meta = String.format(
                "%d Chapters   \u00b7   %d Questions & Answers   \u00b7   %s",
                book.getSections().size(), totalQ,
                LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM yyyy")));
        Paragraph metaPara = new Paragraph(meta, F_COVER_META);
        metaPara.setAlignment(Element.ALIGN_CENTER);
        doc.add(metaPara);

        doc.newPage();
    }

    // =========================================================================
    // Table of Contents
    // =========================================================================

    private void addTOC(Document doc, Book book) throws DocumentException {

        // TOC header
        PdfPTable hdrBanner = new PdfPTable(1);
        hdrBanner.setWidthPercentage(100);
        hdrBanner.setSpacingBefore(0);
        hdrBanner.setSpacingAfter(18f);
        PdfPCell hdrCell = new PdfPCell();
        hdrCell.setBorder(Rectangle.NO_BORDER);
        hdrCell.setPaddingBottom(14f);
        hdrCell.setPaddingTop(6f);
        Paragraph hdrPara = new Paragraph("Table of Contents", F_TOC_HEADING);
        hdrPara.setSpacingAfter(4f);
        hdrCell.addElement(hdrPara);
        // Underline via coloured cell bottom border
        hdrCell.setBorderWidthBottom(3f);
        hdrCell.setBorderColorBottom(C_ACCENT);
        hdrCell.setBorderWidthLeft(0);
        hdrCell.setBorderWidthRight(0);
        hdrCell.setBorderWidthTop(0);
        hdrBanner.addCell(hdrCell);
        doc.add(hdrBanner);

        // Rows table: [num] [title] [q-count]
        PdfPTable tbl = new PdfPTable(new float[]{0.07f, 0.79f, 0.14f});
        tbl.setWidthPercentage(100);

        int idx = 1;
        for (Section sec : book.getSections()) {
            Color rowBg = (idx % 2 == 1) ? C_TOC_ODD : C_TOC_EVEN;

            // Number badge
            PdfPCell numCell = new PdfPCell();
            numCell.setBackgroundColor(C_ACCENT);
            numCell.setBorder(Rectangle.NO_BORDER);
            numCell.setPaddingLeft(0);
            numCell.setPaddingRight(0);
            numCell.setPaddingTop(9f);
            numCell.setPaddingBottom(9f);
            Paragraph numPara = new Paragraph(String.valueOf(idx), F_TOC_NUM);
            numPara.setAlignment(Element.ALIGN_CENTER);
            numCell.addElement(numPara);
            tbl.addCell(numCell);

            // Section title
            PdfPCell titleCell = new PdfPCell();
            titleCell.setBackgroundColor(rowBg);
            titleCell.setBorder(Rectangle.NO_BORDER);
            titleCell.setPaddingLeft(12f);
            titleCell.setPaddingTop(9f);
            titleCell.setPaddingBottom(9f);
            titleCell.addElement(new Paragraph(sec.getTitle(), F_TOC_ITEM));
            tbl.addCell(titleCell);

            // Q count
            PdfPCell countCell = new PdfPCell();
            countCell.setBackgroundColor(rowBg);
            countCell.setBorder(Rectangle.NO_BORDER);
            countCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            countCell.setPaddingRight(10f);
            countCell.setPaddingTop(9f);
            countCell.setPaddingBottom(9f);
            Paragraph countPara = new Paragraph(sec.getQuestionAnswers().size() + " Q&A", F_TOC_COUNT);
            countPara.setAlignment(Element.ALIGN_RIGHT);
            countCell.addElement(countPara);
            tbl.addCell(countCell);

            // 1px separator
            PdfPCell sep = new PdfPCell();
            sep.setColspan(3);
            sep.setFixedHeight(1f);
            sep.setBackgroundColor(C_MID_GREY);
            sep.setBorder(Rectangle.NO_BORDER);
            tbl.addCell(sep);

            idx++;
        }

        doc.add(tbl);
        doc.newPage();
    }

    // =========================================================================
    // Chapter divider page  –  full-page sectional break
    // =========================================================================

    private void addChapterDivider(Document doc, PdfWriter writer, Section sec, int chNum)
            throws DocumentException {
        Rectangle page = doc.getPageSize();
        float W = page.getWidth(), H = page.getHeight();
        PdfContentByte cb = writer.getDirectContentUnder();

        cb.saveState();
        // Full dark background
        cb.setColorFill(C_CHAPTER_DIV);
        cb.rectangle(0, 0, W, H);
        cb.fill();
        // Left teal bar
        cb.setColorFill(C_TEAL);
        cb.rectangle(0, 0, 8f, H);
        cb.fill();
        // Diagonal accent shape bottom-right
        cb.setColorFill(new Color(0x22, 0x2A, 0x48));
        cb.moveTo(W, 0);
        cb.lineTo(W, H * 0.38f);
        cb.lineTo(W * 0.45f, 0);
        cb.fill();
        // Accent bar bottom
        cb.setColorFill(C_HIGHLIGHT);
        cb.rectangle(0, 0, W, 6f);
        cb.fill();
        cb.restoreState();

        // Chapter number badge in top-left area
        addSpacer(doc, H * 0.24f / 14f);

        Paragraph chEyebrow = new Paragraph("CHAPTER " + chNum, F_COVER_EYEBROW);
        chEyebrow.setAlignment(Element.ALIGN_LEFT);
        chEyebrow.setIndentationLeft(14f);
        doc.add(chEyebrow);

        addSpacer(doc, 0.5f);

        // Amber divider left-aligned
        PdfPTable div = new PdfPTable(1);
        div.setTotalWidth(100f);
        div.setLockedWidth(true);
        div.setHorizontalAlignment(Element.ALIGN_LEFT);
        PdfPCell dc = new PdfPCell();
        dc.setFixedHeight(2.5f);
        dc.setBackgroundColor(C_HIGHLIGHT);
        dc.setBorder(Rectangle.NO_BORDER);
        div.addCell(dc);
        doc.add(div);

        addSpacer(doc, 0.8f);

        Paragraph secTitle = new Paragraph(sec.getTitle(), F_SECTION_DIV_TITLE);
        secTitle.setIndentationLeft(14f);
        doc.add(secTitle);

        addSpacer(doc, 1f);

        int qCount = sec.getQuestionAnswers().size();
        Paragraph meta = new Paragraph(qCount + " Questions & Answers", F_SECTION_DIV_SUBTITLE);
        meta.setIndentationLeft(14f);
        doc.add(meta);

        doc.newPage();
    }

    // =========================================================================
    // Chapter content page
    // =========================================================================

    private void addChapterContent(Document doc, Section sec, int chNum) throws DocumentException {
        // Section header banner (compact) at top of content page
        addSectionBanner(doc, sec.getTitle(), chNum);
        addSpacer(doc, 1f);

        List<QuestionAnswer> qas = sec.getQuestionAnswers();
        if (qas.isEmpty()) {
            doc.add(styledParagraph("No Q&A content found for this section.", F_ANSWER, 0, 12));
        }
        int qNum = 1;
        for (QuestionAnswer qa : qas) {
            addQA(doc, qa, qNum++);
        }
        doc.newPage();
    }

    // =========================================================================
    // Q&A rendering
    // =========================================================================

    private void addQA(Document doc, QuestionAnswer qa, int qNum) throws DocumentException {

        // ── Question header row ──────────────────────────────────────────────
        PdfPTable qBox = new PdfPTable(new float[]{0.09f, 0.91f});
        qBox.setWidthPercentage(100);
        qBox.setSpacingBefore(12f);
        qBox.setSpacingAfter(0f);
        qBox.setKeepTogether(true);

        // Q-number badge
        PdfPCell labelCell = new PdfPCell();
        labelCell.setBackgroundColor(C_ACCENT);
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPaddingLeft(6f);
        labelCell.setPaddingTop(9f);
        labelCell.setPaddingBottom(9f);
        labelCell.setPaddingRight(6f);
        labelCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        Paragraph labelPara = new Paragraph("Q" + qNum, F_Q_LABEL);
        labelPara.setAlignment(Element.ALIGN_CENTER);
        labelCell.addElement(labelPara);
        qBox.addCell(labelCell);

        // Question text
        PdfPCell qCell = new PdfPCell();
        qCell.setBackgroundColor(C_Q_BG);
        qCell.setBorder(Rectangle.NO_BORDER);
        qCell.setBorderWidthLeft(3.5f);
        qCell.setBorderColorLeft(C_CORAL);
        qCell.setPaddingLeft(12f);
        qCell.setPaddingTop(9f);
        qCell.setPaddingBottom(9f);
        qCell.setPaddingRight(10f);
        qCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        qCell.addElement(new Paragraph(qa.getQuestion(), F_Q_TEXT));
        qBox.addCell(qCell);
        doc.add(qBox);

        // ── Answer body: parse into typed blocks ─────────────────────────────
        if (qa.getAnswer() != null && !qa.getAnswer().isBlank()) {
            addAnswerContent(doc, qa.getAnswer());
        }

        // ── Code blocks ───────────────────────────────────────────────────────
        for (String code : qa.getCodeBlocks()) {
            addCodeBlock(doc, code);
        }

        // ── Separator line ────────────────────────────────────────────────────
        PdfPTable sepLine = new PdfPTable(1);
        sepLine.setWidthPercentage(100);
        sepLine.setSpacingBefore(8f);
        sepLine.setSpacingAfter(0f);
        PdfPCell sepCell = new PdfPCell();
        sepCell.setFixedHeight(1f);
        sepCell.setBackgroundColor(C_LIGHT_GREY);
        sepCell.setBorder(Rectangle.NO_BORDER);
        sepLine.addCell(sepCell);
        doc.add(sepLine);
    }

    // =========================================================================
    // Answer content parser – splits text into paragraph / image / table blocks
    // =========================================================================

    /**
     * Parses the scraped answer text and renders it into the PDF document
     * as a mix of paragraph text, embedded images, and formatted tables.
     *
     * <p>Recognised special lines:</p>
     * <ul>
     *   <li>{@code [Image: alt | https://url]} – download and embed the image</li>
     *   <li>{@code [Image: alt]}               – show a styled placeholder</li>
     *   <li>{@code | col | col |}              – table row (accumulated then rendered)</li>
     * </ul>
     */
    private void addAnswerContent(Document doc, String answerText) throws DocumentException {
        String[] lines = answerText.split("\n");

        // Buffer for consecutive plain-text lines → one paragraph block
        Paragraph answerPara = null;
        boolean firstContent = true;

        // Buffer for consecutive table rows
        List<String[]> tableRows = new ArrayList<>();

        // Flush any pending paragraph to the doc
        // (declared as array trick to allow mutation inside lambda-like block)
        // We use a simple pattern here: flush inline.

        for (int idx = 0; idx < lines.length; idx++) {
            String line = lines[idx];

            // ── Image marker ──────────────────────────────────────────────────
            java.util.regex.Matcher imgMatcher =
                java.util.regex.Pattern
                    .compile("^\\[Image:\\s*(.+?)(?:\\s*\\|\\s*(https?://\\S+))?]\\s*$")
                    .matcher(line.trim());

            if (imgMatcher.matches()) {
                // Flush pending paragraph
                if (answerPara != null) {
                    flushAnswerPara(doc, answerPara);
                    answerPara = null;
                    firstContent = true;
                }
                // Flush pending table
                if (!tableRows.isEmpty()) {
                    flushTableBlock(doc, tableRows);
                    tableRows.clear();
                }

                String imgLabel = imgMatcher.group(1).trim();
                String imgUrl   = imgMatcher.group(2);
                addImageBlock(doc, imgLabel, imgUrl);
                continue;
            }

            // ── Table row ─────────────────────────────────────────────────────
            String trimmed = line.trim();
            if (trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.length() > 2) {
                // Flush pending paragraph first
                if (answerPara != null) {
                    flushAnswerPara(doc, answerPara);
                    answerPara = null;
                    firstContent = true;
                }
                String[] cells = trimmed.split("\\|");
                // cells[0] is empty (before first |), last is empty (after last |)
                List<String> cellList = new ArrayList<>();
                for (int c = 1; c < cells.length - 1; c++) {
                    cellList.add(cells[c].trim());
                }
                // Skip pure separator rows (---|---|)
                boolean isSeparator = cellList.stream().allMatch(c -> c.matches("-+"));
                if (!isSeparator) {
                    tableRows.add(cellList.toArray(new String[0]));
                }
                continue;
            }

            // Non-table line → flush pending table first
            if (!tableRows.isEmpty()) {
                flushTableBlock(doc, tableRows);
                tableRows.clear();
            }

            // ── Blank line → flush paragraph ──────────────────────────────────
            if (line.isBlank()) {
                if (answerPara != null) {
                    flushAnswerPara(doc, answerPara);
                    answerPara = null;
                    firstContent = true;
                }
                continue;
            }

            // ── Regular text line ─────────────────────────────────────────────
            if (answerPara == null) {
                answerPara = new Paragraph();
                answerPara.setFont(F_ANSWER);
                answerPara.setLeading(17f);
            }

            if (!firstContent) answerPara.add(Chunk.NEWLINE);
            firstContent = false;

            if (line.startsWith("  \u25e6 ") || line.startsWith("    \u25e6")) {
                String text = line.replaceFirst("^\\s*\u25e6\\s*", "");
                answerPara.add(new Chunk("        \u25e6  " + text, F_BULLET_L2));
            } else if (line.startsWith("\u2022 ") || line.contains("\u2022 ")) {
                String text = line.replaceFirst("^\\s*\u2022\\s*", "");
                answerPara.add(new Chunk("    \u2022  " + text, F_BULLET_L1));
            } else {
                answerPara.add(new Chunk(line, F_ANSWER));
            }
        }

        // Flush any remaining buffers
        if (answerPara != null) flushAnswerPara(doc, answerPara);
        if (!tableRows.isEmpty()) flushTableBlock(doc, tableRows);
    }

    /** Wraps a built answer paragraph in the styled answer cell and adds it to the doc. */
    private void flushAnswerPara(Document doc, Paragraph answerPara) throws DocumentException {
        PdfPTable ansWrap = new PdfPTable(1);
        ansWrap.setWidthPercentage(100);
        ansWrap.setSpacingBefore(0f);
        ansWrap.setSpacingAfter(0f);

        PdfPCell ansCell = new PdfPCell();
        ansCell.setBackgroundColor(C_ANSWER_BG);
        ansCell.setBorder(Rectangle.NO_BORDER);
        ansCell.setBorderWidthLeft(3.5f);
        ansCell.setBorderColorLeft(C_MID_GREY);
        ansCell.setPaddingLeft(16f);
        ansCell.setPaddingRight(12f);
        ansCell.setPaddingTop(8f);
        ansCell.setPaddingBottom(10f);
        ansCell.addElement(answerPara);
        ansWrap.addCell(ansCell);
        doc.add(ansWrap);
    }

    /**
     * Renders accumulated table rows as a styled {@link PdfPTable}.
     * The first row is treated as a header if there are ≥ 2 rows.
     */
    private void flushTableBlock(Document doc, List<String[]> tableRows) throws DocumentException {
        if (tableRows.isEmpty()) return;

        // Determine column count from the widest row
        int cols = tableRows.stream().mapToInt(r -> r.length).max().orElse(1);
        if (cols == 0) return;

        PdfPTable table = new PdfPTable(cols);
        table.setWidthPercentage(100);
        table.setSpacingBefore(6f);
        table.setSpacingAfter(6f);

        boolean isHeaderRow = true;
        for (String[] row : tableRows) {
            for (int c = 0; c < cols; c++) {
                String cellText = (c < row.length) ? row[c] : "";
                PdfPCell cell = new PdfPCell();
                cell.setBorderColor(C_LIGHT_GREY);
                cell.setBorderWidth(0.5f);
                cell.setPaddingLeft(8f);
                cell.setPaddingRight(8f);
                cell.setPaddingTop(5f);
                cell.setPaddingBottom(5f);

                if (isHeaderRow) {
                    cell.setBackgroundColor(new Color(0xE8, 0xF0, 0xFE)); // light blue header
                    cell.addElement(new Paragraph(cellText, F_ANSWER_STRONG));
                } else {
                    cell.setBackgroundColor(C_ANSWER_BG);
                    cell.addElement(new Paragraph(cellText, F_ANSWER));
                }
                table.addCell(cell);
            }
            isHeaderRow = false;
        }

        // Wrap in a left-border styled container
        PdfPTable wrapper = new PdfPTable(1);
        wrapper.setWidthPercentage(100);
        wrapper.setSpacingBefore(4f);
        wrapper.setSpacingAfter(4f);
        PdfPCell wrapCell = new PdfPCell();
        wrapCell.setBorder(Rectangle.NO_BORDER);
        wrapCell.setBorderWidthLeft(3.5f);
        wrapCell.setBorderColorLeft(C_ACCENT);
        wrapCell.setPaddingLeft(0f);
        wrapCell.setPaddingRight(0f);
        wrapCell.setPaddingTop(0f);
        wrapCell.setPaddingBottom(0f);
        wrapCell.addElement(table);
        wrapper.addCell(wrapCell);
        doc.add(wrapper);
    }

    /**
     * Downloads an image from {@code imageUrl} and embeds it in the PDF.
     * Falls back to a styled text placeholder if the download fails or no URL is provided.
     *
     * @param doc      the open iText Document
     * @param label    the alt text / caption for the image
     * @param imageUrl absolute HTTP(S) URL, or {@code null}
     */
    private void addImageBlock(Document doc, String label, String imageUrl) throws DocumentException {
        if (imageUrl != null && !imageUrl.isBlank()) {
            try {
                byte[] imgBytes = downloadBytes(imageUrl);
                if (imgBytes != null && imgBytes.length > 0) {
                    Image pdfImg = Image.getInstance(imgBytes);
                    // Scale to fit page width (leaving margins)
                    float maxWidth = doc.getPageSize().getWidth()
                            - doc.leftMargin() - doc.rightMargin() - 20f;
                    if (pdfImg.getWidth() > maxWidth) {
                        pdfImg.scaleToFit(maxWidth, maxWidth * 2);
                    }
                    pdfImg.setSpacingBefore(6f);
                    pdfImg.setSpacingAfter(2f);
                    pdfImg.setAlignment(Image.ALIGN_LEFT);
                    doc.add(pdfImg);

                    // Caption below the image
                    if (!label.isBlank()) {
                        Paragraph caption = new Paragraph(label,
                                new Font(F_ANSWER.getBaseFont(), 9, Font.ITALIC, C_MUTED));
                        caption.setSpacingBefore(2f);
                        caption.setSpacingAfter(8f);
                        doc.add(caption);
                    }
                    return; // success – skip fallback
                }
            } catch (Exception e) {
                log.warn("Could not embed image '{}': {}", imageUrl, e.getMessage());
            }
        }

        // ── Fallback: styled caption box ──────────────────────────────────────
        PdfPTable box = new PdfPTable(1);
        box.setWidthPercentage(100);
        box.setSpacingBefore(6f);
        box.setSpacingAfter(6f);
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(new Color(0xF0, 0xF3, 0xF8));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setBorderWidthLeft(3f);
        cell.setBorderColorLeft(C_ACCENT_LIGHT);
        cell.setPaddingLeft(14f);
        cell.setPaddingTop(8f);
        cell.setPaddingBottom(8f);
        Font placeholderFont = new Font(F_ANSWER.getBaseFont(), 10, Font.ITALIC, C_MUTED);
        cell.addElement(new Paragraph("\uD83D\uDCF7  " + label, placeholderFont));
        box.addCell(cell);
        doc.add(box);
    }

    /**
     * Downloads the content at {@code urlStr} into a byte array.
     * Uses a 10-second timeout and follows up to one redirect.
     *
     * @return byte array of content, or {@code null} on error
     */
    private byte[] downloadBytes(String urlStr) {
        try {
            HttpURLConnection conn = (HttpURLConnection) new URL(urlStr).openConnection();
            conn.setConnectTimeout(10_000);
            conn.setReadTimeout(10_000);
            conn.setRequestProperty("User-Agent",
                    "In28Minutes-InterviewBot/1.0 (Educational scraper; contact@in28minutes.com)");
            conn.setInstanceFollowRedirects(true);
            int status = conn.getResponseCode();
            if (status != 200) {
                log.debug("Image download HTTP {}: {}", status, urlStr);
                return null;
            }
            try (InputStream in = conn.getInputStream();
                 ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                byte[] buf = new byte[8192];
                int n;
                while ((n = in.read(buf)) != -1) baos.write(buf, 0, n);
                return baos.toByteArray();
            }
        } catch (Exception e) {
            log.debug("downloadBytes failed for {}: {}", urlStr, e.getMessage());
            return null;
        }
    }

    // =========================================================================
    // Code block  –  terminal-dark aesthetic with language label
    // =========================================================================

    private void addCodeBlock(Document doc, String code) throws DocumentException {
        if (code == null || code.isBlank()) return;

        PdfPTable wrapper = new PdfPTable(1);
        wrapper.setWidthPercentage(98);
        wrapper.setHorizontalAlignment(Element.ALIGN_CENTER);
        wrapper.setSpacingBefore(5f);
        wrapper.setSpacingAfter(5f);

        // Header: traffic-light dots + language label
        PdfPCell header = new PdfPCell();
        header.setBackgroundColor(C_CODE_HEADER);
        header.setBorder(Rectangle.NO_BORDER);
        header.setPaddingLeft(10f);
        header.setPaddingTop(6f);
        header.setPaddingBottom(6f);
        header.setPaddingRight(10f);

        Paragraph headerLine = new Paragraph();
        Font redDot    = new Font(F_CODE.getBaseFont(), 10, Font.NORMAL, new Color(0xFF, 0x5F, 0x57));
        Font yellowDot = new Font(F_CODE.getBaseFont(), 10, Font.NORMAL, new Color(0xFF, 0xBD, 0x2E));
        Font greenDot  = new Font(F_CODE.getBaseFont(), 10, Font.NORMAL, new Color(0x27, 0xC9, 0x3F));
        headerLine.add(new Chunk("\u25cf ", redDot));
        headerLine.add(new Chunk("\u25cf ", yellowDot));
        headerLine.add(new Chunk("\u25cf", greenDot));
        headerLine.add(new Chunk("   ", F_CODE_LANG));
        // Detect language hint from content
        String langHint = detectLanguage(code);
        headerLine.add(new Chunk(langHint, F_CODE_LANG));
        header.addElement(headerLine);
        wrapper.addCell(header);

        // Code content
        Paragraph codePara = new Paragraph();
        codePara.setLeading(14f);
        String[] lines = code.split("\n", -1);
        for (int i = 0; i < lines.length; i++) {
            String ln = lines[i].replace("\t", "    ");
            codePara.add(new Chunk(ln, F_CODE));
            if (i < lines.length - 1) codePara.add(Chunk.NEWLINE);
        }

        PdfPCell codeCell = new PdfPCell(codePara);
        codeCell.setBackgroundColor(C_CODE_BG);
        codeCell.setBorder(Rectangle.NO_BORDER);
        codeCell.setBorderWidthLeft(3f);
        codeCell.setBorderColorLeft(C_TEAL);
        codeCell.setPaddingLeft(14f);
        codeCell.setPaddingRight(14f);
        codeCell.setPaddingTop(12f);
        codeCell.setPaddingBottom(12f);
        codeCell.setNoWrap(false);
        wrapper.addCell(codeCell);

        doc.add(wrapper);
    }

    /** Simple heuristic to detect code language for the label. */
    private String detectLanguage(String code) {
        if (code.contains("public class") || code.contains("@Override") || code.contains("System.out")) return "Java";
        if (code.contains("terraform") || code.contains("resource \"") || code.contains(".tf")) return "HCL / Terraform";
        if (code.contains("kubectl") || code.contains("apiVersion:") || code.contains("kind:")) return "YAML / Kubernetes";
        if (code.contains("docker ") || code.contains("FROM ") || code.contains("COPY ")) return "Dockerfile";
        if (code.contains("git ") || code.contains("commit") || code.contains("branch")) return "Git / Shell";
        if (code.contains("def ") || code.contains("import ") || code.contains("print(")) return "Python";
        if (code.contains("function") || code.contains("const ") || code.contains("=>")) return "JavaScript";
        return "Code";
    }

    // =========================================================================
    // Section banner (compact, for content page header)
    // =========================================================================

    private void addSectionBanner(Document doc, String title, int chNum) throws DocumentException {
        PdfPTable banner = new PdfPTable(new float[]{0.08f, 0.92f});
        banner.setWidthPercentage(100);
        banner.setSpacingBefore(0);
        banner.setSpacingAfter(0);

        // Amber chapter-number chip
        PdfPCell numCell = new PdfPCell();
        numCell.setBackgroundColor(C_HIGHLIGHT);
        numCell.setBorder(Rectangle.NO_BORDER);
        numCell.setPaddingTop(10f);
        numCell.setPaddingBottom(10f);
        numCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        Paragraph numP = new Paragraph(String.valueOf(chNum), F_CHAPTER_BADGE);
        numP.setAlignment(Element.ALIGN_CENTER);
        numCell.addElement(numP);
        banner.addCell(numCell);

        // Title on dark bg
        PdfPCell titleCell = new PdfPCell();
        titleCell.setBackgroundColor(C_ACCENT);
        titleCell.setBorder(Rectangle.NO_BORDER);
        titleCell.setPaddingLeft(14f);
        titleCell.setPaddingTop(10f);
        titleCell.setPaddingBottom(10f);
        Font bannerFont = new Font(F_Q_TEXT.getBaseFont(), 13, Font.BOLD, C_WHITE);
        titleCell.addElement(new Paragraph(title, bannerFont));
        banner.addCell(titleCell);

        // Teal stripe below
        PdfPCell stripe = new PdfPCell();
        stripe.setColspan(2);
        stripe.setBackgroundColor(C_TEAL);
        stripe.setFixedHeight(3f);
        stripe.setBorder(Rectangle.NO_BORDER);
        banner.addCell(stripe);

        doc.add(banner);
    }

    // =========================================================================
    // Utilities
    // =========================================================================

    private static Paragraph styledParagraph(String text, Font font, float before, float after) {
        Paragraph p = new Paragraph(text, font);
        p.setSpacingBefore(before);
        p.setSpacingAfter(after);
        return p;
    }

    private static void addSpacer(Document doc, float lines) throws DocumentException {
        Paragraph sp = new Paragraph(" ");
        sp.setLeading(12f * Math.max(lines, 0.5f));
        doc.add(sp);
    }

    private static PdfPTable centeredDivider(float widthPt, Color color, float height) {
        PdfPTable t = new PdfPTable(1);
        t.setTotalWidth(widthPt);
        t.setLockedWidth(true);
        t.setHorizontalAlignment(Element.ALIGN_CENTER);
        t.setSpacingBefore(6f);
        t.setSpacingAfter(6f);
        PdfPCell c = new PdfPCell();
        c.setFixedHeight(height);
        c.setBackgroundColor(color);
        c.setBorder(Rectangle.NO_BORDER);
        t.addCell(c);
        return t;
    }

    // =========================================================================
    // Footer page event
    // =========================================================================

    private static class FooterEvent extends PdfPageEventHelper {
        private final String topic;
        FooterEvent(String topic) { this.topic = topic; }

        @Override
        public void onEndPage(PdfWriter writer, Document doc) {
            PdfContentByte cb = writer.getDirectContent();
            Rectangle page = doc.getPageSize();
            float y     = doc.bottomMargin() - 20f;
            float left  = doc.leftMargin();
            float right = page.getWidth() - doc.rightMargin();
            float mid   = page.getWidth() / 2f;

            cb.saveState();
            // Footer background strip
            cb.setColorFill(new Color(0xF0, 0xF2, 0xF5));
            cb.rectangle(0, y - 6f, page.getWidth(), 28f);
            cb.fill();
            // Top accent line of footer
            cb.setColorStroke(C_ACCENT);
            cb.setLineWidth(1f);
            cb.moveTo(left, y + 20f);
            cb.lineTo(right, y + 20f);
            cb.stroke();
            cb.restoreState();

            ColumnText.showTextAligned(cb, Element.ALIGN_LEFT,
                    new Phrase(topic + " Interview Guide", F_FOOTER), left + 4, y + 5f, 0);
            ColumnText.showTextAligned(cb, Element.ALIGN_CENTER,
                    new Phrase("interview.in28minutes.com", F_FOOTER), mid, y + 5f, 0);
            ColumnText.showTextAligned(cb, Element.ALIGN_RIGHT,
                    new Phrase("Page " + writer.getPageNumber(), F_FOOTER), right - 4, y + 5f, 0);
        }
    }
}

