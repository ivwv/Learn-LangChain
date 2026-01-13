# 📘 第11课 — LangGraph 智能体 (决定 → 抓取 → 总结)

本课程将向您介绍 **LangGraph**，这是 LangChain 中最强大的框架，用于构建：

- 多步骤 AI 工作流
- 多节点推理图
- 多智能体管道
- 确定性 AI 流程
- Perplexity 风格的“推理 → 行动 → 总结”系统

与简单的链不同，LangGraph 为您提供了**节点**、**边**和**状态**，使您能够构建真正的智能体。

在本课程中，我们将构建一个完整的 3 步智能体：

1️⃣ **决定 (DECIDE)** → 从用户消息中提取 URL
2️⃣ **抓取 (SCRAPE)** → 获取并清理网站内容
3️⃣ **总结 (SUMMARIZE)** → 生成 5 个要点总结

本 README 将**完全按照代码的顺序**解释**每个代码块**。

---

# 🧠 什么是 LangGraph？(初学者友好)

LangGraph = “像流程图一样构建 AI 工作流。”

而不是：

```
提示 → 模型 → 输出
```

您构建：

```
节点1 → 节点2 → 节点3 → 节点4
```

其中每个节点：

- 拥有自己的功能
- 接收状态
- 返回更新后的状态
- 将消息传递给下一个节点

这使得您的智能体**可预测**、**可控制**和**模块化**。

LangGraph 是您构建以下系统的方式：

- 多智能体系统
- 浏览器智能体
- RAG 智能体
- 决策者 + 工作者流程
- 复杂自动化智能体

本章是您迈向真正智能体的第一步。

---

# 🔥 完整流程图 (与您的代码匹配)

```
开始
  ↓
[ 决定节点 ]
  │ 提取 URL
  │ 如果没有 URL → 结束
  ↓
[ 抓取节点 ]
  │ 获取网页
  │ 清理 HTML
  ↓
[ 总结节点 ]
  │ 总结成 5 个要点
  ↓
结束
```

---

# 🧩 **代码解释 (逐块按精确顺序)**

---

## 🔹 BLOCK 1 — dotenv 设置 + 导入

```js
import { config } from "dotenv";
config();

import { ChatOpenAI } from "@langchain/openai";
import {
  MessagesAnnotation,
  StateGraph,
  START,
  END,
} from "@langchain/langgraph";
```

### ✔ 解释
- 加载 `.env` (API 密钥)
- 导入 OpenAI LLM
- 导入 LangGraph 组件：
  - **MessagesAnnotation** → 消息如何存储
  - **StateGraph** → 构建节点 + 边
  - **START / END** → 智能体的入口 / 出口点

这是任何 LangGraph 工作流的基础。

---

## 🔹 BLOCK 2 — 模型 (LLM)

```js
const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});
```

### ✔ 解释
- `gpt-4o-mini` = 快速 + 经济的模型
- `temperature: 0` = 可预测的输出
- 此模型用于 **decideNode** 和 **summarizeNode**

这是用于推理的“大脑”。

---

## 🔹 BLOCK 3 — 抓取函数

```js
async function scrapeWebsite(url) {
  try {
    const res = await fetch(url);
    const html = await res.text();
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 2000);
  } catch (err) {
    return `Scrape error: ${err.message}`;
  }
}
```

### ✔ 解释
- 获取 URL
- 移除脚本/样式标签
- 移除 HTML
- 折叠空白符
- 返回 2000 个字符的干净可读文本
- 如果失败 → 返回错误字符串

这为 LLM 总结准备了网站文本。

---

## 🔹 BLOCK 4 — 节点 1: decideNode
从用户消息中提取 URL。

```js
async function decideNode(state) {
  const decision = await model.invoke([
    {
      role: "system",
      content:
        "仅从用户消息中提取 URL。如果不存在，则返回 NOURL。",
    },
    ...state.messages,
  ]);

  const text = decision.content.trim();
  const match = text.match(/https?:\/\/\S+/);
  const url = match ? match[0] : null;

  return {
    messages: [
      ...state.messages,
      { role: "system", content: `URL=${url ?? "NONE"}` },
    ],
  };
}
```

### ✔ 解释
- 将用户消息发送给 LLM
- LLM 提取 URL
- 如果没有 URL → 返回 `NONE`
- 添加消息：`URL=http…`

这个节点**决定**图的流程。

---

