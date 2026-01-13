// 导入 dotenv 库，用于加载 .env 文件中的环境变量
import { config } from "dotenv";
config();

import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { MessagesAnnotation, StateGraph, START, END } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";

// 1️⃣ 定义抓取工具
const scrapeTool = tool(
  async ({ url }) => {
    console.log(`\n🔧 正在抓取: ${url}`);
    try {
      const res = await fetch(url);
      const html = await res.text();
      const content = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 3000);
      console.log(`✅ 抓取成功，内容长度: ${content.length}`);
      console.log(`📄 内容预览: ${content.slice(0, 200)}...`);
      return content;
    } catch (err) {
      console.log(`❌ 抓取失败: ${err.message}`);
      return `抓取错误: ${err.message}`;
    }
  },
  {
    name: "scrape_website",
    description:
      "抓取指定 URL 的网页内容并返回纯文本。使用此工具获取网页内容后，请根据返回的内容进行总结。",
    schema: z.object({
      url: z.string().url().describe("要抓取的网页 URL"),
    }),
  }
);

const tools = [scrapeTool];

// 2️⃣ 模型初始化并绑定工具
const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
}).bindTools(tools);

// 3️⃣ 创建工具节点
const toolNode = new ToolNode(tools);

// 4️⃣ 调用模型节点
async function callModel(state) {
  const response = await model.invoke(state.messages);
  return { messages: [response] };
}

// 5️⃣ 判断是否需要调用工具
function shouldContinue(state) {
  const lastMessage = state.messages.at(-1);
  // 如果有 tool_calls，继续调用工具
  if (lastMessage.tool_calls?.length > 0) {
    return "tools";
  }
  return END;
}

// 6️⃣ 构建图
const graph = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge(START, "agent")
  .addConditionalEdges("agent", shouldContinue, ["tools", END])
  .addEdge("tools", "agent");

const agent = graph.compile();

// 7️⃣ 运行
async function main() {
  const result = await agent.invoke({
    messages: [
      {
        role: "user",
        content:
          "抓取 https://docs.langchain.com/oss/javascript/langgraph/overview.md 并总结它的内容为 5 个要点。使用中文回复",
      },
    ],
  });

  console.log("\n🔥 最终输出:\n");
  console.log(result.messages.at(-1).content);
}

main();
