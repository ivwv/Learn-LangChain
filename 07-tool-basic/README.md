# 📘 Lesson 07 — Tools Basics (Creating a Function the AI Can Use)

In this lesson, we learn the simplest and most important building block of Agents:

👉 **A Tool**  
A tool is just a function that LangChain (and the AI model) can call to perform some action.

Before building real agents, automation, or browser bots — we must understand how to create a basic tool using **RunnableLambda**.

This is the easiest place to start.

---

# 🧠 What Is a Tool in LangChain?

A **tool** is simply a function that performs a specific task, such as:

- doing math  
- searching online  
- scraping websites  
- querying a database  
- reading files  
- calling APIs  

The LLM *cannot perform actions* by itself.

Tools give it **superpowers**.

This lesson explains the smallest, simplest tool possible → **an Add Tool (a + b)**.

---

# 🔥 Flow Overview (Matches Code Order)

```
Define Tool Function
       ↓
Wrap It in RunnableLambda
       ↓
Call the Tool Using .invoke()
       ↓
Get Final Output (a + b)
```

Very simple, but essential.

---

# 🧩 Code Explanation (Block-by-Block in Exact Sequence)

---

## 🔹 **BLOCK 1 — Import RunnableLambda**

```js
import { RunnableLambda } from "@langchain/core/runnables";
```

### ✔ Explanation:
- `RunnableLambda` lets you convert ANY JavaScript function into a LangChain tool.
- This is the foundation for tools used in Agents.
- Later, LLMs will be able to automatically call such tools.

Think of it as "wrapping your function into a LangChain-compatible format."

---

## 🔹 **BLOCK 2 — Define the Tool (Add Numbers)**

```js
const addTool = RunnableLambda.from((input) => {
  const { a, b } = input;
  return a + b;
});
```

### ✔ Explanation:
This block creates a custom tool.

- It expects an object with `a` and `b`
- Extracts these values
- Returns their sum

This becomes a callable tool in your chain/agent pipeline.

### 🔥 Why this matters:
This is the SAME pattern used for:

- Scraper tools  
- Search tools  
- File-read tools  
- Database query tools  
- Browser automation tools  
- Even multi-step reasoning tools  

**Every tool starts like this.**

---

## 🔹 **BLOCK 3 — Run the Tool Using .invoke()**

```js
const result = await addTool.invoke({ a: 5, b: 7 });
```

### ✔ Explanation:
`.invoke()` runs the tool with provided input.

- You pass `{a:5, b:7}`
- Tool runs your function
- Returns `5 + 7 = 12`

### 💡 Why invoke?
LangChain standardizes `.invoke()` for:

- Chains
- Models
- Tools
- Agents
- Runnables

So every component uses the same API.

---

## 🔹 **BLOCK 4 — Print Final Output**

```js
console.log("RESULT:", result);
```

### ✔ Explanation:
Shows the output of the tool.  
For this example, it will print:

```
RESULT: 12
```

Very simple — but this is exactly how we build bigger tools later.

---

# 🌍 Why This Lesson Matters

This is the **foundation** of real-world agent systems.

Tools allow an AI agent to:

### ✔ Do math  
### ✔ Search the internet  
### ✔ Scrape websites  
### ✔ Use APIs  
### ✔ Interact with databases  
### ✔ Control browsers  
### ✔ Automate workflows  

Every “smart” AI system uses tools behind the scenes.

If you understand this small example,  
you can build:

- Perplexity-style multi-tool agents  
- Web automation tools (Puppeteer)  
- RAG tools  
- Database query tools  
- File parsing tools  

This lesson starts that journey.

---

# ▶️ How to Run

```
node 07-tool-basic.js
```

---

# ⭐ Next Chapter  
**Lesson 08 — Web Scraper Tool (Using Puppeteer).**