## 🔹 BLOCK 5 — 节点 2: scrapeNode
使用提取的 URL 抓取网站。

```js
async function scrapeNode(state) {
  const lastMessage = state.messages.at(-1)?.content || "";
  const match = lastMessage.match(/https?:\/\/\S+/);
  const url = match ? match[0] : null;

  const scraped = await scrapeWebsite(url);

  return {
    messages: [
      ...state.messages,
      { role: "system", content: `SCRAPED=${scraped.slice(0, 50)}...` },
      { role: "system", content: `SCRAPED_FULL=${scraped}` },
    ],
  };
}
```

### ✔ 解释
- 从最后一条消息中读取 URL
- 调用抓取器
- 添加 2 条新消息：
  - 预览 (`SCRAPED=`)
  - 完整内容 (`SCRAPED_FULL=`)

这个节点收集原始数据用于总结。

---

## 🔹 BLOCK 6 — 节点 3: summarizeNode
总结抓取到的文本。

```js
async function summarizeNode(state) {
  const full = state.messages
    .find((m) => m.content.startsWith("SCRAPED_FULL="))
    ?.content.replace("SCRAPED_FULL=", "") ?? "";

  const summary = await model.invoke([
    {
      role: "user",
      content: `将此总结为 5 个要点：\\n${full}`,
    },
  ]);

  return {
    messages: [
      ...state.messages,
      { role: "assistant", content: summary.content },
    ],
  };
}
```

### ✔ 解释
- 提取抓取到的文本
- 发送给 LLM 进行总结
- 将最终总结作为助手消息添加
- 这成为最终输出

---

## 🔹 BLOCK 7 — 构建 LangGraph 工作流

```js
const graph = new StateGraph(MessagesAnnotation)
  .addNode("decide", decideNode)
  .addNode("scrape", scrapeNode)
  .addNode("summarize", summarizeNode);
```

### ✔ 解释
您创建了一个包含 3 个节点的管道：

```
决定 → 抓取 → 总结
```

这些节点定义了智能体的“大脑”。

---

## 🔹 BLOCK 8 — 添加边 (流程控制)

```js
graph.addEdge(START, "decide");

graph.addConditionalEdges("decide", (state) => {
  const last = state.messages.at(-1)?.content || "";
  return last.includes("URL=http") ? "scrape" : END;
});

graph.addEdge("scrape", "summarize");
graph.addEdge("summarize", END);
```

### ✔ 解释
- 开始 → 决定
- 如果找到 URL → 进入抓取
- 否则 → 结束
- 抓取 → 总结
- 总结 → 结束

这提供了真实的条件逻辑 (条件流)。

---

## 🔹 BLOCK 9 — 编译智能体

```js
const agent = graph.compile();
```

### ✔ 解释
将您的工作流图转换为可运行的智能体。

---

## 🔹 BLOCK 10 — 调用智能体

```js
const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "抓取 https://webreal.in 并总结它。",
    },
  ],
});
```

### ✔ 解释
您向智能体提供包含 URL 的消息。
智能体执行：

1. 提取 URL
2. 抓取
3. 总结

---

## 🔹 BLOCK 11 — 打印最终总结

```js
console.log(result.messages.at(-1).content);
```

### ✔ 解释
输出最终的助手消息 → **要点总结**。

---

# 📌 预期输出 (示例)

```
• WebReal 是一个提供网站开发服务的现代网络机构。
• 提供品牌塑造、UI/UX 和数字产品开发。
• 该网站面向希望建立专业在线形象的企业。
• 布局简洁明了，突出专业性。
• 包括作品集、联系信息和服务类别。
```



# ▶️ 如何使用

## 1️⃣ 安装依赖
```
npm install
```

## 2️⃣ 添加 API 密钥
```
OPENAI_API_KEY=your_key_here
```

## 3️⃣ 运行
```
node 11-agent-langgraph.js
```

---

# 🌍 实际应用

这个 3 节点图与以下系统使用相同的结构：

### ✔ Perplexity (搜索 → 抓取 → 总结)
### ✔ 多智能体研究助手
### ✔ 浏览器自动化智能体
### ✔ 工作流管道 (获取 → 分析 → 决定)
### ✔ 数字营销分析器
### ✔ 新闻总结器
### ✔ 竞争对手分析机器人
### ✔ SEO 审计工具

本课是您的第一个真正的 **LangGraph 智能体**。

---

# ⭐ 下一课
**第12课 — 多智能体系统 (主管 → 工作者)。**
