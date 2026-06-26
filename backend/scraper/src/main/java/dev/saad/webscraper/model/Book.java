package dev.saad.webscraper.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Top-level model representing a single interview-guide topic (e.g., "Java",
 * "DevOps", "Kubernetes").  A Book aggregates all Sections discovered under
 * that topic and is eventually rendered as a standalone PDF file.
 */
public class Book {

    /** Display name of the topic (e.g., "Java", "Docker"). */
    private String topicName;

    /** Root URL of the topic dashboard page. */
    private String topicUrl;

    /** All sub-sections found under this topic. */
    private List<Section> sections;

    // -------------------------------------------------------------------------
    // Constructors
    // -------------------------------------------------------------------------

    /** Default no-arg constructor. */
    public Book() {
        this.sections = new ArrayList<>();
    }

    /**
     * Convenience constructor.
     *
     * @param topicName display name of the topic
     * @param topicUrl  root URL of the topic
     */
    public Book(String topicName, String topicUrl) {
        this.topicName = topicName;
        this.topicUrl = topicUrl;
        this.sections = new ArrayList<>();
    }

    /**
     * Full constructor.
     *
     * @param topicName display name of the topic
     * @param topicUrl  root URL of the topic
     * @param sections  pre-populated section list
     */
    public Book(String topicName, String topicUrl, List<Section> sections) {
        this.topicName = topicName;
        this.topicUrl = topicUrl;
        this.sections = (sections != null) ? sections : new ArrayList<>();
    }

    // -------------------------------------------------------------------------
    // Getters and Setters
    // -------------------------------------------------------------------------

    public String getTopicName() {
        return topicName;
    }

    public void setTopicName(String topicName) {
        this.topicName = topicName;
    }

    public String getTopicUrl() {
        return topicUrl;
    }

    public void setTopicUrl(String topicUrl) {
        this.topicUrl = topicUrl;
    }

    public List<Section> getSections() {
        return sections;
    }

    public void setSections(List<Section> sections) {
        this.sections = (sections != null) ? sections : new ArrayList<>();
    }

    /** Appends a single Section to this book. */
    public void addSection(Section section) {
        if (section != null) {
            this.sections.add(section);
        }
    }

    // -------------------------------------------------------------------------
    // Derived helpers
    // -------------------------------------------------------------------------

    /**
     * Generates the output PDF file name for this book.
     * Spaces in the topic name are replaced with underscores.
     * Example: "Spring Boot" → "Spring_Boot_Interview_Guide.pdf"
     *
     * @return PDF file name string
     */
    public String getFileName() {
        if (topicName == null || topicName.isBlank()) {
            return "Unknown_Interview_Guide.pdf";
        }
        return topicName.trim().replace(" ", "_") + "_Interview_Guide.pdf";
    }

    // -------------------------------------------------------------------------
    // Utility
    // -------------------------------------------------------------------------

    @Override
    public String toString() {
        return "Book{" +
                "topicName='" + topicName + '\'' +
                ", topicUrl='" + topicUrl + '\'' +
                ", sections=" + sections.size() +
                '}';
    }
}

