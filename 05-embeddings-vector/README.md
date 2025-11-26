# 📘 Lesson 05 — Embeddings & Vector Store Basics (The Foundation of RAG)

This lesson introduces the FIRST major concept required for RAG (Retrieval-Augmented Generation):  
**Embeddings + Vector Search.**

This is where we learn how to convert text into numerical vectors, store them, and perform similarity search.

It is one of the most important concepts in modern AI.

---

# 🚀 What We Will Do in This Lesson (Flow Overview)

1️⃣ Load the embedding model  
2️⃣ Convert text into embeddings  
3️⃣ Store embeddings inside a **vector store**  
4️⃣ Perform a **similarity search**  
5️⃣ Retrieve the most relevant documents  

This is the exact foundation behind:

- **ChatGPT memory**  
- **AI search engines**  
- **RAG chatbots**  
- **Multi-agent knowledge retrieval**  
- **Smart document answering systems**  

---

# 🔁 Flow Diagram (Simple)

```
Text Documents
        │
        ▼
 Embedding Model
  (text → vector numbers)
        │
        ▼
  Vector Store
 (memory or database)
        │
        ▼
User Query
        │
        ▼
Query Embedding (vector)
        │
        ▼
Similarity Search (cosine distance)
        │
        ▼
Top Matching Documents
```

---

# 🧠 Explanation of the Code in Logical Blocks

---

## 🔹 **1. Setup + Import Required Components**

This part loads:

- dotenv  
- Google Gemini embedding model  
- In-memory vector store  

Purpose:  
Prepare tools needed to embed text + store vectors.

---

## 🔹 **2. Initialize the Embedding Model**

You create an embedding generator using:

- Gemini model: `"text-embedding-004"`  
- Your API key from `.env`

Purpose:  
Convert text → numerical vectors (arrays of 768–1536 floating point numbers).

Embeddings allow semantic understanding:  
“Paresh age?” is similar to “Paresh is 20 years old.”

---

## 🔹 **3. Create an In-Memory Vector Store**

`MemoryVectorStore` stores all vectors inside RAM.

Advantages:

- Fast  
- No database required  
- Perfect for learning & testing  
- Works exactly like Pinecone / Qdrant but local  

This store enables similarity search based on vector distance.

---

## 🔹 **4. Add Documents to the Vector Store**

We insert multiple text documents like:

- “Paresh is building an agentic AI backend…”  
- “Paresh is 20 years old.”  

When you add documents:

1. It embeds each text  
2. Stores all embeddings in vector store  
3. Maintains internal mapping (doc → vector)

Now the store knows the **semantic meaning** of every document.

---

## 🔹 **5. Perform a Similarity Search**

Query:

```
"user age ?"
```

The steps behind the scenes:

1. Query gets embedded  
2. Store compares the query vector with all stored vectors  
3. Measures closeness (cosine similarity)  
4. Returns top matching documents  

You get results like:

- (Probably) “Paresh is 20 years old.”  
- (Maybe) Anything related to Paresh’s information  

This is **semantic search** — not keyword matching.

---

# 🧩 Why This Lesson Is Important

Embeddings are used in every advanced AI application:

### ✔ RAG (Retrieval-Augmented Generation)
Use vector search to give model the right context before answering.

### ✔ Multi-Agent Systems
Agents retrieve relevant memory before reasoning.

### ✔ AI Search Engines  
Search by meaning, not keywords.

### ✔ Chatbot Memory  
Store past messages as embeddings and find relevant history.

### ✔ Document Question Answering  
Attach PDFs, DOCs, websites — extract info semantically.

This lesson is the **core** of everything that comes later.

---

# 🌍 Real-World Use Cases

- “Give me notes about chapter 5” → semantic retrieval  
- Chatbot that remembers previous user info  
- AI that fetches facts before answering  
- Retrieval pipelines used in OpenAI RAG tutorials  
- E-commerce semantic search (“shoes under ₹2000 red running”)  
- Resume matching  
- FAQ answering bots  

---

# ▶️ How to Run

```
node 05-embeddings-vector.js
```

Make sure your `.env` contains:

```
GEMINI_API_KEY=your_api_key_here
```

---

# ⭐ Next Chapter  
**Lesson 06 — Basic RAG (Using embeddings + vector store + LLM to answer user queries).**

