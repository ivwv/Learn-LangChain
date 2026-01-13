// 导入 dotenv 库，用于加载 .env 文件中的环境变量
import { config } from "dotenv";
// 导入 RunnableLambda 类，用于将普通 JavaScript 函数包装成 LangChain 可识别的工具
import { RunnableLambda } from "@langchain/core/runnables";
// 从 @langchain/google-genai 库导入 ChatGoogleGenerativeAI 类，用于与 Google 的 Gemini 模型进行聊天交互
// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
// 从 @langchain/core/prompts 库导入 PromptTemplate 类，用于创建可重用的提示模板
import { PromptTemplate } from "@langchain/core/prompts";
// 从 @langchain/core/output_parsers 库导入 StringOutputParser 类，用于将 LLM 输出解析为字符串
import { StringOutputParser } from "@langchain/core/output_parsers";
// 导入 Zod 库，用于数据验证
import { z } from "zod";

// 调用 config() 函数加载 .env 文件中的环境变量。
config();

// ------------------------------------------------------
// 1️⃣ 抓取工具 (与 08 课类似，并有改进)
// ------------------------------------------------------

// 定义一个 Zod Schema 来验证抓取工具的输入。
// 确保输入是一个对象，包含一个名为 'url' 的字符串字段，该字段必须是有效的 URL。
const scrapeSchema = z.object({
  url: z.string().url(),
});

// 创建一个网页抓取工具。
// 这个工具使用 RunnableLambda 包装，使其成为 LangChain 链的一部分。
const scrapeWebsite = RunnableLambda.from(async (input) => {
  // 使用 scrapeSchema 验证输入。如果 URL 无效，将抛出错误。
  const { url } = scrapeSchema.parse(input);

  try {
    // 尝试使用 fetch API 获取指定 URL 的内容。
    const res = await fetch(url);
    // 检查 HTTP 响应是否成功 (状态码 200-299)。
    if (!res.ok) {
      // 如果响应不成功，返回一个包含错误信息的对象。
      return {
        success: false,
        error: `Failed to fetch URL. Status: ${res.status}`,
      };
    }

    // 将响应体读取为纯文本 (HTML 内容)。
    const html = await res.text();

    // 清理 HTML 内容，提取纯文本。
    const text = html
      // 移除所有 <script> 标签及其内容。
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      // 移除所有 <style> 标签及其内容。
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      // 移除所有 HTML 标签，替换为空格。
      .replace(/<[^>]+>/g, " ")
      // 将多个连续的空格替换为单个空格。
      .replace(/\s+/g, " ")
      // 移除字符串两端的空白符。
      .trim();

    // 返回一个结构化的成功响应对象。
    return {
      success: true, // 表示操作成功
      url, // 抓取的 URL
      content: text.slice(0, 3000), // 返回清理后的文本内容，限制为前 3000 个字符。
      // 这样做是为了防止 LLM 输入过长，并保持响应速度和成本效益。
    };
  } catch (err) {
    // 捕获任何在抓取或处理过程中发生的错误。
    return {
      success: false, // 表示操作失败
      error: err.message, // 返回错误消息
    };
  }
});

// ------------------------------------------------------
// 2️⃣ LLM (Gemini 模型)
// ------------------------------------------------------

// 初始化 ChatGoogleGenerativeAI 模型实例。
// 这是我们将用于生成摘要的 AI 大脑。
const model = new ChatOpenAI({
  // 指定要使用的模型名称，这里使用的是 GPT-4o 版本。
  model: "gpt-4o",
  // 从环境变量中获取 OpenAI API 密钥。
  apiKey: process.env.OPENAI_API_KEY,
});

// ------------------------------------------------------
// 3️⃣ 摘要提示模板
// ------------------------------------------------------

// 创建一个 PromptTemplate 实例，用于指导 LLM 生成摘要。
const summarizePrompt = PromptTemplate.fromTemplate(`
你是一个乐于助人的 AI 助手。

请用以下方式总结以下网站内容：
- 简洁的中文
- 5 个要点
- 突出网站的功能和目标受众

网站内容:
{content}

总结:
`);

// ------------------------------------------------------
// 4️⃣ 链: 提示模板 → 模型 → 解析器
// ------------------------------------------------------

// 构建一个摘要链，它将提示模板、LLM 模型和字符串输出解析器连接起来。
// 链的执行顺序是：summarizePrompt -> model -> StringOutputParser。
const summaryChain = summarizePrompt
  .pipe(model) // 将格式化后的提示传递给模型
  .pipe(new StringOutputParser()); // 将模型的原始输出传递给解析器，转换为纯字符串

// ------------------------------------------------------
// 5️⃣ 主要函数 – 运行工具 + LLM
// ------------------------------------------------------

// 定义一个异步主函数 main，用于执行整个管道。
async function main() {
  // 定义要抓取的 URL。
  const url = "https://sheryians.com";

  console.log("🔧 正在抓取网站...");
  // 调用网页抓取工具来获取网站内容。
  const scraped = await scrapeWebsite.invoke({ url });

  // 检查抓取操作是否成功。
  if (!scraped.success) {
    console.log("❌ 抓取错误:", scraped.error);
    return; // 如果抓取失败，则停止执行。
  }

  console.log("🧠 正在生成摘要...\\n");

  // 调用摘要链来生成网站内容的总结。
  // 将抓取到的内容作为 {content} 传递给摘要链。
  const summary = await summaryChain.invoke({
    content: scraped.content,
  });

  console.log("📌 最终摘要:\\n");
  // 打印最终生成的摘要。
  console.log(summary);
}

// 调用 main 函数开始执行程序，并捕获可能发生的错误。
main().catch(console.error);
