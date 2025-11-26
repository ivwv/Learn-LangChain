# 📘 Lesson 08 — Web Scraper Tool (with RunnableLambda + Zod Validation)

In this lesson, we build a **real production-grade tool**:  
A **Website Scraper Tool** that fetches a webpage, cleans it, and returns readable text.

This tool will later be used by agents to:

- read websites  
- answer questions from URLs  
- automate research  
- do Perplexity-style multi-tool workflows  

The README explains each code block **in the exact same sequence as your code**.

---

# 🚀 What We Build in This Lesson (Flow Overview)

1️⃣ Validate the input (URL) using Zod  
2️⃣ Create a scraper tool using RunnableLambda  
3️⃣ Fetch the website  
4️⃣ Strip HTML tags, scripts, styles  
5️⃣ Return clean, readable text  
6️⃣ Test the tool using `.invoke()`  

This is a **real, useful** tool — not a toy example.

---

# 🔁 Flow Diagram (Simple)

```
User sends URL
      ↓
Zod Validation (checks URL format)
      ↓
Fetch webpage HTML
      ↓
Remove <script>, <style>, HTML tags
      ↓
Clean + Normalize Text
      ↓
Return structured result { success, content }
```

---

# 🧩 **Code Explanation (Block-by-Block, EXACT CODE ORDER)**

---

## 🔹 **BLOCK 1 — Import RunnableLambda + Zod**

```js
import { RunnableLambda } from "@langchain/core/runnables";
import { z } from "zod";
```

### ✔ Explanation:
- `RunnableLambda` → converts any JS function into a LangChain tool  
- `zod` → validates input (we ensure `url` is a valid URL)

Using Zod is **production best practice**:
- prevents errors  
- prevents injection attacks  
- ensures tool receives correct parameters  

---

## 🔹 **BLOCK 2 — Create Zod Schema for Input Validation**

```js
const schema = z.object({
  url: z.string().url(),
});
```

### ✔ Explanation:
We define what valid input should look like:

- Input must be an object  
- It must contain a `url` field  
- That field must be a valid URL  

If the user (or LLM) sends bad input →  
the schema throws a clean, helpful error.

---

## 🔹 **BLOCK 3 — Create the Web Scraping Tool**

```js
export const scrapeWebsite = RunnableLambda.from(async (input) => {
  const { url } = schema.parse(input);
```

### ✔ Explanation:
- Wrap our function with RunnableLambda → becomes a LangChain tool  
- First step: validate the user input using Zod (`schema.parse()`)

If the input is invalid → function stops immediately.  
If valid → we continue.

---

## 🔹 **BLOCK 4 — Fetch the Website**

```js
const res = await fetch(url);

if (!res.ok) {
  return {
    success: false,
    error: `Failed to fetch URL. Status: ${res.status}`
  };
}
```

### ✔ Explanation:
We make an HTTP request to the given URL.

- If site is down → return `{success:false}`  
- If page doesn't exist → return error  
- No crashing or unhandled exceptions  

This makes the scraper **safe** and **reliable**.

---

## 🔹 **BLOCK 5 — Read HTML**

```js
const html = await res.text();
```

### ✔ Explanation:
We extract the raw HTML of the webpage.

Example:

```
<html>
  <head>...</head>
  <body>Hello</body>
</html>
```

We will clean it next.

---

## 🔹 **BLOCK 6 — Clean the HTML and Extract Plain Text**

```js
const text = html
  .replace(/<script[\s\S]*?<\/script>/gi, "")
  .replace(/<style[\s\S]*?<\/style>/gi, "")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ")
  .trim();
```

### ✔ Explanation:

This block removes:

- `<script> ... </script>`  
- `<style> ... </style>`  
- All HTML tags `<div>`, `<h1>`, `<p>`  
- Extra spaces  
- Newlines  
- Whitespace noise  

Result = **clean readable text**, perfect for passing to an LLM.

Example:

```
"Welcome to my website This is the home page"
```

This is EXACTLY how Perplexity, GPT-browser tools, and research agents work.

---

## 🔹 **BLOCK 7 — Return a Structured Response**

```js
return {
  success: true,
  url,
  content: text.slice(0, 3000),
};
```

### ✔ Explanation:
We return a JSON result with:

- `success` → true  
- `url` → the URL scraped  
- `content` → first 3000 chars of cleaned text  

Why 3000?

- Prevents overloading LLM  
- Keeps responses fast  
- Works well with Perplexity-style agents  

---

## 🔹 **BLOCK 8 — Error Handling (Fail-Safe)**

```js
} catch (err) {
  return {
    success: false,
    error: err.message,
  };
}
```

### ✔ Explanation:
If fetch crashes or URL is invalid →  
we catch the error and return a **clean**, LLM-friendly error object.

This prevents agent crashes.

---

## 🔹 **BLOCK 9 — Testing the Tool**

```js
const result = await scrapeWebsite.invoke({
  url: "https://webreal.in",
});
console.log(result);
```

### ✔ Explanation:
We test our tool by scraping `webreal.in`.

`.invoke()` is the universal LangChain execution method.

Result printed will look like:

```
{
  success: true,
  url: "...",
  content: "clean scraped text..."
}
```

---

# 🌍 Real-World Use Cases

This tool is the foundation of:

### ✔ Perplexity-style web research agents  
### ✔ Multi-agent research flows  
### ✔ Site QA bots  
### ✔ SEO analyzers  
### ✔ News scrapers  
### ✔ Competitor analysis bots  
### ✔ Auto-summary pipelines  
### ✔ Fact-checking agents  

You will later plug this scraper into an **agent with reasoning**, and it will automatically:

- decide which URL to scrape  
- scrape it  
- read content  
- answer using RAG  

---

# ▶️ How to Run

```
node 08-tool-scrape.js
```

---

# ⭐ Next Chapter  
**Lesson 09 — Using an LLM as a Tool (AI calling another AI).**

