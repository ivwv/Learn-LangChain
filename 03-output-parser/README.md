# 📘 第 03 课 — 使用输出解析器将 LLM 输出转换为干净的字符串

在本课程中，我们将通过添加 **StringOutputParser** 来扩展我们之前的链，确保 AI 响应成为一个**简单、干净、即用型字符串**。

这对于实际应用场景非常重要，例如：

- REST API
- Socket.io 聊天消息
- 前端响应
- 存储到数据库
- 日志记录和调试
- 多步骤 AI 工作流

---

# 🚀 本课将做什么 (流程概述)

本课将构建一个包含**三个步骤**的链：

1️⃣ **提示模板 (Prompt Template)**
→ 使用 `{topic}` 创建动态输入文本。

2️⃣ **LLM 模型 (Gemini 2.0 Flash)**
→ 生成响应。

3️⃣ **字符串输出解析器 (StringOutputParser)**
→ 将模型的复杂响应对象转换为**纯字符串**。

最终，链的结构如下：

```
输入 → 格式化提示 → LLM → 原始输出 → 解析 → 干净字符串
```

---

# 🔁 流程图

```
用户输入 ({ topic: "冰淇淋" })
            │
            ▼
提示模板 (PromptTemplate)
"请像向一个5岁小孩解释一样，解释冰淇淋"
            │
            ▼
Gemini 模型 (LLM)
      原始结构化响应
            │
            ▼
字符串输出解析器 (StringOutputParser)
      干净的字符串输出
            │
            ▼
"纯文本解释"
```

---

# 🧠 代码按逻辑块解释

---

## 🔹 **1. 设置：环境 + 导入**

```js
import { config } from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

config();
```

### ✔ 此块的作用

- 加载您的 `.env` 文件
- 导入：
  - Gemini 模型
  - 提示模板
  - 字符串输出解析器

这为构建链准备了所需的一切。

---

## 🔹 **2. 初始化 Gemini 模型**

```js
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  apiKey: process.env.GEMINI_API_KEY,
});
```

### ✔ 此块存在的原因

- 创建 Gemini 2.0 Flash 实例
- 快速 + 便宜 → 非常适合测试和链式操作
- 需要您 `.env` 文件中的 API 密钥

---

## 🔹 **3. 创建提示模板 (Prompt Template)**

```js
const prompt = PromptTemplate.fromTemplate(`
    请像向一个5岁小孩解释一样，解释一下 {topic}。`);
```

### ✔ 此块的作用

- `{topic}` 是动态的
- LangChain 在运行链时自动填充它
- 使提示清晰且可重用

---

## 🔹 **4. 创建输出解析器 (Output Parser)**

```js
const parser = new StringOutputParser();
```

### ✔ 此块存在的原因

LLM 的原始响应通常看起来像这样：

```
{
  id: "...",
  content: [ { text: "冰淇淋是一种甜冷的..." } ],
  metadata: {...},
  ...
}
```

这对于以下情况来说太混乱了：

- API 响应
- Socket.io
- 数据库
- 日志记录
- 进一步的 LLM 处理

`StringOutputParser` 将其简化为**仅**：

```
"冰淇淋是一种甜冷的甜点..."
```

---

## 🔹 **5. 构建完整链**

```js
const chain = prompt.pipe(model).pipe(parser);
```

### ✔ `.pipe()` 在这里的作用

- 第一个 `.pipe(model)` →
  提示 → 模型 → 原始响应
- 第二个 `.pipe(parser)` →
  原始响应 → 干净字符串

最终链：

```
输入 → 模板 → 模型 → 解析器 → 输出字符串
```

这就是专业、模块化 AI 管道的构建方式。

---

## 🔹 **6. 运行链**

```js
const response = await chain.invoke({ topic: "冰淇淋" });
```

### ✔ 为什么这很强大

- 您**只传递输入**
- LangChain 内部自动执行：
  1. 填充 `{topic}`
  2. 调用 Gemini
  3. 将结果解析为字符串

无需手动格式化
无需混乱的响应提取
无需 `.format()`
无需深入 `.content`
只需**纯文本**输出。

---

## 🔹 **7. 打印最终输出**

```js
console.log("\n最终字符串输出:\n");
console.log(response);
```

### ✔ 您将得到什么

一个纯粹、干净的字符串，例如：

```
冰淇淋是一种由牛奶制成的甜冷冻甜点...
```

非常适合任何实际应用。

---

# 📦 完整代码 (参考)

```js
import { config } from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

config();

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  apiKey: process.env.GEMINI_API_KEY,
});

const prompt = PromptTemplate.fromTemplate(`
    请像向一个5岁小孩解释一样，解释一下 {topic}。`);

const parser = new StringOutputParser();

const chain = prompt.pipe(model).pipe(parser);

async function run() {
  const response = await chain.invoke({ topic: "冰淇淋" });
  console.log("\n最终字符串输出:\n");
  console.log(response);
}

run().catch(console.error);

// 现在文本直接是一个字符串 -> 非常适合您的 socket.io / REST 响应。
```

---

# ▶️ 如何运行

```
node 03-output-parser.js
```

请确保您的 `.env` 文件包含：

```
GEMINI_API_KEY=your_api_key_here
```

---

# 🌍 实际应用场景

- 非常适合 REST API 响应
- 聊天应用 (Socket.io)
- 直接将 LLM 输出存储到数据库
- 链式连接到另一个模型
- 在另一个工具中使用 LLM 输出
- 日志记录和调试
- AI 助手 / 聊天机器人
- 使用 LangChain 构建干净的管道

输出解析器使您的流程**干净、可预测且可用于生产环境**。

---

# ⭐ 下一章

继续学习 **第 04 课 — 自定义步骤和 AI 前/后数据转换**。
