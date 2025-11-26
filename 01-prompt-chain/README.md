# 📘 Lesson 01 — Understanding Prompt Templates (Explained Line by Line)

This lesson teaches the **most basic and most important foundation** of LangChain JS:

✔ How to load environment variables  
✔ How to initialize the Gemini LLM  
✔ How to use PromptTemplate  
✔ How to fill a template with dynamic inputs  
✔ How to run the model and read the response  

Every single line of code is explained so you fully understand what’s happening.

---

# 🎯 Purpose

LLMs require **prompts**, but manually writing strings is messy.  
We solve this by using LangChain’s **PromptTemplate**, which allows:

- Clean formatting  
- Dynamic input (like `{topic}`)  
- Reusability  
- Consistent structure  
- Error-free prompts  

This is the **first building block** of all AI apps.

---

# 🔥 Line-by-Line Code Explanation

### **1️⃣ Load .env variables**
```js
import {config} from 'dotenv';
config();
```

✔ `dotenv` is used to load secrets (API keys) from `.env`.  
✔ `config()` tells Node.js to read `.env` and add variables to `process.env`.

Without this, your `GEMINI_API_KEY` won’t load.

---

### **2️⃣ Import Gemini Model**
```js
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
```

✔ This imports the **ChatGoogleGenerativeAI** class.  
✔ It allows LangChain to communicate with Google’s Gemini 2.0 Flash model.

---

### **3️⃣ Import PromptTemplate**
```js
import { PromptTemplate } from '@langchain/core/prompts';
```

✔ This gives you the ability to create dynamic text prompts with placeholders.  
✔ Like `"Explain {topic}"`.

---

### **4️⃣ Initialize the Gemini LLM**
```js
const model = new ChatGoogleGenerativeAI({
    model:"gemini-2.0-flash",
    apiKey:process.env.GEMINI_API_KEY
})
```

Breakdown:

- `model:` → selects the model version.
- `"gemini-2.0-flash"` → Google’s latest fast model (amazing for chat + reasoning).
- `apiKey:` → loads your API key from `.env`.

This object now represents your AI brain.

---

### **5️⃣ Create a Prompt Template**
```js
const prompt = PromptTemplate.fromTemplate(`
    explain me {topic} , like ELI5
    `)
```

Breakdown:

- `PromptTemplate.fromTemplate` creates a structured prompt.
- `{topic}` is a variable placeholder.
- You can reuse this template for any topic.

Example output after filling:
```
explain me ice cream, like ELI5
```

---

### **6️⃣ Log the template (optional)**
```js
console.log("prompt without fill", prompt)
```

✔ This shows the template object structure.  
✔ Helps you understand what LangChain creates behind the scenes.

---

### **7️⃣ Create an async function for execution**
```js
async function run(){
```

✔ Model calls are async → they return `Promise`s.  
✔ We wrap the logic inside `run()` so we can `await` everything.

---

### **8️⃣ Fill the template**
```js
const filledPrompt = await prompt.format({topic:"ice cream"})
console.log(filledPrompt)
```

Breakdown:

- `prompt.format()` → replaces `{topic}` with `"ice cream"`.
- Now the final ready-to-send text is generated.
- `console.log()` prints:

```
explain me ice cream , like ELI5
```

This is the EXACT prompt sent to the LLM.

---

### **9️⃣ Invoke the model**
```js
const res = await model.invoke(filledPrompt)
```

Breakdown:

- `model.invoke()` sends the prompt to Gemini.
- Gemini processes it and returns a structured response object.

Inside the response:
- `res.content` → contains the actual text reply.
- Other metadata like tokens may also be present.

---

### **🔟 Print the final response**
```js
console.log(res.content)
```

✔ This prints the AI’s answer.  
✔ Example:

```
Ice cream is a cold sweet dessert made by freezing milk...
```

---

### **1️⃣1️⃣ Start the function**
```js
run().catch(console.error)
```

✔ Runs the `run()` function.  
✔ Catches errors (for example, missing API key).

---

# 💡 Full Code (Refresher)

```js
import {config} from 'dotenv';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from '@langchain/core/prompts';
config()

const model = new ChatGoogleGenerativeAI({
    model:"gemini-2.0-flash",
    apiKey:process.env.GEMINI_API_KEY
})

const prompt = PromptTemplate.fromTemplate(`
    explain me {topic} , like ELI5
    `)

console.log("prompt without fill", prompt)

async function run(){
    const filledPrompt = await prompt.format({topic:"ice cream"})
    console.log(filledPrompt)

    const res = await model.invoke(filledPrompt)
    console.log(res.content)
}

run().catch(console.error)
```

---

# 🧠 Flow Diagram

```
┌────────────────────┐
│  .env (API KEY)     │
└──────────┬──────────┘
           │ loads
           ▼
┌────────────────────┐
│  Gemini Model Init  │
└──────────┬──────────┘
           │ uses
           ▼
┌──────────────────────────────┐
│ Prompt Template "Explain {topic}" │
└──────────┬───────────────────┘
           │ format({topic})
           ▼
┌──────────────────────┐
│ Filled Prompt         │
└──────────┬───────────┘
           │ invoke()
           ▼
┌──────────────────────┐
│ Gemini Response       │
└──────────────────────┘
```

---

# 🚀 How to Run

### 1. Install required packages
```
npm install
```

### 2. Create `.env` file in root
```
GEMINI_API_KEY=your_api_key_here
```

### 3. Run the file
```
node 01-prompt-chain.js
```

---

# 🌍 Real-World Use Cases

- Automated explanations  
- Educational bots  
- Customer support replies  
- Simple Q&A systems  
- Dynamic content generators  
- Email drafting with variables  
- Multi-step AI workflows  

---

# ⭐ Next Chapter
Proceed to **02 — Basic Pipe Flow**.

