# 🎓 Interview Guide

A full-stack interview preparation platform with **AI-powered quizzes**, curated Q&As, and downloadable PDF guides for Java, DevOps, Cloud, Docker, Kubernetes, Terraform, and Git.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📚 Topic Guides | Scraped Q&As across 7 technology topics |
| 🔍 Search | Full-text search across all questions and answers |
| 🧠 AI Quiz | GPT powered quizzes — MCQ and free-text modes |
| 📊 Score History | Session-scoped quiz history with average score tracker |
| 🌙 Dark Mode | System-aware theme toggle |
| 📥 PDF Downloads | Download complete interview guides as PDFs |

---

## 🏗️ Project Structure

```
InterviewGuide/
├── frontend/                        # React + Vite + Tailwind CSS
│   ├── public/data/                 # Scraped JSON data files (served statically)
│   ├── public/pdfs/                 # Generated PDF guides
│   └── src/
│       ├── api/quizApi.js           # Fetch wrappers for Spring AI quiz endpoints
│       ├── context/
│       │   ├── ThemeContext.jsx
│       │   └── QuizHistoryContext.jsx  # In-memory session quiz scores
│       ├── pages/
│       │   ├── HomePage.jsx
│       │   ├── TopicPage.jsx
│       │   ├── SectionPage.jsx
│       │   ├── SearchPage.jsx
│       │   └── QuizPage.jsx         # AI quiz — Setup → Loading → Quiz → Results
│       └── components/
│           ├── QuizSetup.jsx        # Topic/section/difficulty/mode configuration
│           ├── QuizQuestion.jsx     # MCQ + free-text question renderer with AI feedback
│           ├── QuizResults.jsx      # Score ring, per-question review accordion
│           └── QuizHistory.jsx      # Session history slide-in drawer
│
└── backend/
    ├── pom.xml                      # Maven aggregator (modules: scraper, quiz)
    │
    ├── scraper/                     # Standalone scraper tool (plain Java)
    │   ├── pom.xml
    │   └── src/main/java/dev/saad/webscraper/
    │       ├── Main.java
    │       ├── scraper/WebScraper.java
    │       ├── pdf/PdfGenerator.java
    │       ├── json/JsonExporter.java
    │       └── model/
    │
    └── quiz/                        # Spring Boot + Spring AI quiz backend
        ├── pom.xml
        └── src/main/java/dev/saad/quiz/
            ├── QuizApplication.java
            ├── controller/
            │   ├── QuizController.java   # POST /api/quiz/generate & /evaluate
            │   └── SpaController.java    # React Router SPA fallback
            ├── service/
            │   ├── QuizService.java      # Gemini prompt orchestration
            │   └── DataLoaderService.java # Loads + samples topic JSON context
            ├── model/
            │   ├── QuizRequest.java
            │   ├── QuizQuestion.java
            │   ├── EvaluateRequest.java
            │   └── EvaluateResponse.java
            └── config/CorsConfig.java    # Dev CORS for Vite proxy
```

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 20+ *(only needed for local frontend development; the Maven build downloads it automatically)*
- An **Gemini API key** with access to `Gemini 2.5 Flash-lite`

---

### Step 1 — Set your Gemini API key

Open `backend/quiz/src/main/resources/application.properties` and replace the placeholder:

```properties
spring.ai.google.genai.api-key=sk-PASTE_YOUR_OPENAI_API_KEY_HERE
```
or set and enironment variable as "GEMINI_API_KEY" (Recommended)
---

### Step 2 — Run the Scraper (first time only)

This populates `frontend/public/data/` with JSON and `frontend/public/pdfs/` with PDFs.

```bash
cd backend/scraper
mvn package
java -jar target/interview-guide-scraper-1.0.0.jar
```

---

### Step 3 — Build & Run the Quiz App (bundled)

The Maven build automatically installs Node, runs `npm run build`, copies the Vite output into Spring Boot's static resources, and packages everything into a single fat JAR.

```bash
cd backend/quiz
mvn package
java -jar target/interview-guide-quiz-1.0.0.jar
```

Then open **http://localhost:8080** 🎉

---

### Development Mode (hot reload)

Run the Spring Boot backend and the Vite dev server simultaneously:

```bash
# Terminal 1 — Spring Boot backend
cd backend/quiz
mvn spring-boot:run

# Terminal 2 — Vite frontend (hot reload on :5173)
cd frontend
npm run dev
```

The Vite dev server proxies `/api/**` to `http://localhost:8080` automatically.

---

## 🧠 AI Quiz Feature

Navigate to **Quiz** in the navbar or click **"🧠 Quiz this topic"** on any topic page.

### Setup options

| Option | Choices |
|---|---|
| Topic | Java, DevOps, Cloud, Docker, Kubernetes, Terraform, Git |
| Section | All sections or a specific one |
| Difficulty | Easy / Medium / Hard |
| Questions | 5 – 20 |
| Mode | MCQ (multiple choice) or Free Text (open-ended) |

### How it works

1. **Generate** — `DataLoaderService` samples up to 20 Q&A pairs from the scraped JSON and builds a compact context prompt. Gemini generates `n` quiz questions with key-point rubrics.
2. **Answer** — You select an MCQ option or type a free-text response.
3. **Evaluate** — Gemini grades your answer against the key points and returns a verdict (✅ / ⚠️ / ❌), a 0–100 score, and written feedback.
4. **Results** — An overall score ring + per-question review accordion. Results are saved to the **session history** (cleared when you close the tab).

---

## 📦 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/quiz/generate` | Generate quiz questions |
| `POST` | `/api/quiz/evaluate` | Evaluate a single answer |

### `POST /api/quiz/generate`

```json
{
  "topic": "java",
  "section": "spring-boot-basics",
  "questionCount": 10,
  "difficulty": "medium",
  "mode": "mcq"
}
```

### `POST /api/quiz/evaluate`

```json
{
  "question": "What is the JVM?",
  "keyPoints": ["virtual machine", "bytecode", "platform independence"],
  "userAnswer": "JVM stands for Java Virtual Machine and executes bytecode..."
}
```

---

## 🔧 Configuration

All settings are in `backend/quiz/src/main/resources/application.properties`:

```properties
# Gemini
spring.ai.google.genai.chat.options.model=gemini-2.5-flash-lite
spring.ai.google.genai.chat.options.temperature=0.7

# Quiz behaviour
quiz.context.max-questions-per-section=20   # Max Q&As sampled for AI context
```
