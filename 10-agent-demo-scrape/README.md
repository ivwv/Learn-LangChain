# 📘 第10课 — 您的第一个 AI 智能体 (不带工具)

本课程介绍使用 LangChain 的 `createAgent()` 创建**最简单的 AI 智能体**。

在添加工具（网络搜索、抓取器、计算器、Puppeteer 等）之前，
您必须了解：

✔ 什么是智能体 (Agent)
✔ 它是如何运行的
✔ 它是如何响应的
✔ 消息是如何工作的
✔ 如何调用它

本课程教授智能体的**核心思维模型**。

---

# 🧠 什么是智能体 (Agent)？

**智能体** = 一个 AI 模型 + 逐步推理并决定做什么的能力。

普通 LLM：

```
输入 → 输出
```

智能体：

```
输入
  ↓
思考 (规划)
  ↓
工具？(目前没有工具)
  ↓
响应
```

即使没有工具，智能体：

- 维护消息历史
- 逐步推理
- 像聊天机器人一样响应
- 遵循您给定的规则
- 为未来课程的工具使用做准备

本课程将构建最小的可工作的智能体。

---

# 🔥 流程概述 (与代码顺序一致)

```
加载 API 密钥
       ↓
初始化 ChatOpenAI (GPT-4o-mini)
       ↓
创建智能体 (无工具)
       ↓
使用消息调用智能体
       ↓
智能体生成最终响应
```

---

# 🧩 **代码解释 (逐块按精确顺序)**

---

## 🔹 BLOCK 1 — 加载环境变量

```js
import { config } from "dotenv";
config();
```

### ✔ 解释：
加载您的 `.env` 文件，以便您的 OpenAI API 密钥可用。

每个智能体都需要 API 访问。

---

## 🔹 BLOCK 2 — 导入 ChatOpenAI + createAgent

```js
import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";
```

### ✔ 解释：
- `ChatOpenAI` → 智能体使用的 LLM
- `createAgent` → 构建智能体类的函数

没有模型，智能体无法运行。

---

## 🔹 BLOCK 3 — 初始化 LLM 模型

```js
const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});
```

### ✔ 解释：
- `gpt-4o-mini` → 轻量级、快速、廉价的模型
- `temperature: 0` → 确定性响应（无随机性）

这个模型是**智能体的大脑**。

---

## 🔹 BLOCK 4 — 创建智能体 (无工具)

```js
const agent = createAgent({
  model,
  tools: [],
});
```

### ✔ 解释：
您创建了第一个智能体。

- 尚未添加工具
- 行为类似于普通 LLM，但包装在智能体接口中
- 可以处理多轮消息
- 将来可以使用工具（搜索、抓取、浏览器等）进行扩展

这是所有工具驱动智能体的**基础**。

---

## 🔹 BLOCK 5 — 调用智能体

```js
const result = await agent.invoke({
  messages: [
    { role: "user", content: "你好智能体，你是谁？" }
  ]
});
```

### ✔ 解释：
您发送一个**消息数组**——与 ChatGPT API 中使用的结构相同。

- 智能体处理消息
- 生成响应
- 内部存储对话
- 为未来消息做准备

即使没有工具，这行为也像一个聊天机器人。

---

## 🔹 BLOCK 6 — 打印最终智能体响应

```js
console.log(result.messages.at(-1).content);
```

### ✔ 解释：
- `result.messages` = 完整对话
- `.at(-1)` = 最后一条消息 (智能体的答案)
- `.content` = 实际文本

这会打印类似以下内容：

```
你好！我是一个由 GPT-4o-mini 驱动的 AI 智能体。
```

---

# 📌 预期输出 (示例)

您的最终摘要将如下所示：

```
=== 智能体响应 ===

你好！我是一个由 GPT-4o-mini 驱动的 AI 智能体。
今天我能为您提供什么帮助？
```

(确切措辞可能略有不同。)

---

# ▶️ 如何运行

```
node 10-agent-demo-scrape.js
```

确保您的 `.env` 文件包含：

```
OPENAI_API_KEY=your_key_here
```

---

# 🌍 为什么本课很重要

这个小智能体为您准备了：

### ✔ 工具使用
(搜索、抓取、数据库、浏览器)

### ✔ 多步骤规划
(智能体决定下一步做什么)

### ✔ 多智能体系统
(主管 → 工作智能体)

### ✔ LangGraph
(有状态的工作流)

每个真实的智能体应用程序都从**这个基本结构**开始。

---

# ⭐ 下一章
**第11课 — 带工具的智能体 (抓取器 + LLM 总结器)。**
