# 📘 Lesson 11 — LangGraph Agent (Decide → Scrape → Summarize)

This lesson introduces you to **LangGraph**, the most powerful framework in LangChain for building:

- Multi-step AI workflows  
- Multi-node reasoning graphs  
- Multi-agent pipelines  
- Deterministic AI flows  
- Perplexity-style “reason → act → summarize” systems  

Unlike simple chains, LangGraph gives you **nodes**, **edges**, and **state**, allowing you to build real Agents.

In this lesson, we build a full 3-step agent:

1️⃣ **DECIDE** → Extract URL from user message  
2️⃣ **SCRAPE** → Fetch + clean website  
3️⃣ **SUMMARIZE** → Generate 5 bullet points  

This README explains **every block in your code in exact sequence**.

---

# 🧠 What is LangGraph? (Beginner-Friendly)

LangGraph = “AI Workflows Made Like Flowcharts.”

Instead of:

```
prompt → model → output
```

You build:

```
node1 → node2 → node3 → node4
```

Where each node:

- has its own function  
- receives state  
- returns updated state  
- passes messages to the next node  

This makes your agent **predictable**, **controllable**, and **modular**.

LangGraph is how you build:

- Multi-agent systems  
- Browser agents  
- RAG agents  
- Decider + Worker flows  
- Complex automation agents  

This chapter is your FIRST step into real agents.

---

# 🔥 Full Flow Diagram (Matches Your Code)

```
START
  ↓
[ decideNode ]
  │ Extract URL
  │ If no URL → END
  ↓
[ scrapeNode ]
  │ Fetch webpage
  │ Clean HTML
  ↓
[ summarizeNode ]
  │ Summarize in 5 bullets
  ↓
END
```

---

# 🧩 **CODE EXPLAINED BLOCK-BY-BLOCK (IN EXACT SEQUENCE)**


## 🔹 BLOCK 1 — dotenv Setup + Imports

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
- Loads `.env` (API keys)  
- Imports OpenAI LLM  
- Imports LangGraph components:  
  - **MessagesAnnotation** → how messages are stored  
  - **StateGraph** → build nodes + edges  
  - **START / END** → entry / exit point of the agent  

This is the base of any LangGraph workflow.

---

## 🔹 BLOCK 2 — The Model (LLM)

```js
const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});
```

### ✔ Explanation  
- `gpt-4o-mini` = fast + cheap model  
- `temperature: 0` = predictable output  
- This model is used in **decideNode** and **summarizeNode**

This is the “brain” used for reasoning.

---

## 🔹 BLOCK 3 — Scraper Function

```js
async function scrapeWebsite(url) {
  try {
    const res = await fetch(url);
    const html = await res.text();
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 2000);
  } catch (err) {
    return `Scrape error: ${err.message}`;
  }
}
```

### ✔ Explanation  
- Fetches URL  
- Removes script/style tags  
- Removes HTML  
- Collapses whitespace  
- Returns 2000 chars of clean readable text  
- If failed → returns error string  

This prepares website text for LLM summarization.

---

## 🔹 BLOCK 4 — Node 1: decideNode  
Extract URL from user message.

```js
async function decideNode(state) {
  const decision = await model.invoke([
    {
      role: "system",
      content:
        "Extract ONLY the URL from the user message. If none exists, return NOURL.",
    },
    ...state.messages,
  ]);

  const text = decision.content.trim();
  const match = text.match(/https?:\/\/\S+/);
  const url = match ? match[0] : null;

  return {
    messages: [
      ...state.messages,
      { role: "system", content: `URL=${url ?? "NONE"}` },
    ],
  };
}
```

### ✔ Explanation  
- Sends user message to LLM  
- LLM extracts URL  
- If no URL → returns `NONE`  
- Adds message: `URL=http…`  

This node **decides** the flow of the graph.

---

## 🔹 BLOCK 5 — Node 2: scrapeNode  
Scrape website using extracted URL.

