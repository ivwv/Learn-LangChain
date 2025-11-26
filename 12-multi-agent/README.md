# 📘 Lesson 12 — Multi-Agent System (Planner → Scrape/Search → Summarize)

This lesson teaches how to build your **first multi-agent system** using LangGraph.

You will create:

1️⃣ A **PLANNER AGENT** → decides which tool to use  
2️⃣ A **SCRAPER AGENT** → fetches website text  
3️⃣ A **SEARCH AGENT** → returns fake search data  
4️⃣ A **SUMMARIZER AGENT** → creates the final answer  

This is EXACTLY how large agentic systems work:

- Perplexity  
- Devin / OpenDevin  
- AutoGPT  
- CrewAI  
- LangGraph agents  

Each “agent” = one node, one responsibility.

---

# 🔥 Full Flow Diagram (Matches Code)

```
START
  ↓
[ PLAN ]
  ↓
 ┌──────────────┬──────────────┐
 ↓              ↓              ↓
SCRAPE       SEARCH       SUMMARIZE (direct)
  ↓              ↓
       SUMMARIZE
            ↓
           END
```

---

# 🧩 BLOCK-BY-BLOCK EXPLANATION (WITH CODE)

---

## 🔹 BLOCK 1 — dotenv Setup & Imports

```js
import { config } from "dotenv";
config();

import { ChatOpenAI } from "@langchain/openai";
import {
  MessagesAnnotation,
  StateGraph,
  START,
  END,
} from "@langchain/langgraph";
```

### ✔ Explanation  
- Loads environment variables  
- Imports **GPT-4o-mini** and all LangGraph components  
- These are mandatory for multi-node agent workflows  

---

## 🔹 BLOCK 2 — The Model (LLM for Planner + Summary)

```js
const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});
```

### ✔ Explanation  
- Fast & predictable model  
- Used for **planning decisions** and **summary generation**  
- Temperature 0 = no randomness  

---

## 🔹 BLOCK 3 — FAKE SEARCH TOOL (Demo Only)

```js
async function fakeSearch(query) {
  return `Search results for: ${query}
1) Google 2023 revenue was $307B.
2) Alphabet grew 9%.
(FAKE DEMO DATA)
`;
}
```

### ✔ Explanation  
- Pretend search engine  
- In real agent: replace with Tavily, Bing, SerpAPI, etc.  
- Helps the Planner choose **search** when user asks factual queries  

---

## 🔹 BLOCK 4 — SCRAPER TOOL

```js
async function scrapeWebsite(url) {
  try {
    const res = await fetch(url);
    const html = await res.text();
    return html.replace(/<[^>]+>/g, " ").trim().slice(0, 1500);
  } catch {
    return "Error scraping";
  }
}
```

### ✔ Explanation  
- Fetch URL  
- Remove HTML tags  
- Clean text  
- Limit to 1500 chars  
- Used when Planner chooses `"scrape"`  

---

## 🔹 BLOCK 5 — NODE 1: PLANNER AGENT  
Decides which tool to use: **scrape | search | math | summarize**

```js
async function plannerNode(state) {
  const decision = await model.invoke([
    {
      role: "system",
      content:
        "You are a tool-decider. Output ONLY one of these words: scrape, search, math, summarize.",
    },
    ...state.messages,
  ]);

  const mode = decision.content.trim().toLowerCase();

  return {
    messages: [
      ...state.messages,
      { role: "system", content: `PLAN=${mode}` },
    ],
  };
}
```

### ✔ Explanation  
- Takes the user message  
- LLM decides the required action  
- Stores the plan as:  
  ```
  PLAN=search
  ```  

This is the **Supervisor Agent**.

---

## 🔹 BLOCK 6 — NODE 2: SCRAPE AGENT

```js
async function scrapeNode(state) {
  const last = state.messages.at(-1).content;
  const url = last.match(/https?:\/\/\S+/)?.[0];

  const text = await scrapeWebsite(url);

  return {
    messages: [
      ...state.messages,
      { role: "system", content: `SCRAPED=${text}` },
    ],
  };
}
```

### ✔ Explanation  
- Extracts URL from last message  
- Calls scraper tool  
- Saves scraped text to state  

