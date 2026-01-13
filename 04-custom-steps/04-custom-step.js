// 导入 dotenv 库，用于加载 .env 文件中的环境变量
import { config } from "dotenv";
// 从 @langchain/google-genai 库导入 ChatGoogleGenerativeAI 类，用于与 Google 的 Gemini 模型进行聊天交互
// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// 从 @langchain/openai 库导入 ChatOpenAI 类，用于与 OpenAI 的 GPT 模型进行聊天交互
import { ChatOpenAI } from "@langchain/openai";
// 从 @langchain/core/prompts 库导入 PromptTemplate 类，用于创建可重用的提示模板
import { PromptTemplate } from "@langchain/core/prompts";
// 从 @langchain/core/output_parsers 库导入 StringOutputParser 类，用于将 LLM 输出解析为字符串
import { StringOutputParser } from "@langchain/core/output_parsers";

// 调用 config() 函数加载 .env 文件中的环境变量。
// 这使得可以通过 process.env.VAR_NAME 访问 .env 文件中定义的环境变量。
config();

// 初始化 ChatOpenAI 模型实例
const model = new ChatOpenAI({
  // 指定要使用的模型名称，这里使用的是 OpenAI 的 GPT-4o-mini 版本，一个快速且适合聊天和推理的模型
  model: "gpt-4o-mini",
  // 从环境变量中获取 OpenAI API 密钥
  apiKey: process.env.OPENAI_API_KEY,
});

// 创建一个 PromptTemplate 实例
// 这个模板包含一个占位符 {topic}，允许动态插入内容
const prompt = PromptTemplate.fromTemplate(`
    请用简单的术语解释以下概念：{topic}`);

// 创建一个 StringOutputParser 实例
// 这个解析器将模型的原始输出转换为一个干净的纯字符串
const parser = new StringOutputParser();

// 定义一个异步函数 runChain，用于执行包含自定义预处理逻辑的链
async function runChain(input) {
  // 自定义步骤：在这里我们可以编写任何预处理逻辑，例如工具调用或输入验证
  const normalized = {
    ...input,
    // 对输入的主题进行清理：去除首尾空格并转换为小写
    topic: input.topic.trim().toLowerCase(),
  };

  // 构建并调用链
  // 链的执行顺序是：prompt -> model -> parser
  // normalized (规范化后的输入) 会首先传递给 prompt
  const result = await prompt
    .pipe(model) // 将格式化后的提示传递给模型
    .pipe(parser) // 将模型的原始输出传递给解析器
    .invoke(normalized); // 使用规范化后的输入调用链

  // 返回链的最终结果（干净的字符串输出）
  return result;
}

// 定义一个异步函数 run，用于启动整个应用流程
async function run() {
  // 调用 runChain 函数，传入一个包含主题的对象
  // 这里的主题是 "hello world"，它将在 runChain 内部被预处理
  const text = await runChain({ topic: " hello world " });
  // 打印最终处理后的文本结果
  console.log(text);
}

// 调用 run 函数开始执行，并使用 .catch 捕获可能发生的错误
// 例如，如果缺少 API 密钥或链执行失败，将在此处捕获并打印错误
run().catch(console.error);
