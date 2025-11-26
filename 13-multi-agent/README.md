# 📘 Lesson 13 — Production-Grade Multi-Agent System  
### (Real Scraping • Real Search • Hard Routing • REPL Chat • Zod Schema)

This is the most **real-world**, **production-level**, and **feature-rich** agent in the entire repository.

Lesson 13 shows how to build **Perplexity-style agents**, using:

- **Real Browser Scraping (Puppeteer)**
- **Real Web Search (Tavily API)**
- **Hard + LLM Routing**
- **Zod for Schema Validation**
- **LangGraph State Machines**
- **REPL terminal chat**

This is NOT a demo.  
This is a template you can use for startups and production AI.

---

# 🧱 Why This Lesson Exists

Lessons 11 → 12 taught you the basics of agent workflow.

Lesson 13 is where it becomes **real**:

- Real search  
- Real scraping  
- Real routing  
- Real error-handling  
- Real message schemas  
- Real agent lifecycle  

This is the point where your agent becomes **useful**, not just “cool code.”

---

# 📦 Packages Used (And WHY)

| Package | Why we need it |
|---------|----------------|
| **@langchain/langgraph** | Build multi-node agent workflows |
| **@langchain/openai** | Use GPT-4o-mini reliably for routing + summarization |
| **puppeteer** | **Real browser scraping**, unlike regex scraping |
| **zod** | Validate agent state & prevent broken messages |
| **dotenv** | Store API keys (OPENAI, TAVILY) |
| **Tavily API** | **Real internet search** with factual answers |
| **readline** | Interactive REPL (terminal chat) |

---

# 🤖 Why Use OpenAI Instead of Gemini Here?

Great question.

Gemini is amazing, but:

### ✔ OpenAI GPT-4o-mini is:
- Faster
- Cheaper
- More deterministic
- Better at **short routing decisions**
- More reliable with “STRICT router instructions”

### ✔ LangGraph’s official examples use OpenAI  
So compatibility is perfect.

### ✔ Tavily recommends OpenAI for search → answer use cases

You **can** swap in Gemini later.  
But for Lesson 13, OpenAI is the safest + most stable choice.

---

# 🔥 ARCHITECTURE (In One Diagram)

```
User Input
     ↓
[ PLAN NODE ]
   - Hard rule: URL → SCRAPE
   - Else: LLM decides SEARCH or ANSWER
     ↓
 ┌────────────┬────────────┐
 ↓            ↓            ↓
SCRAPE      SEARCH      ANSWER
 ↓            ↓            ↓
        [ ANSWER NODE ]
             ↓
            END
```

---

# 🧩 FILE STRUCTURE

```
/lesson-13/
   ├── 13-multi-agent.js   ← main agent graph
   ├── scrape.js           ← Puppeteer scraper
   └── .env                ← API keys
```

---

# 🧠 FULL BLOCK-BY-BLOCK EXPLANATION (MAIN FILE)

---

## 🟦 **1. Imports + dotenv**

```js
import { config } from "dotenv";
config();

import readline from "readline";
import { ChatOpenAI } from "@langchain/openai";
import { StateGraph, START, END } from "@langchain/langgraph";
import { z } from "zod";
import { scrapeReact } from "./scrape.js";
```

### ✔ What this does
- Loads env variables  
- Imports LLM  
- Imports LangGraph  
- Imports Zod for schemas  
- Imports Puppeteer scraper  

---

## 🟦 **2. Ensure API Keys**

```js
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
```

If missing → clean error.

---

## 🟦 **3. Create the Model**

```js
const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
  apiKey: OPENAI_API_KEY,
});
```

### ✔ Why GPT-4o-mini?
- Deterministic
- Cheap
- Perfect for routing
- Strong reasoning
- Stable for production agents

---

## 🟦 **4. Zod Message Schema**

```js
const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

const State = z.object({
  messages: z.array(MessageSchema),
});
```

### ✔ Why Zod?
To prevent:

- malformed messages  
- missing roles  
- broken state updates  

Real agents MUST be safe.

---

## 🟦 **5. Utility: Find Last User Message**

```js
function findLastUserMessage(state) {
  return [...state.messages].reverse().find((m) => m.role === "user");
}
```

Simple helper.  
Used in **every node**.

---

## 🟦 **6. Tavily Search Node**

```js
async function tavilySearch(query) {
  if (!TAVILY_API_KEY) return "NO_TAVILY_KEY";
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        search_depth: "advanced",
        include_answer: true,
      }),
    });
    const json = await res.json();
    return JSON.stringify(json);
  } catch (err) {
    return "SEARCH_ERROR_" + (err.message || String(err));
  }
}
```

### ✔ Why Tavily?
- Real-time search  
- Accurate result extraction  
- Designed for agents  

---

## 🟦 **7. PLAN NODE — Hard Router + LLM Router**

```js
async function planNode(state) {
  const userMsg = findLastUserMessage(state)?.content || "";

  if (userMsg.match(/https?:\/\/\S+/i)) {
    return {
      messages: [...state.messages, { role: "system", content: "PLAN=scrape" }],
    };
  }

  const decisionResp = await model.invoke([
    {
      role: "system",
      content: `
