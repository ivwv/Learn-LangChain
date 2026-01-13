# 📘 第06课 — RAG (检索增强生成) 逐块解释

本课程将**精确地教授一个基本的 RAG 管道如何工作**，按照您编写代码的*相同顺序*进行解释。
每个代码块下面都有相应的解释。

这是学习 RAG 最清晰、最简单的方式。

---

# 🧠 代码之前：什么是 RAG？

RAG = **检索增强生成 (Retrieval Augmented Generation)**

这意味着：

1️⃣ AI 从您的文档中检索相关信息
2️⃣ AI 将该信息注入到提示中
3️⃣ AI **仅**使用该信息进行回答

因此，模型停止幻觉，开始基于事实回答。

RAG = *AI 在回答之前读取您的数据*。

用于：

- Perplexity
- ChatGPT 检索
- 带有记忆的 AI 聊天机器人
- 企业搜索
- 文档问答
- 多智能体知识系统

---

# 🔥 完整管道图 (与代码顺序一致)

```
加载 API 密钥
       ↓
初始化 LLM
       ↓
初始化嵌入模型
       ↓
创建向量存储
       ↓
种子文档
       ↓
用户提问
       ↓
相似性搜索 (找到最佳文档)
       ↓
合并文档 → 上下文
       ↓
构建 RAG 提示 (上下文 + 问题)
       ↓
LLM 生成最终答案
```

---

# 🧩 **代码逐块解释 (按您的顺序)**

---

## 🔹 **BLOCK 1 — 导入 + dotenv 设置**
```js
import { config } from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

config();
```

### ✔ 此块的作用：
- 加载 `.env` 文件，使 API 密钥生效
- 导入：
  - LLM
  - 嵌入模型
  - 向量存储
  - 提示模板
  - 输出解析器

**这是任何 RAG 管道所需的设置。**

---

## 🔹 **BLOCK 2 — 创建 LLM (Gemini 2.0 Flash)**

```js
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  apiKey: process.env.GEMINI_API_KEY,
});
```

### ✔ 解释：
这是将生成最终答案的 **AI 大脑**。
除非您将上下文传递到其提示中，否则它不会知道您的文档。

---

## 🔹 **BLOCK 3 — 创建嵌入模型**

```js
const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004",
  apiKey: process.env.GEMINI_API_KEY,
});
```

### ✔ 解释：
嵌入将文本 → 向量（数字数组）。
这允许**语义搜索**（按含义搜索）。

示例：
“谁想要 15 LPA？”匹配“Paresh 的目标是 15 LPA。”

---

## 🔹 **BLOCK 4 — 创建向量存储 (内存数据库)**

```js
const vectorStore = new MemoryVectorStore(embeddings);
```

### ✔ 解释：
- 存储文本嵌入
- 让您检索相似文档
- 功能类似 Pinecone，但 100% 在本地运行
- 快速，非常适合学习 RAG

这充当您 **AI 的长期记忆**。

---

## 🔹 **BLOCK 5 — 用文档填充记忆**

```js
await vectorStore.addDocuments([
  { pageContent: "Paresh 正在使用 LangChain、Puppeteer 和 Pinecone 构建一个 Agentic AI 后端操作系统。" },
  { pageContent: "Paresh 的目标是通过掌握 MERN、AI、智能体和 RAG 达到 15 LPA 的薪资待遇。" },
  { pageContent: "LangChain Runnables 和工具帮助创建 Perplexity 风格的 AI 系统。" },
]);
```

### ✔ 解释：
这些文档成为您 RAG 系统的**知识库**。

每个文档都被嵌入并存储在向量记忆中。

现在 AI 可以“记住”这些事实。

---

## 🔹 **BLOCK 6 — 用户提问**

```js
const question = "谁试图达到 15 LPA，他在建造什么？为什么？";
```

### ✔ 解释：
需要理解 + 事实检索的用户查询。

---

## 🔹 **BLOCK 7 — 检索相似文档**

```js
const similarDocs = await vectorStore.similaritySearch(question, 3);
```

### ✔ 解释：
此步骤：

- 嵌入问题
- 将其与所有存储的文档向量进行比较
- 返回**前 3 个语义相似的文档**

这是 RAG 的“检索 (Retrieval)”部分。

---

## 🔹 **BLOCK 8 — 将检索到的文档合并到上下文中**

```js
const context = similarDocs.map(d => d.pageContent).join("\\n");
```

### ✔ 解释：
我们将所有检索到的文档转换为一个大的上下文块。

LLM 无法读取数据库 → 我们必须将上下文注入到提示中。

---

## 🔹 **BLOCK 9 — 构建 RAG 提示**

```js
const prompt = PromptTemplate.fromTemplate(`
使用上下文回答。

上下文:
{context}

问题:
{question}

答案:
`);
```

### ✔ 解释：
此模板强制 AI：

- 使用提供的上下文
- 不产生幻觉
- 清晰地回答
- 基于事实

这完成了 RAG 的“增强 (Augmented)”部分。

---

## 🔹 **BLOCK 10 — 构建链 (提示 → 模型 → 解析器)**

```js
const chain = prompt.pipe(model).pipe(new StringOutputParser());
```

### ✔ 解释：
这将整个 RAG 管道转换为一个简单的链：

```
输入 → 填充提示 → 运行 LLM → 解析字符串 → 最终答案
```

---

## 🔹 **BLOCK 11 — 获取最终答案**

```js
const answer = await chain.invoke({ context, question });
```

### ✔ 解释：
我们传递：

- 检索到的上下文
- 问题

→ AI 返回一个干净、事实的答案。

---

## 🔹 **BLOCK 12 — 打印答案**

```js
console.log(answer);
```

### ✔ 解释：
这是您 RAG 管道的最终输出。

---

# 🌍 实际用例

- Perplexity 风格搜索
- 读取您内容的聊天机器人
- 文档问答
- 企业知识助手
- 产品搜索
- 简历/职位匹配
- 具有真实记忆的 AI 助手

每个真实的 AI 应用都使用某种形式的 RAG。

---

# ⭐ 下一章
**第07课 — 工具基础**
