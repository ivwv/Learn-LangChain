# 📘 第 01 课 — 理解提示模板 (逐行解释)

本课将教授 LangChain JS **最基础也是最重要的概念**：

✔ 如何加载环境变量
✔ 如何初始化 Gemini LLM
✔ 如何使用 PromptTemplate
✔ 如何用动态输入填充模板
✔ 如何运行模型并读取响应

每一行代码都将进行解释，以便您完全理解其工作原理。

---

# 🎯 目的

大型语言模型 (LLMs) 需要**提示 (prompts)**，但手动编写字符串会很混乱。
我们通过使用 LangChain 的 **PromptTemplate** 来解决这个问题，它允许：

- 整洁的格式
- 动态输入（例如 `{topic}`）
- 可重用性
- 一致的结构
- 无错误的提示

这是所有 AI 应用的**第一个构建块**。

---

# 🔥 逐行代码解释

### **1️⃣ 加载 .env 变量**

```js
import { config } from "dotenv";
config();
```

✔ `dotenv` 用于从 `.env` 文件加载密钥（API keys）。
✔ `config()` 告诉 Node.js 读取 `.env` 文件并将变量添加到 `process.env`。

如果没有这一步，您的 `GEMINI_API_KEY` 将无法加载。

---

### **2️⃣ 导入 Gemini 模型**

```js
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
```

✔ 这将导入 **ChatGoogleGenerativeAI** 类。
✔ 它允许 LangChain 与 Google 的 Gemini 2.0 Flash 模型进行通信。

---

### **3️⃣ 导入 PromptTemplate**

```js
import { PromptTemplate } from "@langchain/core/prompts";
```

✔ 这使您能够创建带有占位符的动态文本提示 (prompts)。
✔ 例如 `"解释 {topic}"`。

---

### **4️⃣ 初始化 Gemini LLM**

```js
const model = new ChatGoogleGenerativedAI({
  model: "gemini-2.0-flash",
  apiKey: process.env.GEMINI_API_KEY,
});
```

分解：

- `model:` → 选择模型版本。
- `"gemini-2.0-flash"` → Google 最新且快速的模型（非常适合聊天和推理）。
- `apiKey:` → 从 `.env` 文件加载您的 API key。

现在，这个对象代表了您的 AI 大脑。

---

### **5️⃣ 创建提示模板 (Prompt Template)**

```js
const prompt = PromptTemplate.fromTemplate(`
    explain me {topic} , like ELI5
    `);
```

分解：

- `PromptTemplate.fromTemplate` 创建一个结构化的提示 (prompt)。
- `{topic}` 是一个变量占位符。
- 您可以针对任何主题重复使用此模板。

填充后的示例输出：

```
explain me ice cream, like ELI5
```

---

### **6️⃣ 打印模板 (可选)**

```js
console.log("prompt without fill", prompt);
```

✔ 这显示了模板对象的结构。
✔ 帮助您理解 LangChain 在幕后创建了什么。

---

### **7️⃣ 创建一个用于执行的异步函数**

```js
async function run(){
```

✔ 模型调用是异步的 (async) → 它们返回 `Promise`。
✔ 我们将逻辑封装在 `run()` 中，以便我们可以 `await` 所有操作。

---

### **8️⃣ 填充模板**

```js
const filledPrompt = await prompt.format({ topic: "ice cream" });
console.log(filledPrompt);
```

分解：

- `prompt.format()` → 将 `{topic}` 替换为 `"ice cream"`。
- 现在生成了最终的、准备发送的文本。
- `console.log()` 打印：

```
explain me ice cream , like ELI5
```

这是发送给 LLM 的**确切**提示 (prompt)。

---

### **9️⃣ 调用模型**

```js
const res = await model.invoke(filledPrompt);
```

分解：

- `model.invoke()` 将提示 (prompt) 发送给 Gemini。
- Gemini 处理它并返回一个结构化的响应对象。

在响应中：

- `res.content` → 包含实际的文本回复。
- 其他元数据 (metadata)，例如 `tokens`，也可能存在。

---

### **🔟 打印最终响应**

```js
console.log(res.content);
```

✔ 这会打印 AI 的回答。
✔ 示例：

```
Ice cream is a cold sweet dessert made by freezing milk...
```

---

### **1️⃣1️⃣ 启动函数**

```js
run().catch(console.error);
```

✔ 运行 `run()` 函数。
✔ 捕获错误（例如，缺少 API key）。

---

# 💡 完整代码 (回顾)

```js
import { config } from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
config();

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  apiKey: process.env.GEMINI_API_KEY,
});

const prompt = PromptTemplate.fromTemplate(`
    explain me {topic} , like ELI5
    `);

console.log("prompt without fill", prompt);

async function run() {
  const filledPrompt = await prompt.format({ topic: "ice cream" });
  console.log(filledPrompt);

  const res = await model.invoke(filledPrompt);
  console.log(res.content);
}

run().catch(console.error);
```

---

# 🧠 流程图

```
┌────────────────────┐
│  .env (API KEY)     │
└──────────┬──────────┘
           │ 加载
           ▼
┌────────────────────┐
│  Gemini 模型初始化  │
└──────────┬──────────┘
           │ 使用
           ▼
┌──────────────────────────────┐
│ 提示模板 "解释 {topic}"         │
└──────────┬───────────────────┘
           │ 格式化({topic})
           ▼
┌──────────────────────┐
│ 填充后的提示           │
└──────────┬───────────┘
           │ 调用 invoke()
           ▼
┌──────────────────────┐
│ Gemini 响应          │
└──────────────────────┘
```

---

# 🚀 如何运行

### 1. 安装所需包

```
npm install
```

### 2. 在根目录创建 `.env` 文件

```
GEMINI_API_KEY=your_api_key_here
```

### 3. 运行文件

```
node 01-prompt-chain.js
```

---

# 🌍 实际应用场景

- 自动化解释
- 教育机器人
- 客户支持回复
- 简单的问答系统
- 动态内容生成
- 带有变量的邮件草稿
- 多步骤 AI 工作流

---

# ⭐ 下一章

继续学习 **02 — 基本管道流 (Basic Pipe Flow)**。
