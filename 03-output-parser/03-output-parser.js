// 导入 dotenv 库，用于加载 .env 文件中的环境变量
import { config } from "dotenv";
// 从 @langchain/google-genai 库导入 ChatGoogleGenerativeAI 类，用于与 Google 的 Gemini 模型进行聊天交互
// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
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
    请像向一个5岁小孩解释一样，解释一下 {topic}。`);

// 创建一个 StringOutputParser 实例
// 这个解析器将模型的原始输出转换为一个干净的纯字符串
const parser = new StringOutputParser();

// 构建完整的链
// 链的执行顺序是：prompt -> model -> parser
// prompt 的输出作为 model 的输入，model 的输出作为 parser 的输入
const chain = prompt.pipe(model).pipe(parser);

// 定义一个异步函数 run，用于执行整个流程
async function run() {
  // 调用链的 invoke 方法，并传入输入对象
  // LangChain 会自动处理提示的格式化、模型的调用以及输出的解析
  const response = await chain.invoke({ topic: "冰淇淋" });
  // 打印最终的字符串输出，这是一个纯文本字符串
  console.log("\n最终字符串输出:\n");
  console.log(response); // 这现在是一个纯字符串
}

// 调用 run 函数开始执行，并使用 .catch 捕获可能发生的错误
// 例如，如果缺少 API 密钥，将在此处捕获并打印错误
run().catch(console.error);

// 现在文本直接是一个字符串 -> 非常适合您的 socket.io / REST 响应。
