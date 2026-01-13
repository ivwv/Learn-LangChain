# 📘 第13课 — 生产级多智能体系统
### (真实抓取 • 真实搜索 • 硬性路由 • REPL 聊天 • Zod Schema)

这是整个存储库中最**真实世界**、**生产级别**和**功能最丰富**的智能体。

第13课展示了如何使用以下技术构建 **Perplexity 风格的智能体**：

- **真实浏览器抓取 (Puppeteer)**
- **真实网络搜索 (Tavily API)**
- **硬性 + LLM 路由**
- **Zod 进行 Schema 验证**
- **LangGraph 状态机**
- **REPL 终端聊天**

这**不是**一个演示。
这是一个可用于初创公司和生产级 AI 的模板。

---

# 🧱 为什么有这节课

第11课 → 第12课教您智能体工作流的基础知识。

第13课是它变得**真实**的地方：

- 真实搜索
- 真实抓取
- 真实路由
- 真实错误处理
- 真实消息 Schema
- 真实智能体生命周期

这是您的智能体变得**有用**的时刻，而不仅仅是“很酷的代码”。

---

# 📦 使用的包 (以及原因)

| 包                  | 我们为什么需要它                                     |
|---------------------|----------------------------------------------------|
| **@langchain/langgraph** | 构建多节点智能体工作流                               |
| **@langchain/openai**    | 可靠地使用 GPT-4o-mini 进行路由 + 总结             |
| **puppeteer**       | **真实浏览器抓取**，与正则表达式抓取不同             |
| **zod**             | 验证智能体状态并防止消息损坏                         |
| **dotenv**          | 存储 API 密钥 (OPENAI, TAVILY)                     |
| **Tavily API**      | **真实互联网搜索**，提供事实性答案                   |
| **readline**        | 交互式 REPL (终端聊天)                             |

---

# 🤖 为什么这里使用 OpenAI 而不是 Gemini？

好问题。

Gemini 很棒，但是：

### ✔ OpenAI GPT-4o-mini 具有以下优点：
- 更快
- 更便宜
- 更具确定性
- 更擅长**短路由决策**
- 对于“严格的路由器指令”更可靠

### ✔ LangGraph 的官方示例使用 OpenAI
因此兼容性完美。

### ✔ Tavily 建议 OpenAI 用于搜索 → 回答用例

您可以稍后替换为 Gemini。
但对于第13课，OpenAI 是最安全 + 最稳定的选择。

---

# 🔥 架构 (一图胜千言)

```
用户输入
      ↓
[ 规划节点 ]
    - 硬性规则: URL → SCRAPE
    - 否则: LLM 决定 SEARCH 或 ANSWER
      ↓
  ┌────────────┬────────────┐
  ↓            ↓            ↓
抓取          搜索          回答
  ↓            ↓            ↓
         [ 回答节点 ]
              ↓
             结束
```

---

# 🧩 文件结构

```
/lesson-13/
    ├── 13-multi-agent.js   ← 主智能体图
    ├── scrape.js           ← Puppeteer 抓取器
    └── .env                ← API 密钥
```

---

# 🧠 完整逐块解释 (主文件)

---

## 🟦 **1. 导入 + dotenv**

```js
import { config } from "dotenv";
config();

import readline from "readline";
import { ChatOpenAI } from "@langchain/openai";
import { StateGraph, START, END } from "@langchain/langgraph";
import { z } from "zod";
import { scrapeReact } from "./scrape.js";
```

### ✔ 作用
- 加载环境变量
- 导入 LLM
- 导入 LangGraph
- 导入 Zod 用于 Schema
- 导入 Puppeteer 抓取器

---

## 🟦 **2. 确保 API 密钥**

```js
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
```

如果缺少 → 清晰的错误。

---

## 🟦 **3. 创建模型**

```js
const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
  apiKey: OPENAI_API_KEY,
});
```

### ✔ 为什么选择 GPT-4o-mini？
- 确定性
- 便宜
- 完美路由
- 强大的推理能力
- 生产级智能体的稳定性

---

## 🟦 **4. Zod 消息 Schema**

```js
const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

const State = z.object({
  messages: z.array(MessageSchema),
});
```

### ✔ 为什么使用 Zod？
防止：

- 格式错误的消息
- 缺失的角色
- 损坏的状态更新

真实智能体必须是安全的。

---

## 🟦 **5. 工具: 查找最后一条用户消息**

```js
function findLastUserMessage(state) {
  return [...state.messages].reverse().find((m) => m.role === "user");
}
```

简单的辅助函数。
在**每个节点**中使用。

---

## 🟦 **6. Tavily 搜索节点**

```js
async function tavilySearch(query) {
  if (!TAVILY_API_KEY) return "NO_TAVILY_KEY";
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        search_depth: "advanced",
        include_answer: true,
      }),
    });
    const json = await res.json();
    return JSON.stringify(json);
  } catch (err) {
    return "SEARCH_ERROR_" + (err.message || String(err));
  }
}
```

### ✔ 为什么选择 Tavily？
- 实时搜索
- 准确的结果提取
- 专为智能体设计

---

## 🟦 **7. 规划节点 (PLAN NODE) — 硬性路由器 + LLM 路由器**

