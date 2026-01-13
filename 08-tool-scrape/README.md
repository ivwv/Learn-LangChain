# 📘 第08课 — 网页抓取工具 (使用 RunnableLambda + Zod 验证)

在本课程中，我们将构建一个**真正的生产级工具**：
一个**网站抓取工具**，它能够获取网页内容，清理它，并返回可读的文本。

这个工具稍后将被智能体 (agents) 用于：

- 阅读网站
- 从 URL 回答问题
- 自动化研究
- 执行 Perplexity 风格的多工具工作流

README 将以**与您的代码完全相同的顺序**解释每个代码块。

---

# 🚀 本课将构建什么 (流程概述)

1️⃣ 使用 Zod 验证输入 (URL)
2️⃣ 使用 RunnableLambda 创建抓取工具
3️⃣ 获取网站内容
4️⃣ 剥离 HTML 标签、脚本和样式
5️⃣ 返回干净、可读的文本
6️⃣ 使用 `.invoke()` 测试工具

这是一个**真实、有用**的工具——而不是一个玩具示例。

---

# 🔁 流程图 (简化)

```
用户发送 URL
       ↓
Zod 验证 (检查 URL 格式)
       ↓
获取网页 HTML
       ↓
删除 <script>、<style>、HTML 标签
       ↓
清理 + 规范化文本
       ↓
返回结构化结果 { success, content }
```

---

# 🧩 **代码解释 (逐块，精确代码顺序)**

---

## 🔹 **BLOCK 1 — 导入 RunnableLambda + Zod**

```js
import { RunnableLambda } from "@langchain/core/runnables";
import { z } from "zod";
```

### ✔ 解释：
- `RunnableLambda` → 将任何 JS 函数转换为 LangChain 工具
- `zod` → 验证输入 (我们确保 `url` 是一个有效的 URL)

使用 Zod 是**生产最佳实践**：
- 防止错误
- 防止注入攻击
- 确保工具接收到正确的参数

---

## 🔹 **BLOCK 2 — 创建 Zod Schema 用于输入验证**

```js
const schema = z.object({
  url: z.string().url(),
});
```

### ✔ 解释：
我们定义有效输入应该是什么样子：

- 输入必须是一个对象
- 它必须包含一个 `url` 字段
- 该字段必须是一个有效的 URL

如果用户 (或 LLM) 发送了错误的输入 →
schema 会抛出一个清晰、有用的错误。

---

## 🔹 **BLOCK 3 — 创建网页抓取工具**

```js
export const scrapeWebsite = RunnableLambda.from(async (input) => {
  const { url } = schema.parse(input);
```

### ✔ 解释：
- 使用 RunnableLambda 包装我们的函数 → 成为一个 LangChain 工具
- 第一步：使用 Zod (`schema.parse()`) 验证用户输入

如果输入无效 → 函数立即停止。
如果有效 → 我们继续。

---

## 🔹 **BLOCK 4 — 获取网站内容**

```js
const res = await fetch(url);

if (!res.ok) {
  return {
    success: false,
    error: `Failed to fetch URL. Status: ${res.status}`
  };
}
```

### ✔ 解释：
我们向给定的 URL 发出 HTTP 请求。

- 如果网站宕机 → 返回 `{success:false}`
- 如果页面不存在 → 返回错误
- 没有崩溃或未处理的异常

这使得抓取工具**安全**和**可靠**。

---

## 🔹 **BLOCK 5 — 读取 HTML**

```js
const html = await res.text();
```

### ✔ 解释：
我们提取网页的原始 HTML。

示例：

```
<html>
  <head>...</head>
  <body>Hello</body>
</html>
```

我们接下来将对其进行清理。

---

## 🔹 **BLOCK 6 — 清理 HTML 并提取纯文本**

```js
const text = html
  .replace(/<script[\s\S]*?<\/script>/gi, "")
  .replace(/<style[\s\S]*?<\/style>/gi, "")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ")
  .trim();
```

### ✔ 解释：

此块移除：

- `<script> ... </script>` 标签
- `<style> ... </style>` 标签
- 所有 HTML 标签 `<div>`, `<h1>`, `<p>`
- 多余的空格
- 换行符
- 空白噪音

结果 = **干净可读的文本**，非常适合传递给 LLM。

示例：

```
"欢迎访问我的网站 这是主页"
```

这正是 Perplexity、GPT 浏览器工具和研究智能体的工作方式。

---

## 🔹 **BLOCK 7 — 返回结构化响应**

```js
return {
  success: true,
  url,
  content: text.slice(0, 3000),
};
```

### ✔ 解释：
我们返回一个 JSON 结果，其中包含：

- `success` → true
- `url` → 被抓取的 URL
- `content` → 清理后文本的前 3000 个字符

为什么是 3000？

- 防止 LLM 过载
- 保持响应速度快
- 适用于 Perplexity 风格的智能体

---

## 🔹 **BLOCK 8 — 错误处理 (故障保护)**

```js
} catch (err) {
  return {
    success: false,
    error: err.message,
  };
}
```

### ✔ 解释：
如果抓取失败或 URL 无效 →
我们捕获错误并返回一个**干净的**、LLM 友好的错误对象。

这可以防止智能体崩溃。

---

## 🔹 **BLOCK 9 — 测试工具**

```js
const result = await scrapeWebsite.invoke({
  url: "https://webreal.in",
});
console.log(result);
```

### ✔ 解释：
我们通过抓取 `webreal.in` 来测试我们的工具。

`.invoke()` 是通用的 LangChain 执行方法。

打印的结果将如下所示：

```
{
  success: true,
  url: "...",
  content: "干净的抓取文本..."
}
```

---

# 🌍 实际应用场景

此工具是以下功能的基础：

### ✔ Perplexity 风格的网页研究智能体
### ✔ 多智能体研究流程
### ✔ 站点 QA 机器人
### ✔ SEO 分析器
### ✔ 新闻抓取器
### ✔ 竞争对手分析机器人
### ✔ 自动摘要管道
### ✔ 事实核查智能体

您稍后会将此抓取工具插入到**具有推理能力的智能体**中，它将自动：

- 决定抓取哪个 URL
- 抓取它
- 阅读内容
- 使用 RAG 回答

---

# ▶️ 如何运行

```
node 08-tool-scrape.js
```

---

# ⭐ 下一章
**第09课 — 将 LLM 用作工具 (AI 调用另一个 AI)。**