```js
async function scrapeNode(state) {
  const lastMessage = state.messages.at(-1)?.content || "";
  const match = lastMessage.match(/https?:\/\/\S+/);
  const url = match ? match[0] : null;

  const scraped = await scrapeWebsite(url);

  return {
    messages: [
      ...state.messages,
      { role: "system", content: `SCRAPED=${scraped.slice(0, 50)}...` },
      { role: "system", content: `SCRAPED_FULL=${scraped}` },
    ],
  };
}
```

### ✔ Explanation  
- Reads URL from last message  
- Calls scraper  
- Adds 2 new messages:  
  - Preview (`SCRAPED=`)  
  - Full content (`SCRAPED_FULL=`)

This node collects the raw data for summarization.

---

## 🔹 BLOCK 6 — Node 3: summarizeNode  
Summarize scraped text.

```js
async function summarizeNode(state) {
  const full = state.messages
    .find((m) => m.content.startsWith("SCRAPED_FULL="))
    ?.content.replace("SCRAPED_FULL=", "") ?? "";

  const summary = await model.invoke([
    {
      role: "user",
      content: `Summarize this into 5 bullet points:\n${full}`,
    },
  ]);

  return {
    messages: [
      ...state.messages,
      { role: "assistant", content: summary.content },
    ],
  };
}
```

### ✔ Explanation  
- Extracts scraped text  
- Sends to LLM for summarization  
- Adds final summary as assistant message  
- This becomes the final output  

---

## 🔹 BLOCK 7 — Build the LangGraph Workflow

```js
const graph = new StateGraph(MessagesAnnotation)
  .addNode("decide", decideNode)
  .addNode("scrape", scrapeNode)
  .addNode("summarize", summarizeNode);
```

### ✔ Explanation  
You create a pipeline with 3 nodes:

```
decide → scrape → summarize
```

These nodes define the agent’s “brain.”

---

## 🔹 BLOCK 8 — Add Edges (Flow Control)

```js
graph.addEdge(START, "decide");

graph.addConditionalEdges("decide", (state) => {
  const last = state.messages.at(-1)?.content || "";
  return last.includes("URL=http") ? "scrape" : END;
});

graph.addEdge("scrape", "summarize");
graph.addEdge("summarize", END);
```

### ✔ Explanation  
- Start → decide  
- If URL found → go to scrape  
- Else → END  
- scrape → summarize  
- summarize → END  

This gives real branching logic (conditional flow).

---

## 🔹 BLOCK 9 — Compile the Agent

```js
const agent = graph.compile();
```

### ✔ Explanation  
Turns your workflow graph into a runnable Agent.

---

## 🔹 BLOCK 10 — Invoke the Agent

```js
const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "Scrape https://webreal.in and summarize it.",
    },
  ],
});
```

### ✔ Explanation  
You feed the agent a message containing a URL.  
Agent performs:

1. Extract URL  
2. Scrape  
3. Summarize  

---

## 🔹 BLOCK 11 — Print Final Summary

```js
console.log(result.messages.at(-1).content);
```

### ✔ Explanation  
Outputs the final assistant message → the **bullet point summary**.

---

# 📌 EXPECTED OUTPUT (Example)

```
• WebReal is a modern web agency offering website development services.
• Provides branding, UI/UX, and digital product development.
• The website targets businesses that want a professional online presence.
• Clean and simple layout highlighting professionalism.
• Includes portfolio, contact information, and service categories.
```



# ▶️ HOW TO USE

## 1️⃣ Install deps
```
npm install
```

## 2️⃣ Add API key
```
OPENAI_API_KEY=your_key_here
```

## 3️⃣ Run
```
node 11-agent-langgraph.js
```

---

# 🌍 REAL-WORLD APPLICATIONS

This 3-node graph is the same structure used in:

### ✔ Perplexity (search → scrape → summarize)  
### ✔ Multi-agent research assistants  
### ✔ Browser automation agents  
### ✔ Workflow pipelines (fetch → analyze → decide)  
### ✔ Digital marketing analyzers  
### ✔ News summarizers  
### ✔ Competitor analysis bots  
### ✔ SEO audit tools  

This lesson is your FIRST TRUE **LangGraph Agent**.

---

# ⭐ Next Lesson  
**Lesson 12 — Multi-Agent System (Supervisor → Workers).**