```js
async function planNode(state) {
  const userMsg = findLastUserMessage(state)?.content || "";

  if (userMsg.match(/https?:\/\/\S+/i)) {
    return {
      messages: [...state.messages, { role: "system", content: "PLAN=scrape" }],
    };
  }

  const decisionResp = await model.invoke([
    {
      role: "system",
      content: `
你是一个严格的路由器。只输出一个单词："search" 或 "answer"。
如果用户询问任何近期信息，如价格、日期、当前情况等 → "search"。
否则 → "answer"。
`,
    },
    ...state.messages,
  ]);

  const d = (decisionResp.content || "").toLowerCase().trim();
  const plan = d.includes("search") ? "search" : "answer";

  return {
    messages: [...state.messages, { role: "system", content: `PLAN=${plan}` }],
  };
}
```

### ✔ 为什么这个路由器功能强大？
- 如果存在 URL → 抓取
- 如果问题是关于**今天 / 现在 / 近期** → 搜索
- 否则 → 从记忆中回答

这正是 Perplexity 路由工具的方式。

---

## 🟦 **8. 抓取节点 (SCRAPE NODE)**

```js
async function scrapeNode(state) {
  const userMsg = findLastUserMessage(state)?.content || "";
  const urlMatch = userMsg.match(/https?:\/\/\S+/i);
  const url = urlMatch ? urlMatch[0] : null;
  if (!url) {
    return {
      messages: [...state.messages, { role: "system", content: "SCRAPED=NO_URL_PROVIDED" }],
    };
  }

  const scraped = await scrapeReact(url);
  return {
    messages: [...state.messages, { role: "system", content: `SCRAPED=${scraped}` }],
  };
}
```

### ✔ 使用真实的抓取 (来自 scrape.js)

---

## 🟦 **9. 搜索节点 (SEARCH NODE)**

```js
async function searchNode(state) {
  const userMsg = findLastUserMessage(state)?.content || "";
  const q = userMsg || "";
  const result = await tavilySearch(q);
  return {
    messages: [...state.messages, { role: "system", content: `SEARCHED=${result}` }],
  };
}
```

---

## 🟦 **10. 回答节点 (ANSWER NODE)**

```js
async function answerNode(state) {
  const scrapedEntry = state.messages.find((m) => m.content.startsWith("SCRAPED="));
  const searchedEntry = state.messages.find((m) => m.content.startsWith("SEARCHED="));
  const userMsg = findLastUserMessage(state)?.content || "";

  const prompt = `
重要提示:
- 不要说“我无法浏览”。
- 抓取/搜索已经由你的工具完成。
- 只使用提供的抓取/搜索数据。

用户: ${userMsg}

抓取内容: ${scrapedEntry ? scrapedEntry.content.replace(/^SCRAPED=/, "") : "无"}
搜索内容: ${searchedEntry ? searchedEntry.content.replace(/^SEARCHED=/, "") : "无"}

给出简洁的最终答案。
`;

  const out = await model.invoke([{ role: "user", content: prompt }]);
  return {
    messages: [...state.messages, { role: "assistant", content: out.content }],
  };
}
```

### ✔ 为什么这功能强大？
阻止 LLM 产生幻觉，例如：

- “我无法浏览”
- “我不知道那个数据”
- “我无法访问互联网”

---

# 🧩 解释 **scrape.js** (逐块)

---

## 🟦 **1. 导入 puppeteer**

```js
import puppeteer from "puppeteer";
```

### ✔ 完全的浏览器控制。

---

## 🟦 **2. scrapeReact() 函数**

```js
export async function scrapeReact(url, { timeout = 30000 } = {}) {
  if (!url) return "NO_URL";

  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
```

### ✔ 开启无头浏览器
### ✔ 完整加载页面

---

## 🟦 **3. 虚假视口 + 用户代理**

```js
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"
    );
```

### ✔ 假装是真实用户
### ✔ 有助于避免阻止

---

## 🟦 **4. 导航 + 等待**

```js
    await page.goto(url, { waitUntil: "networkidle2", timeout });
```

### ✔ 等待 JS 密集型网站
### (React, Next.js, Vue, Angular)

---

## 🟦 **5. 提取可读文本**

```js
    const content = await page.evaluate(() => {
      return document.body.innerText || "";
    });
```

### ✔ 获取完整的文本内容
### ✔ 适用于所有现代网站

---

## 🟦 **6. 修剪和切片**

```js
    return content.replace(/\s+/g, " ").trim().slice(0, 60_000);
```

### ✔ 输出针对 LLM 输入进行了优化
### ✔ 避免大量 token

---

## 🟦 **7. 关闭浏览器**

```js
  } finally {
    if (browser) await browser.close();
  }
}
```

---

# ▶️ 如何运行

```
npm install
```

添加 `.env`：

```
OPENAI_API_KEY=your_key
TAVILY_API_KEY=your_key
```

运行 REPL：

```
node 13-multi-agent.js
```

---

# 🧪 示例提示

```
> 今天比特币的价格是多少？
> 总结 https://webreal.in
> OpenAI 的创始人是谁？
> 告诉我 Google 最新的股票表现
```

---

# 🎉 最终说明

第13课是**生产级智能体架构**。

这与以下系统使用**相同结构**：

- Perplexity
- WebPilot
- BrowserGPT
- 研究智能体
- 带有工具的 AI 助手
- 多智能体主管系统

这是 MERN + AI + LangChain 结合的未来。

---