---

## 🔹 BLOCK 7 — NODE 3: SEARCH AGENT

```js
async function searchNode(state) {
  const lastUser = state.messages.find((m) => m.role === "user")?.content;
  const result = await fakeSearch(lastUser);

  return {
    messages: [
      ...state.messages,
      { role: "system", content: `SEARCHED=${result}` },
    ],
  };
}
```

### ✔ Explanation  
- Takes **original user query**  
- Runs fake search  
- Saves search results  
- Very similar to Perplexity’s search tool  

---

## 🔹 BLOCK 8 — NODE 4: SUMMARIZER AGENT  
Combines final tool output into clean summary.

```js
async function summarizeNode(state) {
  const data = state.messages.find((m) =>
    m.content.startsWith("SCRAPED=") || m.content.startsWith("SEARCHED=")
  )?.content.replace("SCRAPED=", "").replace("SEARCHED=", "");

  const summary = await model.invoke([
    { role: "user", content: `Summarize:\n${data}` },
  ]);

  return {
    messages: [...state.messages, { role: "assistant", content: summary.content }],
  };
}
```

### ✔ Explanation  
- Reads output of **scrape** or **search**  
- Asks LLM to produce structured summary  
- Adds **final assistant message**  

---

## 🔹 BLOCK 9 — BUILD THE MULTI-AGENT GRAPH

```js
const graph = new StateGraph(MessagesAnnotation)
  .addNode("plan", plannerNode)
  .addNode("scrape", scrapeNode)
  .addNode("search", searchNode)
  .addNode("summarize", summarizeNode);
```

### ✔ Explanation  
You register all agents/nodes:

```
plan → scrape → search → summarize
```

This is your multi-agent "company."

---

## 🔹 BLOCK 10 — FLOW LOGIC (Conditional Routing)

```js
graph.addEdge(START, "plan");

graph.addConditionalEdges("plan", (state) => {
  const last = state.messages.at(-1).content;
  if (last.includes("scrape")) return "scrape";
  if (last.includes("search")) return "search";
  if (last.includes("summarize")) return "summarize";
  return END;
});

graph.addEdge("scrape", "summarize");
graph.addEdge("search", "summarize");
graph.addEdge("summarize", END);
```

### ✔ Explanation  
- Start → Planner  
- Planner decides which tool node runs  
- scrape → summarize  
- search → summarize  
- summarize → END  

This is real **tool decision-making**.

---

## 🔹 BLOCK 11 — Compile the Agent

```js
const agent = graph.compile();
```

### ✔ Explanation  
Turns the graph into a runnable multi-agent workflow.

---

## 🔹 BLOCK 12 — RUN THE AGENT

```js
const result = await agent.invoke({
  messages: [
    { role: "user", content: "Find Google 2023 revenue" },
  ],
});
```

### ✔ Explanation  
- User query triggers Planner  
- Planner sees it's a **search query**  
- Runs **fakeSearch**  
- Then **summarize**  
- Outputs final assistant answer  

---

## 🔹 BLOCK 13 — Print Final Output

```js
console.log(result.messages.at(-1).content);
```

---

# 📌 EXPECTED OUTPUT (Example)

```
• Google’s 2023 revenue was approximately $307B.
• Alphabet’s revenue saw a growth of 9%.
• These numbers are retrieved from the fake search tool.
• Shows annual performance metrics of Google/Alphabet.
• Summary generated by AI from search results.
```

---

# ▶️ HOW TO RUN

```
node 12-multi-agent.js
```

Ensure `.env` contains:

```
OPENAI_API_KEY=your_key_here
```

---

# 🌍 REAL-WORLD USE CASES

This architecture is used in:

### ✔ Perplexity AI  
### ✔ Multi-agent research assistants  
### ✔ Auto-analysts (SEO, finance, marketing)  
### ✔ AI browser tools  
### ✔ Data extraction + summary systems  
### ✔ Supervisor → Worker agent systems  
### ✔ RAG + Agents combined  

---

# ⭐ Next Lesson  
**Lesson 13 — Multi-Agent System (Advanced Version: Real Tools + Branching + Dynamic Reasoning).**
