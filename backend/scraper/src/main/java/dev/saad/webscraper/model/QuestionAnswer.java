package dev.saad.webscraper.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a single Question-Answer pair scraped from a sub-section page.
 * A Q&A may optionally contain one or more code blocks extracted from
 * &lt;pre&gt; or &lt;code&gt; elements on the page.
 */
public class QuestionAnswer {

    /** The question text, typically extracted from an &lt;h3&gt; or &lt;h4&gt; heading. */
    private String question;

    /** The answer text, extracted from paragraphs following the question heading. */
    private String answer;

    /**
     * List of raw code block strings found after the question heading.
     * Whitespace, line breaks, and tab indentation are preserved exactly.
     */
    private List<String> codeBlocks;

    // -------------------------------------------------------------------------
    // Constructors
    // -------------------------------------------------------------------------

    /** Default no-arg constructor. */
    public QuestionAnswer() {
        this.codeBlocks = new ArrayList<>();
    }

    /**
     * Convenience constructor for a Q&A without code blocks.
     *
     * @param question the question text
     * @param answer   the answer text
     */
    public QuestionAnswer(String question, String answer) {
        this.question = question;
        this.answer = answer;
        this.codeBlocks = new ArrayList<>();
    }

    /**
     * Full constructor.
     *
     * @param question   the question text
     * @param answer     the answer text
     * @param codeBlocks list of raw code block strings
     */
    public QuestionAnswer(String question, String answer, List<String> codeBlocks) {
        this.question = question;
        this.answer = answer;
        this.codeBlocks = (codeBlocks != null) ? codeBlocks : new ArrayList<>();
    }

    // -------------------------------------------------------------------------
    // Getters and Setters
    // -------------------------------------------------------------------------

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public List<String> getCodeBlocks() {
        return codeBlocks;
    }

    public void setCodeBlocks(List<String> codeBlocks) {
        this.codeBlocks = (codeBlocks != null) ? codeBlocks : new ArrayList<>();
    }

    /** Adds a single code block to the list. */
    public void addCodeBlock(String codeBlock) {
        if (codeBlock != null && !codeBlock.isBlank()) {
            this.codeBlocks.add(codeBlock);
        }
    }

    // -------------------------------------------------------------------------
    // Utility
    // -------------------------------------------------------------------------

    @Override
    public String toString() {
        return "QuestionAnswer{" +
                "question='" + (question != null ? question.substring(0, Math.min(question.length(), 60)) : "null") + "...'" +
                ", answerLength=" + (answer != null ? answer.length() : 0) +
                ", codeBlocks=" + codeBlocks.size() +
                '}';
    }
}

