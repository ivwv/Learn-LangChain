// 导入 dotenv 库，用于加载 .env 文件中的环境变量
import { config } from "dotenv";
// 从 @langchain/google-genai 库导入 ChatGoogleGenerativeAI 类，用于与 Google 的 Gemini 模型进行聊天交互
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
// 从 @langchain/core/prompts 库导入 PromptTemplate 类，用于创建可重用的提示模板
import { PromptTemplate } from "@langchain/core/prompts";

// 调用 config() 函数加载 .env 文件中的环境变量。
// 这使得可以通过 process.env.VAR_NAME 访问 .env 文件中定义的环境变量。
config();

// 初始化 ChatGoogleGenerativeAI 模型实例
// const model = new ChatGoogleGenerativeAI({
//   // 指定要使用的模型名称，这里使用的是 Gemini 2.0 Flash 版本，一个快速且适合聊天和推理的模型
//   model: "gemini-2.0-flash",
//   // 从环境变量中获取 Gemini API 密钥
//   apiKey: process.env.GEMINI_API_KEY,
// });
const model = new ChatOpenAI({
  // 指定要使用的模型名称，这里使用的是 OpenAI 的 GPT-4o-mini 版本，一个快速且适合聊天和推理的模型
  model: "gpt-4o",
  // 从环境变量中获取 OpenAI API 密钥
    apiKey: process.env.OPENAI_API_KEY,
});

// 创建一个 PromptTemplate 实例
// 这个模板包含一个占位符 {topic}，允许动态插入内容
const prompt = PromptTemplate.fromTemplate(`
    请像向一个5岁小孩解释一样，解释一下 {topic}。
`);

// 打印未填充数据时的提示模板对象，这有助于理解 PromptTemplate 的内部结构
console.log("未填充数据的提示模板:", prompt);

// 定义一个异步函数 run，用于执行整个流程
async function run() {
  // 使用 .format 方法填充提示模板中的 {topic} 占位符
  // 这里将 {topic} 替换为 "ice cream" (冰淇淋)
  const filledPrompt = await prompt.format({ topic: "冰淇淋" });
  // 打印填充后的提示文本，这是将发送给 LLM 的最终提示
  console.log("填充后的提示文本:", filledPrompt);

  // 调用模型的 invoke 方法，将填充后的提示发送给 Gemini 模型
  // 模型会处理这个提示并返回一个响应对象
  const res = await model.invoke(filledPrompt);
  // 打印模型响应中的实际文本内容
  console.log("模型响应内容:", res.content);
}

// 调用 run 函数开始执行，并使用 .catch 捕获可能发生的错误
// 例如，如果缺少 API 密钥，将在此处捕获并打印错误
run().catch(console.error);
