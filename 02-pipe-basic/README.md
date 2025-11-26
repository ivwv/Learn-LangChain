# 📘 Lesson 02 — Building a Prompt → Model Pipe Chain

This lesson teaches how to combine a **Prompt Template** and a **Model** into a single reusable pipeline using `.pipe()`.  
This helps us build clean, modular, and scalable AI flows — without manually formatting and invoking the model every time.

---

# 🚀 What We Are Doing in This Lesson (Flow Overview)

In this chapter, we build a pipeline that works like this:

1️⃣ **Load environment variables**  
→ So our API keys become available.

2️⃣ **Initialize the Gemini 2.0 Flash model**  
→ This is the LLM that gives final answers.

3️⃣ **Create a prompt template**  
→ A structure like:  
   `"explain me {topic} , like ELI5"`

4️⃣ **Pipe the prompt into the model**  
→ This automatically forms:  
   `formatted prompt → model → response`

5️⃣ **Call the chain with an input (`{topic: "ice cream"}`)**  
→ LangChain internally formats the prompt and sends it to the LLM.

6️⃣ **Print raw & clean content from the response**  
→ Understand what the model returns.

This single chain forms the foundation of more advanced pipelines like RAG, tools, and agents.

---

# 🔥 Full Flow Diagram

```
Input (topic: "ice cream")
        │
        ▼
PromptTemplate --- fills {topic} ---> "explain ice cream, like ELI5"
        │
        ▼
Gemini 2.0 Flash LLM
        │
        ▼
Final AI Response
```

Everything between input → final response is handled automatically by `.pipe()`.

---

# 🧠 Code Explained in Logical Blocks

---

## 🔹 **1. Setup: Load environment + import LangChain**
```js
import {config} from "dotenv"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";

config()
```

### ✔ What this block does:
- Loads `.env` file
- Makes your API key available (`process.env.GEMINI_API_KEY`)
- Imports the LangChain model and prompt classes

Without this setup, nothing else works.

---

## 🔹 **2. Create the Gemini Model**
```js
const model = new ChatGoogleGenerativeAI({
    model:"gemini-2.0-flash",
    apiKey:process.env.GEMINI_API_KEY
})
```

### ✔ Why this block exists:
- Initializes Google Gemini 2.0 Flash model  
- This model processes the final prompt  
- It’s fast, cheap, and great for chain testing

This is your **AI brain**.

---

## 🔹 **3. Create a Prompt Template**
```js
const prompt = PromptTemplate.fromTemplate(`
    explain me {topic} , like ELI5`
)
```

### ✔ Why this block exists:
- `{topic}` is a dynamic placeholder  
- We can reuse this prompt for **any input topic**
- No need to manually write strings for every call

It makes your prompts **clean, reusable, maintainable**.

---

## 🔹 **4. Create a Pipe Chain (Prompt → Model)**
```js
const chain = prompt.pipe(model)
```

### ✔ What this block does:
`.pipe()` connects the prompt template to the model:

```
Input → PromptTemplate.format() → Model.invoke() → Response
```

### ✔ Why this is powerful:
- You don't need to call `.format()` manually  
- No need to invoke the model manually  
- LangChain handles everything internally  
- Your chain becomes a single clean function

This is how real AI pipelines are built.

---

## 🔹 **5. Execute the chain**
```js
const res = await chain.invoke({topic:"ice cream"})
```

### ✔ Why this block exists:
- You only pass **one object** to the entire pipeline
- LangChain automatically:
  1. Replaces `{topic}`  
  2. Creates the final prompt  
  3. Sends to Gemini  
  4. Returns structured output

Simplest possible pipeline execution.

---

## 🔹 **6. Print raw & cleaned output**
```js
console.log("raw response", res)
console.log("chain content response", res.content)
```

### ✔ Why this block is important:
- `raw response` → shows full metadata  
- `res.content` → clean text from the LLM

Understanding both is essential when building tools, agents, or RAG systems later.

---

# 🔁 Full Code (Reference)

```js
import {config} from "dotenv"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";

config()
const model = new ChatGoogleGenerativeAI({
    model:"gemini-2.0-flash",
    apiKey:process.env.GEMINI_API_KEY
})

const prompt = PromptTemplate.fromTemplate(`
    explain me {topic} , like ELI5`
)

// Create chain: prompt -> model

const chain = prompt.pipe(model)
// chain = (input) => model.invoke( prompt.format(input) )

async function run(){
    const res = await chain.invoke({topic:"ice cream"})
    console.log("raw response", res)
    console.log("chain content response", res.content)
}
run().catch(console.error)
```

---

# ▶️ How to Run

```
node 02-pipe-basic.js
```

---

# 🌍 Real-World Use Cases

- Reusable AI teaching template  
- Chatbots with dynamic prompts  
- Customer support FAQ explainers  
- Educational apps  
- AI writing assistants  
- Multi-step LLM workflows  
- Pipelines combining prompt → model → output parser  

`.pipe()` is used EVERYWHERE in advanced Agentic AI.

---

# ⭐ Next Chapter  
Continue to **Lesson 03 — Output Parsers**.

