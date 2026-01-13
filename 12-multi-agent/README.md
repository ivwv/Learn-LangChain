# 📘 第12课 — 多智能体系统 (规划器 → 抓取/搜索 → 总结)

本课程将教您如何使用 LangGraph 构建**您的第一个多智能体系统**。

您将创建：

1️⃣ 一个**规划器智能体 (PLANNER AGENT)** → 决定使用哪个工具
2️⃣ 一个**抓取器智能体 (SCRAPER AGENT)** → 获取网站文本
3️⃣ 一个**搜索智能体 (SEARCH AGENT)** → 返回虚假搜索数据
4️⃣ 一个**总结器智能体 (SUMMARIZER AGENT)** → 生成最终答案

这与大型智能体系统的工作方式**完全一致**：

- Perplexity
- Devin / OpenDevin
- AutoGPT
- CrewAI
- LangGraph 智能体

每个“智能体” = 一个节点，一个责任。

---

# 🔥 完整流程图 (与代码匹配)

```
开始
  ↓
[ 规划 ]
  ↓
 ┌──────────────┬──────────────┐
 ↓              ↓              ↓
抓取            搜索           总结 (直接)
  ↓              ↓
        总结
             ↓
            结束
```

---

# 🧩 逐块解释代码 (带代码)

---

## 🔹 BLOCK 1 — dotenv 设置 & 导入

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
- 加载环境变量
- 导入 **GPT-4o-mini** 和所有 LangGraph 组件
- 这些是多节点智能体工作流的必需品

---

## 🔹 BLOCK 2 — 模型 (用于规划器 + 总结的 LLM)

```js
const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});
```

### ✔ 解释
- 快速且可预测的模型
- 用于**规划决策**和**摘要生成**
- 温度 0 = 无随机性

---

## 🔹 BLOCK 3 — 虚假搜索工具 (仅限演示)

```js
async function fakeSearch(query) {
  return `Search results for: ${query}
1) Google 2023 收入为 $307B。
2) Alphabet 增长了 9%。
(虚假演示数据)
`;
}
```

### ✔ 解释
- 模拟搜索引擎
- 在真实的智能体中：替换为 Tavily、Bing、SerpAPI 等
- 当用户询问事实性查询时，帮助规划器选择**搜索**

---

## 🔹 BLOCK 4 — 抓取工具

```js
async function scrapeWebsite(url) {
  try {
    const res = await fetch(url);
    const html = await res.text();
    return html.replace(/<[^>]+>/g, " ").trim().slice(0, 1500);
  } catch {
    return "抓取错误";
  }
}
```

### ✔ 解释
- 获取 URL
- 移除 HTML 标签
- 清理文本
- 限制为 1500 个字符
- 当规划器选择 `"scrape"` 时使用

---

## 🔹 BLOCK 5 — 节点 1: 规划器智能体 (PLANNER AGENT)
决定使用哪个工具：**抓取 | 搜索 | 数学 | 总结**

```js
async function plannerNode(state) {
  const decision = await model.invoke([
    {
      role: "system",
      content:
        "你是一个工具决策者。只输出以下单词之一：scrape, search, math, summarize。",
    },
    ...state.messages,
  ]);

  const mode = decision.content.trim().toLowerCase();

  return {
    messages: [
      ...state.messages,
      { role: "system", content: `PLAN=${mode}` },
    ],
  };
}
```

### ✔ 解释
- 获取用户消息
- LLM 决定所需的操作
- 将计划存储为：
  ```
  PLAN=search
  ```

这是**主管智能体 (Supervisor Agent)**。

---

## 🔹 BLOCK 6 — 节点 2: 抓取智能体 (SCRAPE AGENT)

```js
async function scrapeNode(state) {
  const last = state.messages.at(-1).content;
  const url = last.match(/https?:\/\/\S+/)?.[0];

  const text = await scrapeWebsite(url);

  return {
    messages: [
      ...state.messages,
      { role: "system", content: `SCRAPED=${text}` },
    ],
  };
}
```

### ✔ 解释
- 从最后一条消息中提取 URL
- 调用抓取工具
- 将抓取到的文本保存到状态中

