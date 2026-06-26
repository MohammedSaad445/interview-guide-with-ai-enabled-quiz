package dev.saad.webscraper.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a sub-section within a topic (e.g., "Java Memory Management"
 * within the "Java" topic).  A Section groups all Q&amp;A pairs found on its
 * corresponding page.
 */
public class Section {

    /** Human-readable title of the sub-section (derived from the page heading or link text). */
    private String title;

    /** The canonical URL of this sub-section page. */
    private String url;

    /** All Question-Answer pairs extracted from this sub-section page. */
    private List<QuestionAnswer> questionAnswers;

    // -------------------------------------------------------------------------
    // Constructors
    // -------------------------------------------------------------------------

    /** Default no-arg constructor. */
    public Section() {
        this.questionAnswers = new ArrayList<>();
    }

    /**
     * Convenience constructor.
     *
     * @param title the display title of the section
     * @param url   the source URL of the section page
     */
    public Section(String title, String url) {
        this.title = title;
        this.url = url;
        this.questionAnswers = new ArrayList<>();
    }

    /**
     * Full constructor.
     *
     * @param title           the display title of the section
     * @param url             the source URL of the section page
     * @param questionAnswers pre-populated list of Q&A pairs
     */
    public Section(String title, String url, List<QuestionAnswer> questionAnswers) {
        this.title = title;
        this.url = url;
        this.questionAnswers = (questionAnswers != null) ? questionAnswers : new ArrayList<>();
    }

    // -------------------------------------------------------------------------
    // Getters and Setters
    // -------------------------------------------------------------------------

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public List<QuestionAnswer> getQuestionAnswers() {
        return questionAnswers;
    }

    public void setQuestionAnswers(List<QuestionAnswer> questionAnswers) {
        this.questionAnswers = (questionAnswers != null) ? questionAnswers : new ArrayList<>();
    }

    /** Appends a single Q&amp;A pair to this section. */
    public void addQuestionAnswer(QuestionAnswer qa) {
        if (qa != null) {
            this.questionAnswers.add(qa);
        }
    }

    // -------------------------------------------------------------------------
    // Utility
    // -------------------------------------------------------------------------

    @Override
    public String toString() {
        return "Section{" +
                "title='" + title + '\'' +
                ", url='" + url + '\'' +
                ", questionAnswers=" + questionAnswers.size() +
                '}';
    }
}

