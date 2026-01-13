// 导入 dotenv 库，用于加载 .env 文件中的环境变量
import { config } from "dotenv";
config();

import readline from "readline";
import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { MessagesAnnotation, StateGraph, START, END } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { scrapeReact } from "./scrape.js";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("错误: 请在 .env 文件中设置 OPENAI_API_KEY");
  process.exit(1);
}
if (!TAVILY_API_KEY) {
  console.warn("警告: 未设置 TAVILY_API_KEY — 搜索功能将禁用。");
}

// ------------------ 定义工具 ------------------
// 1️⃣ 网页抓取工具
const scrapeTool = tool(
  async ({ url }) => {
    console.log(`\n🔧 正在抓取: ${url}`);
    const content = await scrapeReact(url);
    console.log(`✅ 抓取完成，内容长度: ${content.length}`);
    console.log(`📄 内容预览: ${content.slice(0, 30000)}...`);
    return content;
  },
  {
    name: "scrape_website",
    description: "抓取指定 URL 的网页内容。当用户提供网址并要求获取或总结网页内容时使用此工具。",
    schema: z.object({
      url: z.string().url().describe("要抓取的网页 URL"),
    }),
  }
);

// 2️⃣ 搜索工具
const searchTool = tool(
  async ({ query }) => {
    console.log(`\n🔍 正在搜索: ${query}`);
    if (!TAVILY_API_KEY) return "搜索功能未启用，请设置 TAVILY_API_KEY";
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
      console.log(`✅ 搜索完成`);
      return JSON.stringify(json);
    } catch (err) {
      return `搜索错误: ${err.message}`;
    }
  },
  {
    name: "web_search",
    description:
      "搜索网络获取最新信息。当用户询问近期事件、最新价格、当前新闻等需要实时信息时使用此工具。",
    schema: z.object({
      query: z.string().describe("搜索查询关键词"),
    }),
  }
);

const tools = [scrapeTool, searchTool];

// ------------------ 模型初始化并绑定工具 ------------------
const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
  apiKey: OPENAI_API_KEY,
}).bindTools(tools);

// ------------------ 创建工具节点 ------------------
const toolNode = new ToolNode(tools);

// ------------------ 调用模型节点 ------------------
async function callModel(state) {
  const response = await model.invoke(state.messages);
  return { messages: [response] };
}

// ------------------ 判断是否需要调用工具 ------------------
function shouldContinue(state) {
  const lastMessage = state.messages.at(-1);
  if (lastMessage.tool_calls?.length > 0) {
    return "tools";
  }
  return END;
}

// ------------------ 构建图 ------------------
const graph = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge(START, "agent")
  .addConditionalEdges("agent", shouldContinue, ["tools", END])
  .addEdge("tools", "agent");

const agent = graph.compile();

// ------------------ REPL / 交互式命令行 ------------------
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

console.log("\nMultiAgent REPL 就绪。请输入问题（或 'exit' 退出）：\n");

async function askAgent(text) {
  try {
    const result = await agent.invoke({
      messages: [{ role: "user", content: text }],
    });

    // 调试：打印所有消息
    console.log("\n📋 消息流:");
    result.messages.forEach((m, i) => {
      const role = m.constructor?.name || m.role || "unknown";
      const hasToolCalls = m.tool_calls?.length > 0;
      const content =
        typeof m.content === "string"
          ? m.content.slice(0, 100)
          : JSON.stringify(m.content)?.slice(0, 100);
      console.log(
        `  [${i}] ${role}: ${content}${content?.length >= 100 ? "..." : ""} ${
          hasToolCalls ? `(tool_calls: ${m.tool_calls.length})` : ""
        }`
      );
    });

    const final = result.messages.at(-1)?.content || "无响应";
    console.log("\nAI:", final, "\n");
  } catch (err) {
    console.error("智能体错误:", err);
  }
}

rl.on("line", async (line) => {
  const t = line.trim();
  if (!t) return;
  if (t.toLowerCase() === "exit") {
    rl.close();
    process.exit(0);
  }
  await askAgent(t);
  process.stdout.write("> ");
});

process.stdout.write("> ");