---

## 🔹 BLOCK 7 — 节点 3: 搜索智能体 (SEARCH AGENT)

```js
async function searchNode(state) {
  const lastUser = state.messages.find((m) => m.role === "user")?.content;
  const result = await fakeSearch(lastUser);

  return {
    messages: [
      ...state.messages,
      { role: "system", content: `SEARCHED=${result}` },
    ],
  };
}
```

### ✔ 解释
- 获取**原始用户查询**
- 运行虚假搜索
- 保存搜索结果
- 与 Perplexity 的搜索工具非常相似

---

## 🔹 BLOCK 8 — 节点 4: 总结器智能体 (SUMMARIZER AGENT)
将最终工具输出组合成简洁的摘要。

```js
async function summarizeNode(state) {
  const data = state.messages.find((m) =>
    m.content.startsWith("SCRAPED=") || m.content.startsWith("SEARCHED=")
  )?.content.replace("SCRAPED=", "").replace("SEARCHED=", "");

  const summary = await model.invoke([
    { role: "user", content: `总结:\n${data}` },
  ]);

  return {
    messages: [...state.messages, { role: "assistant", content: summary.content }],
  };
}
```

### ✔ 解释
- 读取**抓取**或**搜索**的输出
- 请求 LLM 生成结构化摘要
- 添加**最终助手消息**

---

## 🔹 BLOCK 9 — 构建多智能体图

```js
const graph = new StateGraph(MessagesAnnotation)
  .addNode("plan", plannerNode)
  .addNode("scrape", scrapeNode)
  .addNode("search", searchNode)
  .addNode("summarize", summarizeNode);
```

### ✔ 解释
您注册所有智能体/节点：

```
计划 → 抓取 → 搜索 → 总结
```

这是您的多智能体“公司”。

---

## 🔹 BLOCK 10 — 流程逻辑 (条件路由)

```js
graph.addEdge(START, "plan");

graph.addConditionalEdges("plan", (state) => {
  const last = state.messages.at(-1).content;
  if (last.includes("scrape")) return "scrape";
  if (last.includes("search")) return "search";
  if (last.includes("summarize")) return "summarize";
  return END;
});

graph.addEdge("scrape", "summarize");
graph.addEdge("search", "summarize");
graph.addEdge("summarize", END);
```

### ✔ 解释
- 开始 → 规划器
- 规划器决定运行哪个工具节点
- 抓取 → 总结
- 搜索 → 总结
- 总结 → 结束

这是真正的**工具决策**。

---

## 🔹 BLOCK 11 — 编译智能体

```js
const agent = graph.compile();
```

### ✔ 解释
将图转换为可运行的多智能体工作流。

---

## 🔹 BLOCK 12 — 运行智能体

```js
const result = await agent.invoke({
  messages: [
    { role: "user", content: "查找 Google 2023 年的收入" },
  ],
});
```

### ✔ 解释
- 用户查询触发规划器
- 规划器识别这是一个**搜索查询**
- 运行**虚假搜索**
- 然后**总结**
- 输出最终助手答案

---

## 🔹 BLOCK 13 — 打印最终输出

```js
console.log(result.messages.at(-1).content);
```

---

# 📌 预期输出 (示例)

```
• Google 2023 年的收入约为 $307B。
• Alphabet 的收入增长了 9%。
• 这些数字来自虚假搜索工具。
• 显示了 Google/Alphabet 的年度业绩指标。
• 摘要由 AI 根据搜索结果生成。
```

---

# ▶️ 如何运行

```
node 12-multi-agent.js
```

确保 `.env` 文件包含：

```
OPENAI_API_KEY=your_key_here
```

---

# 🌍 实际应用场景

此架构用于：

### ✔ Perplexity AI
### ✔ 多智能体研究助手
### ✔ 自动化分析师 (SEO、金融、营销)
### ✔ AI 浏览器工具
### ✔ 数据提取 + 总结系统
### ✔ 主管 → 工作者智能体系统
### ✔ RAG + 智能体组合

---

# ⭐ 下一课
**第13课 — 多智能体系统 (高级版本：真实工具 + 分支 + 动态推理)。**
