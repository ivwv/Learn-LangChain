import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Document } from "@langchain/core/documents";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载 .env
config({ path: path.join(__dirname, "../../.env") });

const app = express();
app.use(cors());
app.use(express.json());

// 1. 初始化嵌入模型
const embeddings = new OpenAIEmbeddings({
  model: "qwen3-embedding:4b", // 请确保这是你ollama中真实存在的模型名
  configuration: {
    baseURL: process.env.OLLAMA_BASE_URL,
  },
});

// 2. 初始化 LLM
const model = new ChatOpenAI({
  // model: "gpt-4o",
  // temperature: 0.7, // 稍微增加一点随机性，让对话更自然
  model: "gpt-4o",
  temperature: 0.7, // 稍微增加一点随机性，让对话更自然
  configuration: {
    // baseURL: process.env.OLLAMA_BASE_URL,
  },
});

const collectionName = "multi-category-kb-v5";
let vectorStore;

// --- 初始化向量数据库逻辑保持不变 ---
async function initVectorStore() {
  vectorStore = await Chroma.fromExistingCollection(embeddings, {
    collectionName: collectionName,
    url: "http://192.168.0.99:8300",
  });

  const count = await vectorStore.collection.count();
  if (count === 0) {
    console.log("检测到数据库为空，正在加载知识库文件...");
    const dataDir = path.join(__dirname, "../data");

    if (fs.existsSync(dataDir)) {
      const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".md"));
      const docs = [];

      for (const file of files) {
        const filePath = path.join(dataDir, file);
        const content = fs.readFileSync(filePath, "utf-8");
        const sections = content.split("======").filter((s) => s.trim() !== "");

        sections.forEach((section) => {
          const trimmedSection = section.trim();
          const lines = trimmedSection.split("\n");
          const firstLine = lines[0] || "";
          const titleMatch = firstLine.match(/^##\s+(.*)/);
          const title = titleMatch ? titleMatch[1].trim() : "未命名知识点";

          docs.push(
            new Document({
              pageContent: trimmedSection,
              metadata: {
                source: file,
                title: title,
                category: file.replace(".md", ""),
              },
            })
          );
        });
      }

      if (docs.length > 0) {
        console.log(`准备入库 ${docs.length} 条文档...`);
        const chunkSize = 50;
        for (let i = 0; i < docs.length; i += chunkSize) {
          const chunk = docs.slice(i, i + chunkSize);
          await vectorStore.addDocuments(chunk);
        }
        console.log("🎉 数据入库完成");
      }
    }
  } else {
    console.log(`📊 数据库 [${collectionName}] 中已存在 ${count} 条记录。`);
  }
}

// 模拟内存对话历史
const historyMap = new Map();

// --- 核心修改：流式接口 ---
app.post("/api/chat/stream", async (req, res) => {
  const { sessionId, question } = req.body;

  // 1. 设置 SSE 响应头
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  if (!sessionId || !question) {
    res.write(`data: ${JSON.stringify({ error: "Missing sessionId or question" })}\n\n`);
    res.end();
    return;
  }

  try {
    let history = historyMap.get(sessionId) || [];

    // 2. 检索相关文档
    const similarDocs = await vectorStore.similaritySearch(question, 3);
    const context = similarDocs.map((d) => d.pageContent).join("\n");

    // 提取来源并去重
    const sourceList = similarDocs.map((d) => `[${d.metadata.source}] ${d.metadata.title}`);
    const uniqueSources = [...new Set(sourceList)];

    // 3. 立即向客户端发送来源信息 (Type: sources)
    res.write(`data: ${JSON.stringify({ type: "sources", data: uniqueSources })}\n\n`);

    // 构建 Prompt
    const historyText = history
      .slice(-6) // 取最近6条
      .map((h) => `${h.role === "user" ? "用户" : "助手"}: ${h.content}`)
      .join("\n");

    const promptTemplate = `你是一个专业的知识库助手。请结合对话历史和提供的上下文内容回答用户的问题。
对话历史:
{history}

上下文内容:
{context}

当前问题:
{question}

回答:`;

    const prompt = PromptTemplate.fromTemplate(promptTemplate);
    const chain = prompt.pipe(model).pipe(new StringOutputParser());

    // 4. 开启流式生成
    const stream = await chain.stream({
      history: historyText || "无历史记录",
      context: context || "无相关上下文",
      question,
    });

    let fullAnswer = "";

    // 5. 循环推送数据块 (Type: content)
    for await (const chunk of stream) {
      fullAnswer += chunk;
      // SSE 格式: data: {json}\n\n
      res.write(`data: ${JSON.stringify({ type: "content", data: chunk })}\n\n`);
    }

    // 6. 更新历史记录 (只有在生成完成后才保存，保证历史记录完整)
    history.push({ role: "user", content: question });
    history.push({ role: "assistant", content: fullAnswer });

    // 限制历史长度
    if (history.length > 10) history = history.slice(-10);
    historyMap.set(sessionId, history);

    // 发送结束信号 (Type: done)
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Chat Error:", error);
    res.write(`data: ${JSON.stringify({ error: "Internal Server Error" })}\n\n`);
    res.end();
  }
});

const PORT = 3000;
initVectorStore()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize vector store:", err);
  });
