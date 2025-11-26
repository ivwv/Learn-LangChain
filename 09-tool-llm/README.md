# 📘 Lesson 09 — Scrape + Summarize Pipeline (Tool → LLM Chain)

In this lesson, we combine everything learned so far:

✔ Tools (RunnableLambda)  
✔ Zod validation  
✔ Web scraping  
✔ Prompt templates  
✔ LLM invocation  
✔ String parsing  
✔ Multi-step pipeline  

We build a **real AI workflow:**

➡️ **Step 1:** Scrape a website  
➡️ **Step 2:** Clean HTML → extract readable text  
➡️ **Step 3:** Pass extracted content into a summarization LLM  
➡️ **Step 4:** Get a clean 5-bullet summary  

This is basically a **mini Perplexity-style research pipeline**.

---

# 🚀 What This Lesson Does (Flow Overview)

1️⃣ User gives a URL  
2️⃣ We validate the URL using Zod  
3️⃣ Fetch and scrape the website  
4️⃣ Clean HTML → readable text  
5️⃣ Pass text → Gemini LLM  
6️⃣ Produce a helpful summary  
7️⃣ Return final response  

Perfect for:

- SEO automation  
- Research agents  
- Web content summarization  
- Perplexity-like multi-tool agents  
- Browser automation flows  
- Content analysis tools  

---

# 🔁 Visual Pipeline Diagram

```
URL
 ↓
Zod Validation
 ↓
Fetch HTML
 ↓
Clean Text
 ↓
Inject into Prompt
 ↓
Gemini LLM Summary
 ↓
Final Bullet-Point Output
```

---

# 🧩 **Code Explanation (Block-by-Block in Exact Sequence)**

---

## 🔹 BLOCK 1 — Imports + dotenv Setup

Loads:

- RunnableLambda  
- Gemini LLM  
- PromptTemplate  
- Parser  
- Zod for validation  
- Environment variables  

Purpose: prepare for tool + LLM chain.

---

## 🔹 BLOCK 2 — Scraper Tool (with Input Validation)

### What it does:
- Ensures the input contains a valid `url`
- Fetches the webpage
- Removes `<script>`, `<style>`, and HTML tags
- Extracts only clean readable text
- Limits text to 3000 characters (keeps LLM fast & cheap)
- Returns `{ success, content }`

### Why this block matters:
This transforms a **raw website** into **LLM-ready text**.  
This is EXACTLY how Perplexity fetches website data.

---

## 🔹 BLOCK 3 — Initialize LLM (Gemini Flash)

### What it does:
Creates the AI brain which will generate the summary.

### Why:
We need a smart model to understand and compress website content.

---

## 🔹 BLOCK 4 — Create the Summary Prompt

The prompt instructs the model to:

- Use simple English  
- Produce 5 bullet points  
- Explain what the website does  
- Explain who the website is for  

### Why:
This shapes the final answer into a structured, readable output.

---

## 🔹 BLOCK 5 — Create Summary LLM Chain

Pipeline:

```
prompt → model → string parser
```

### What it does:
Takes `{content}` and returns **plain text summary**.

### Why:
Makes summarization automatic and reusable.

---

## 🔹 BLOCK 6 — Main Function: Full Pipeline Execution

This block runs the entire chain:

1. Calls the scrape tool  
2. Handles errors  
3. Sends scraped text to the LLM  
4. Prints final summary  

### Why:
This is a fully working multi-step AI workflow.

---

# 📌 Expected Output (Example)

Your final summary will look like:

```
📌 FINAL SUMMARY:

• Sheryians is an online coding and design education platform.
• It offers courses in MERN, Python, UI/UX, AI, and DevOps.
• It targets beginners and students aiming to enter tech fields.
• The website focuses on practical, industry-ready training.
• Provides hands-on projects, mentorship, and career guidance.
```

(The exact content will differ depending on website updates.)

---

# ▶️ How to Run

```
node 09-tool-llm.js
```

Make sure your `.env` contains:

```
GEMINI_API_KEY=your_gemini_key_here
```

---

# 🌍 Real-World Applications of This Lesson

This pipeline is the foundation of:

### ✔ Web Research Agents  
Scrape → summarize → answer questions.

### ✔ SEO Automation Tools  
Extract site content → generate summaries → detect keywords.

### ✔ Competitor Research  
Summarize competitor websites automatically.

### ✔ QA / Analysis Tools  
Extract and analyze website copy.

### ✔ Perplexity-like multi-tool systems  
Scrape → understand → generate insights.

### ✔ Browser Automation Agents  
Combine with Puppeteer for JS-rendered pages.

---

# ⭐ Next Chapter  
**Lesson 10 — Agent Demo: LLM decides WHEN to call the Tool.**

