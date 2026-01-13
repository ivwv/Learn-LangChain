// 导入 RunnableLambda 类，用于将普通 JavaScript 函数包装成 LangChain 可识别的工具
import { RunnableLambda } from "@langchain/core/runnables";
// 导入 Zod 库，用于数据验证
import { z } from "zod";

// 1️⃣ 定义一个 Zod Schema 来验证工具的输入
// 这个 schema 确保输入是一个对象，并且包含一个名为 'url' 的字符串字段，该字段必须是有效的 URL
const schema = z.object({
  url: z.string().url(),
});

// 2️⃣ 使用 RunnableLambda 创建网页抓取工具
// scrapeWebsite 是一个异步函数，它接收一个输入对象
export const scrapeWebsite = RunnableLambda.from(async (input) => {
  // 使用 schema.parse(input) 来验证输入。如果输入无效，Zod 会抛出错误。
  const { url } = schema.parse(input);

  try {
    // 尝试使用 fetch API 获取指定 URL 的内容
    const res = await fetch(url);

    // 检查 HTTP 响应是否成功 (状态码 200-299)
    if (!res.ok) {
      // 如果响应不成功，返回一个包含错误信息的对象
      return {
        success: false,
        error: `Failed to fetch URL. Status: ${res.status}`, // 记录失败状态码
      };
    }

    // 将响应体读取为纯文本 (HTML 内容)
    const html = await res.text();

    // 清理 HTML 内容，提取纯文本
    const text = html
      // 移除所有 <script> 标签及其内容
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      // 移除所有 <style> 标签及其内容
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      // 移除所有 HTML 标签，替换为空格
      .replace(/<[^>]+>/g, " ")
      // 将多个连续的空格替换为单个空格
      .replace(/\s+/g, " ")
      // 移除字符串两端的空白符
      .trim();

    // 返回一个结构化的成功响应对象
    return {
      success: true, // 表示操作成功
      url, // 抓取的 URL
      content: text.slice(0, 3000), // 返回清理后的文本内容，限制为前 3000 个字符以避免过长的 LLM 输入
    };
  } catch (err) {
    // 捕获任何在抓取或处理过程中发生的错误
    return {
      success: false, // 表示操作失败
      error: err.message, // 返回错误消息
    };
  }
});

// 3️⃣ 测试工具的主函数
async function main() {
  // 调用 scrapeWebsite 工具，传入一个包含要抓取 URL 的对象
  const result = await scrapeWebsite.invoke({
    url: "https://docs.langchain.com/oss/javascript/langgraph/overview.md", // 示例 URL
  });

  // 打印工具执行的结果
  console.log(result);
}

// 调用 main 函数开始执行程序
main();
