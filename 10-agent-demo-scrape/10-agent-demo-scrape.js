// 导入 dotenv 库，用于加载 .env 文件中的环境变量
import { config } from "dotenv";
// 调用 config() 函数加载 .env 文件中的环境变量。
// 这使得可以通过 process.env.VAR_NAME 访问 .env 文件中定义的环境变量。
config();

// 从 @langchain/openai 库导入 ChatOpenAI 类，用于与 OpenAI 的聊天模型进行交互
import { ChatOpenAI } from "@langchain/openai";
// 从 "langchain" 库导入 createAgent 函数，用于创建 LangChain 智能体
import { createAgent } from "langchain";

// 1) 模型初始化
// 初始化 ChatOpenAI 模型实例，作为智能体的大脑
const model = new ChatOpenAI({
  // 指定要使用的模型名称，这里使用的是 GPT-4o-mini，这是一个轻量级、快速且经济的模型
  model: "gpt-4o",
  // 设置 temperature (温度) 参数为 0，这使得模型响应更具确定性，减少随机性
  temperature: 0,
});

// 2) 创建智能体 (目前不带工具)
// 使用 createAgent 函数创建智能体实例
const agent = createAgent({
  // 将之前初始化的模型传递给智能体
  model,
  // 智能体目前不使用任何工具，因此工具列表为空数组
  tools: [],
});

// 3) 运行智能体
// 定义一个异步主函数 main
async function main() {
  // 调用智能体的 invoke 方法，传入一个包含消息数组的对象
  // 消息数组遵循 ChatGPT API 的结构，包含用户角色和内容
  const result = await agent.invoke({
    messages: [
      { role: "user", content: "你好智能体，你是谁？" }, // 用户向智能体提问
    ],
  });

  // 打印智能体的响应标题
  console.log("\n=== 智能体响应 ===\n");
  // 打印智能体回复的实际文本内容
  // result.messages 是一个完整的对话消息数组
  // .at(-1) 获取数组中的最后一个元素，即智能体的最新回复
  // .content 提取该消息的文本内容
  console.log(result.messages.at(-1).content);
}

// 调用 main 函数开始执行程序。
// 在实际应用中，通常会使用 .catch(console.error) 来处理潜在的错误，以增强程序的健壮性。
main();
