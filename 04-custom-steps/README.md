# 📘 Lesson 04 — Adding Custom Preprocessing Steps to Your Chain

In this lesson, we learn how to integrate **custom logic** into a LangChain pipeline before the LLM is executed.  
This is extremely useful when you need to:

- Clean or normalize input  
- Validate data  
- Transform user queries  
- Add metadata  
- Prepare context  
- Call extra functions/tools before the model runs  

This pattern is used heavily in real-world AI applications, especially in agents, chatbots, and APIs.

---

# 🚀 What We Will Do in This Lesson (Flow Overview)

This chapter introduces a new concept:  
👉 **A custom step that runs BEFORE prompt → model → parser.**

Our flow becomes:

```
Input
  ↓
Custom Preprocessing Step (normalize / validate / transform)
  ↓
PromptTemplate (fills {topic})
  ↓
Gemini LLM (generates answer)
  ↓
StringOutputParser (clean string output)
  ↓
Final text response
```

This gives us **full control** over the input before it hits the LLM.

---

# 🧠 Why Custom Steps Matter

Real projects require much more than just sending raw user text to a model.

For example, you may need to:

- Trim bad whitespace  
- Convert to lowercase  
- Check if input is valid  
- Add default values  
- Sanitize user data  
- Pre-process JSON  
- Pre-extract keywords  
- Call external tools (database, search API, etc.)  
- Log inputs  
- Modify state inside multi-agent workflows  

This lesson shows the **foundation of how to do all of that.**

---

# 🔧 Breakdown of Logical Blocks

---

## 🔹 **1. Setup & Model + Prompt + Parser**

We initialize:

- the Gemini LLM  
- the prompt  
- the parser  

This part is identical to previous lessons, but now the chain will be wrapped inside a custom function.

Purpose of these components:

- **PromptTemplate** → formats the question  
- **Model** → generates output  
- **Parser** → returns simple text  

They are the core of the chain.

---

## 🔹 **2. Custom Preprocessing Step (The New Concept)**

Inside the `runChain()` function, we add:

- extra logic  
- transformations  
- validation  
- tools  
- preprocessing  

Example used here:

- Trim extra spaces  
- Convert the topic to lowercase  
- Spread input for flexibility  

This acts as a **“middleware”** before the AI runs.

---

## 🔹 **3. Build + Invoke the Chain Dynamically**

Instead of creating a chain once, we build it inside the function:

```
prompt → model → parser
```

Then we call `.invoke()` with the **normalized** input.

This pattern allows you to:

- plug multiple tools  
- add different models  
- inject dynamic logic  
- add state-aware preprocessing  

This structure is common in production agent systems.

---

## 🔹 **4. Return the Final Clean Output**

After the LLM runs, the parser gives you back a **pure string**, which is perfect for:

- REST responses  
- Socket.io responses  
- UI output  
- Database logs  

Your final output is clean and ready to use.

---

# 🔁 Flow Diagram (Simplified)

```
          ┌─────────────────────────┐
          │  User Input (topic)     │
          └──────────────┬──────────┘
                         ▼
          ┌─────────────────────────┐
          │ Custom Preprocessing     │
          │ (trim, lowercase, etc.) │
          └──────────────┬──────────┘
                         ▼
          ┌─────────────────────────┐
          │ Prompt Template          │
          └──────────────┬──────────┘
                         ▼
          ┌─────────────────────────┐
          │ Gemini 2.0 Flash (LLM)  │
          └──────────────┬──────────┘
                         ▼
          ┌─────────────────────────┐
          │ String Output Parser     │
          └──────────────┬──────────┘
                         ▼
          ┌─────────────────────────┐
          │ Final Clean Text Output │
          └─────────────────────────┘
```

---

# 🌍 Real-World Use Cases

This pattern is used in:

### ✔ AI Chatbots  
Normalize user input before sending to LLM.

### ✔ Agent Systems  
Add search results, database values, or API data before generating answers.

### ✔ RAG  
Embed → retrieve → preprocess → send to prompt → LLM.

### ✔ AI Automations  
Modify user query, add defaults, detect intent.

### ✔ APIs  
Validate payload before processing.

### ✔ Educational or explanation systems  
Convert user text into a clean format before prompting.

---

# ⭐ Why This Lesson Is Important

You have now learned the **most important skill** for building real AI apps:

### 🔥 How to add custom logic BEFORE the LLM.

This is what separates “toy examples” from **production-grade AI pipelines**.

Nearly every advanced feature you’ll build later depends on this:

- Tools  
- Agents  
- Memory  
- Multi-agent orchestration  
- LangGraph nodes  
- Context injection  
- RAG retrieval  
- Input validation  
- Pre/post-processing  

---

# ▶️ Next Chapter  
**Lesson 05 — Embeddings & Vector Basics (Turning text into numbers for search + RAG).**