You are a STRICT router. Output ONLY one word: "search" or "answer".
If the user asks anything recent like prices, days, current, etc → "search".
Else → "answer".
`,
    },
    ...state.messages,
  ]);

  const d = (decisionResp.content || "").toLowerCase().trim();
  const plan = d.includes("search") ? "search" : "answer";

  return {
    messages: [...state.messages, { role: "system", content: `PLAN=${plan}` }],
  };
}
```

### ✔ Why this router is powerful?
- If URL exists → scrape  
- If question is about **today / now / recent** → search  
- Else → answer from memory  

This is EXACTLY how Perplexity routes tools.

---

## 🟦 **8. SCRAPE NODE**

```js
async function scrapeNode(state) {
  const userMsg = findLastUserMessage(state)?.content || "";
  const urlMatch = userMsg.match(/https?:\/\/\S+/i);
  const url = urlMatch ? urlMatch[0] : null;
  if (!url) {
    return {
      messages: [...state.messages, { role: "system", content: "SCRAPED=NO_URL_PROVIDED" }],
    };
  }

  const scraped = await scrapeReact(url);
  return {
    messages: [...state.messages, { role: "system", content: `SCRAPED=${scraped}` }],
  };
}
```

### ✔ Uses real scraping (from scrape.js)

---

## 🟦 **9. SEARCH NODE**

```js
async function searchNode(state) {
  const userMsg = findLastUserMessage(state)?.content || "";
  const q = userMsg || "";
  const result = await tavilySearch(q);
  return {
    messages: [...state.messages, { role: "system", content: `SEARCHED=${result}` }],
  };
}
```

---

## 🟦 **10. ANSWER NODE**

```js
async function answerNode(state) {
  const scrapedEntry = state.messages.find((m) => m.content.startsWith("SCRAPED="));
  const searchedEntry = state.messages.find((m) => m.content.startsWith("SEARCHED="));
  const userMsg = findLastUserMessage(state)?.content || "";

  const prompt = `
IMPORTANT:
- Do NOT say "I cannot browse".
- Scraping/search was ALREADY done by your tools.
- Use provided scraped/search data ONLY.

User: ${userMsg}

Scraped: ${scrapedEntry ? scrapedEntry.content.replace(/^SCRAPED=/, "") : "NONE"}
Searched: ${searchedEntry ? searchedEntry.content.replace(/^SEARCHED=/, "") : "NONE"}

Give a concise final answer.
`;

  const out = await model.invoke([{ role: "user", content: prompt }]);
  return {
    messages: [...state.messages, { role: "assistant", content: out.content }],
  };
}
```

### ✔ Why this is powerful?
Stops LLM hallucination like:

- “I can’t browse”
- “I don’t know that data”
- “I can’t access internet”

---

# 🧩 EXPLAINING **scrape.js** (Block-by-Block)

---

## 🟦 **1. Import puppeteer**

```js
import puppeteer from "puppeteer";
```

### ✔ Full browser control.

---

## 🟦 **2. scrapeReact() function**

```js
export async function scrapeReact(url, { timeout = 30000 } = {}) {
  if (!url) return "NO_URL";

  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
```

### ✔ Opens headless browser  
### ✔ Loads the page in full

---

## 🟦 **3. Fake viewport + user-agent**

```js
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"
    );
```

### ✔ Pretend to be a real user  
### ✔ Helps avoid blocking

---

## 🟦 **4. Navigate + wait**

```js
    await page.goto(url, { waitUntil: "networkidle2", timeout });
```

### ✔ Waits for JS-heavy sites  
### (React, Next.js, Vue, Angular)

---

## 🟦 **5. Extract readable text**

```js
    const content = await page.evaluate(() => {
      return document.body.innerText || "";
    });
```

### ✔ Gets full text content  
### ✔ Works on ALL modern websites

---

## 🟦 **6. Trim and slice**

```js
    return content.replace(/\s+/g, " ").trim().slice(0, 60_000);
```

### ✔ Output optimized for LLM input  
### ✔ Avoids huge tokens

---

## 🟦 **7. Close the browser**

```js
  } finally {
    if (browser) await browser.close();
  }
}
```

---

# ▶️ HOW TO RUN

```
npm install
```

Add `.env`:

```
OPENAI_API_KEY=your_key
TAVILY_API_KEY=your_key
```

Run REPL:

```
node 13-multi-agent.js
```

---

# 🧪 Example PROMPTS

```
> What is the price of Bitcoin today?
> Summarize https://webreal.in
> Who is the founder of OpenAI?
> Give me latest Google stock performance
```

---

# 🎉 Final Notes

Lesson 13 is **production-level agent architecture**.

This is the SAME STRUCTURE used for:

- Perplexity  
- WebPilot  
- BrowserGPT  
- Research Agents  
- AI Assistants with Tools  
- Multi-Agent Supervisor Systems  

This is the future of MERN + AI + LangChain combined.

---
