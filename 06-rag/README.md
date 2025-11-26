# 📘 Lesson 06 — RAG (Retrieval-Augmented Generation) With Block-by-Block Explanation

This lesson teaches **exactly how a basic RAG pipeline works**, explained in the *same order as your code is written*.  
Each block of code has a matching explanation right under it.

This is the cleanest, easiest way to learn RAG.

---

# 🧠 Before the Code: What Is RAG?

RAG = **Retrieval Augmented Generation**

It means:

1️⃣ AI retrieves relevant information from your documents  
2️⃣ AI injects that info into the prompt  
3️⃣ AI answers using ONLY that info  

So the model stops hallucinating and starts answering based on facts.

RAG = *AI that reads your data before answering*.

Used in:

- Perplexity  
- ChatGPT Retrieval  
- AI chatbots with memory  
- Enterprise search  
- Document Q&A  
- Multi-agent knowledge systems  

---

# 🔥 Full Pipeline Diagram (Matches Code Order)

```
Load API Keys
      ↓
Initialize LLM
      ↓
Initialize Embedding Model
      ↓
Create Vector Store
      ↓
Seed Documents
      ↓
User Asks a Question
      ↓
Similarity Search (find best documents)
      ↓
Merge docs → context
      ↓
Build RAG Prompt (context + question)
      ↓
LLM Generates Final Answer
```

---

# 🧩 **CODE EXPLAINED BLOCK BY BLOCK (IN YOUR SEQUENCE)**

---

## 🔹 **BLOCK 1 — Imports + dotenv Setup**
```js
import { config } from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

config();
```

### ✔ What this block does:
- Loads `.env` so API keys work  
- Imports:
  - The LLM  
  - The embedding model  
  - The vector store  
  - Prompt template  
  - Output parser  

**This is the setup required for any RAG pipeline.**

---

## 🔹 **BLOCK 2 — Create the LLM (Gemini 2.0 Flash)**

```js
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  apiKey: process.env.GEMINI_API_KEY,
});
```

### ✔ Explanation:
This is the **AI brain** that will generate the final answer.  
It does NOT know your documents unless you pass context into its prompt.

---

## 🔹 **BLOCK 3 — Create the Embedding Model**

```js
const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004",
  apiKey: process.env.GEMINI_API_KEY,
});
```

### ✔ Explanation:
Embeddings convert text → vectors (arrays of numbers).  
This allows **semantic search** (search by meaning).

Example:  
“Who wants 15 LPA?” matches “Paresh is aiming for 15 LPA.”

---

## 🔹 **BLOCK 4 — Create the Vector Store (In-Memory DB)**

```js
const vectorStore = new MemoryVectorStore(embeddings);
```

### ✔ Explanation:
- Stores text embeddings  
- Lets you retrieve similar documents  
- Works like Pinecone, but 100% local  
- Fast and perfect for learning RAG  

This acts as your **AI’s long-term memory**.

---

## 🔹 **BLOCK 5 — Seed the Memory With Documents**

```js
await vectorStore.addDocuments([
  { pageContent: "Paresh is building an Agentic AI Backend OS using LangChain, Puppeteer, and Pinecone." },
  { pageContent: "Paresh is aiming for a 15 LPA package by mastering MERN, AI, agents, and RAG." },
  { pageContent: "LangChain Runnables and Tools help create Perplexity-style AI systems." },
]);
```

### ✔ Explanation:
These documents become the **knowledge base** of your RAG system.

Every document is embedded and stored in vector memory.

Now the AI can “remember” these facts.

---

## 🔹 **BLOCK 6 — User Asks a Question**

```js
const question = "Who is trying to reach 15 LPA and what is he building? why ?";
```

### ✔ Explanation:
The user query that requires understanding + factual retrieval.

---

## 🔹 **BLOCK 7 — Retrieve Similar Documents**

```js
const similarDocs = await vectorStore.similaritySearch(question, 3);
```

### ✔ Explanation:
This step:

- Embeds the question  
- Compares it with all stored document vectors  
- Returns the **top 3 semantically similar documents**

This is the “Retrieval” part of RAG.

---

## 🔹 **BLOCK 8 — Merge Retrieved Docs into Context**

```js
const context = similarDocs.map(d => d.pageContent).join("\n");
```

### ✔ Explanation:
We convert all retrieved documents into one big CONTEXT block.

LLMs cannot read databases → we must inject the context into the prompt.

---

## 🔹 **BLOCK 9 — Build the RAG Prompt**

```js
const prompt = PromptTemplate.fromTemplate(`
Use the context to answer.

CONTEXT:
{context}

QUESTION:
{question}

ANSWER:
`);
```

### ✔ Explanation:
This template forces the AI to:

- Use provided context  
- Not hallucinate  
- Answer clearly  
- Stay grounded in facts  

This completes the “Augmented” part of RAG.

---

## 🔹 **BLOCK 10 — Build the Chain (Prompt → Model → Parser)**

```js
const chain = prompt.pipe(model).pipe(new StringOutputParser());
```

### ✔ Explanation:
This converts the whole RAG pipeline into a simple chain:

```
input → fill prompt → run LLM → parse string → final answer
```

---

## 🔹 **BLOCK 11 — Get Final Answer**

```js
const answer = await chain.invoke({ context, question });
```

### ✔ Explanation:
We pass:

- the retrieved context  
- the question  

→ AI returns a clean, factual answer.

---

## 🔹 **BLOCK 12 — Print Answer**

```js
console.log(answer);
```

### ✔ Explanation:
This is the final output of your RAG pipeline.

---

# 🌍 Real Use Cases

- Perplexity-style search  
- Chatbots that read your content  
- Document Q&A  
- Enterprise knowledge assistants  
- Product search  
- Resume/job matching  
- AI assistants with real memory  

Every real AI app uses some form of RAG.

---

# ⭐ Next Chapter  
**Lesson 07 — tool basic** 

