// 导入 dotenv 库，用于加载 .env 文件中的环境变量
import { config } from "dotenv";
// 调用 config() 函数加载 .env 文件中的环境变量。
config();

// 从 @langchain/openai 库导入 ChatOpenAI 类，用于与 OpenAI 的聊天模型进行交互
import { ChatOpenAI } from "@langchain/openai";
// 从 @langchain/langgraph 库导入构建 LangGraph 所需的组件
import {
  MessagesAnnotation, // 用于定义状态中消息的结构
  StateGraph,         // 用于构建状态图
  START,              // 图的起始节点标识
  END,                // 图的结束节点标识
} from "@langchain/langgraph";

// 模型初始化
// 初始化 ChatOpenAI 模型实例，作为智能体的大脑，用于规划和总结任务
const model = new ChatOpenAI({
  // 指定要使用的模型名称，这里使用的是 GPT-4o-mini，这是一个轻量级、快速且经济的模型
  model: "gpt-4o-mini",
  // 设置 temperature (温度) 参数为 0，这使得模型响应更具确定性，减少随机性
  temperature: 0,
});

// -----------------------
// 虚假搜索工具 (仅为简单演示)
// -----------------------
// 这个函数模拟一个搜索引擎，根据查询返回预设的虚假数据
async function fakeSearch(query) {
  return `搜索结果：${query}
1) 谷歌 2023 年收入为 3070 亿美元。
2) Alphabet 增长了 9%。
(虚假演示数据)
`;
}

// -----------------------
// 抓取工具 (与之前的课程相同)
// -----------------------
// 这个函数用于抓取指定 URL 的网页内容并进行清理
async function scrapeWebsite(url) {
  try {
    // 尝试使用 fetch API 获取指定 URL 的内容
    const res = await fetch(url);
    // 将响应体读取为纯文本 (HTML 内容)
    const html = await res.text();
    // 清理 HTML 内容，移除所有 HTML 标签，清理空白符，并截取前 1500 个字符
    return html.replace(/<[^>]+>/g, " ").trim().slice(0, 1500);
  } catch {
    // 捕获任何错误并返回一个通用的错误消息
    return "抓取错误";
  }
}

// -----------------------
// 节点 1: 规划器节点 (PLANNER NODE)
// -----------------------
// 规划器智能体：决定使用哪个工具 (抓取 | 搜索 | 数学 | 总结)
async function plannerNode(state) {
  // 调用 LLM 模型，指示它根据用户消息决定使用哪个工具
  const decision = await model.invoke([
    {
      role: "system", // 系统角色指令
      content:
        "你是一个工具决策者。只输出以下单词之一：scrape, search, math, summarize。", // 指示 LLM 仅输出预设的工具名称
    },
    ...state.messages, // 将当前状态中的所有消息作为上下文传递给 LLM
  ]);

  // 从 LLM 的响应中获取内容，清理空白符并转换为小写，得到决策模式
  const mode = decision.content.trim().toLowerCase();

  // 返回更新后的状态，将决策模式作为系统消息添加到消息列表中
  return {
    messages: [
      ...state.messages,
      { role: "system", content: `PLAN=${mode}` },
    ],
  };
}

// -----------------------
// 节点 2: 抓取节点 (SCRAPE)
// -----------------------
// 抓取智能体：执行网页抓取操作
async function scrapeNode(state) {
  // 获取最新一条消息的内容
  const last = state.messages.at(-1).content;
  // 从最新消息中匹配并提取 URL
  const url = last.match(/https?:\/\/\S+/)?.[0];

  // 调用 scrapeWebsite 函数进行网页抓取
  const text = await scrapeWebsite(url);

  // 返回更新后的状态，将抓取到的文本内容作为系统消息添加到消息列表中
  return {
    messages: [
      ...state.messages,
      { role: "system", content: `SCRAPED=${text}` },
    ],
  };
}

// -----------------------
// 节点 3: 搜索节点 (SEARCH)
// -----------------------
// 搜索智能体：执行搜索操作
async function searchNode(state) {
  // 从消息列表中查找原始的用户查询
  const lastUser = state.messages.find((m) => m.role === "user")?.content;
  // 调用 fakeSearch 函数执行虚假搜索
  const result = await fakeSearch(lastUser);

  // 返回更新后的状态，将搜索结果作为系统消息添加到消息列表中
  return {
    messages: [
      ...state.messages,
      { role: "system", content: `SEARCHED=${result}` },
    ],
  };
}

// -----------------------
// 节点 4: 总结节点 (SUMMARIZE)
// -----------------------
// 总结智能体：将工具的输出总结成简洁的内容
async function summarizeNode(state) {
  // 从消息列表中查找抓取或搜索的结果
  const data = state.messages.find((m) =>
    m.content.startsWith("SCRAPED=") || m.content.startsWith("SEARCHED=")
  )?.content.replace("SCRAPED=", "").replace("SEARCHED=", ""); // 移除前缀获取内容

  // 调用 LLM 模型对数据进行总结
  const summary = await model.invoke([
    { role: "user", content: `总结:\n${data}` }, // 指示 LLM 总结提供的数据
  ]);

  // 返回更新后的状态，将 LLM 生成的总结作为助手消息添加到消息列表中
  return {
    messages: [...state.messages, { role: "assistant", content: summary.content }],
  };
}

// -----------------------
// 构建图 (BUILD GRAPH)
// -----------------------
// 使用 StateGraph 定义状态图，并添加各个节点 (智能体)
const graph = new StateGraph(MessagesAnnotation)
  .addNode("plan", plannerNode)      // 添加规划器节点
  .addNode("scrape", scrapeNode)    // 添加抓取节点
  .addNode("search", searchNode)    // 添加搜索节点
  .addNode("summarize", summarizeNode); // 添加总结节点

// 流程定义 (FLOW)
// 定义图的起始点到规划器节点
graph.addEdge(START, "plan");

// 定义规划器节点的条件边
// 根据规划器节点的输出 (PLAN=...) 来决定下一步走向
graph.addConditionalEdges("plan", (state) => {
  // 获取规划器节点的最新系统消息内容
  const last = state.messages.at(-1).content;
  // 根据规划的模式返回相应的下一个节点
  if (last.includes("scrape")) return "scrape";
  if (last.includes("search")) return "search";
  if (last.includes("summarize")) return "summarize";
  // 如果没有匹配的模式，则结束图的执行
  return END;
});

// 定义抓取节点到总结节点的边
graph.addEdge("scrape", "summarize");
// 定义搜索节点到总结节点的边
graph.addEdge("search", "summarize");
// 定义总结节点到结束点的边
graph.addEdge("summarize", END);

// 编译图，生成可运行的多智能体
const agent = graph.compile();

// 运行函数 (RUN)
async function main() {
  // 调用智能体，传入用户消息
  const result = await agent.invoke({
    messages: [
      { role: "user", content: "查找 Google 2023 年的收入" }, // 用户查询
    ],
  });

  console.log("\n🔥 最终输出:\n");
  // 打印智能体返回的最终总结内容 (最后一个助手消息)
  console.log(result.messages.at(-1).content);
}

// 执行主函数
main();