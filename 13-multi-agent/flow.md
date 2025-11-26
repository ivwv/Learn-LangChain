# 🔥 Full Execution Flow (Lesson 13 Multi-Agent System)

This is the complete flow of how the Lesson 13 agent works internally —  
from user input → routing → scraping/search → final answer.

Paste this section anywhere in your README.

---

## 🧭 High-Level Flow

```
User Input
     ↓
PLAN NODE  
  - Hard rule: if URL → SCRAPE
  - Else LLM decides → SEARCH or ANSWER
     ↓
┌───────────────┬────────────────┬────────────────┐
│               │                │                │
│  SCRAPE NODE  │  SEARCH NODE   │  ANSWER NODE   │
│ (if URL)      │ (Tavily API)   │ (direct QA)    │
│               │                │                │
└───────────────┴────────────────┴────────────────┘
                ↓
         ANSWER NODE  
         (Final reasoning
         using scraped/
         searched data)
                ↓
               END
```

---

## 🧠 Detailed Step-by-Step Flow

### **1️⃣ User types a message**  
Example:
```
Summarize https://vercel.com
```
OR
```
What is Bitcoin price today?
```
OR
```
Tell me about OpenAI founders.
```

---

### **2️⃣ PLAN NODE runs first (brain of the agent)**

The Planner performs:

#### ✔ Hard Routing (Rule-Based)
- If user message contains a URL →**PLAN=scrape**

#### ✔ LLM Routing (Smarter)
If no URL → LLM decides:
- "search" → if question needs current facts  
- "answer" → if it's a normal knowledge question  

Planner appends:
```
PLAN=scrape
```
OR  
```
PLAN=search
```
OR  
```
PLAN=answer
```

---

### **3️⃣ Conditional Graph Routing**

Based on the PLAN:

```
If PLAN=scrape → go to SCRAPE node
If PLAN=search → go to SEARCH node
Else → go to ANSWER node
```

This is real agent orchestration.

---

### **4️⃣ SCRAPE NODE (if URL)**

- Opens a **real browser** using Puppeteer  
- Loads the page fully  
- Extracts all text from React/Next.js/Vue apps  
- Cleans & trims  
- Saves as:

```
SCRAPED=full_clean_text
```

---

### **5️⃣ SEARCH NODE (if search)**

- Sends query to **Tavily Search API**  
- Gets:
  - answer  
  - citations  
  - search summary  
- Result saved as:

```
SEARCHED={tavily JSON response}
```

---

### **6️⃣ ANSWER NODE (Final reasoning)**

This node:

1. Reads:
   ```
   SCRAPED=...
   SEARCHED=...
   ```
2. Reads user message  
3. Builds a special prompt that forces the model:
   - not to say “I can’t browse”
   - not to hallucinate  
   - to only use data obtained from tools  

4. Generates the final answer.

---

### **7️⃣ Final Response Returned to User**

The user sees a clean, concise reply based on:

- scraped data  
- search data  
- or direct knowledge  

---

## ⚙️ Execution Loop (REPL)

The REPL allows:

```
> your question
AI: response
> next question
AI: response
```

Real-time, continuous agent conversation.

---

## 🎯 Why This Flow Is Production Ready

- Combines **rule-based routing + LLM routing**
- Uses **real browsing** (Puppeteer)
- Uses **real search** (Tavily)
- Has **Zod schema** for safe message structure
- Has **error-safe paths** (NO_URL, SEARCH_ERROR)
- Has **tool-first architecture**

This is how real agentic systems like:

- Perplexity  
- WebPilot  
- BrowserGPT  
- Research Agents  
- AutoGPT v2  
- LangGraph official examples  

are built.

---
