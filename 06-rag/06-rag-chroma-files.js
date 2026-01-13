import { config } from "dotenv";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Document } from "@langchain/core/documents";
import fs from "fs";
import path from "path";

config();

// 1️⃣ 初始化嵌入模型
const embeddings = new OpenAIEmbeddings({
  model: "qwen3-embedding:4b",
  configuration: {
    baseURL: process.env.OLLAMA_BASE_URL,
  },
});

// 2️⃣ 初始化 LLM
const model = new ChatOpenAI({
  model: "gpt-4", // 修改为更常用的模型名称
});

async function main() {
  // 3️⃣ 连接到 Chroma 向量数据库
  const vectorStore = await Chroma.fromExistingCollection(embeddings, {
    collectionName: "tech-knowledge-base-v2", // 使用新集合避免冲突
    url: "http://192.168.0.99:8300",
  });

  // 4️⃣ 从文件读取数据并填充 (仅在第一次运行或需要更新时执行)
  const count = await vectorStore.collection.count();
  if (count === 0) {
    console.log("检测到数据库为空，正在从文件初始化数据...");

    const dataDir = path.join(process.cwd(), "06-rag/data");
    const files = fs.readdirSync(dataDir);
    const docs = [];

    for (const file of files) {
      if (file.endsWith(".txt")) {
        const filePath = path.join(dataDir, file);
        const content = fs.readFileSync(filePath, "utf-8");

        // 按行拆分简单的示例文档
        const lines = content.split("\n").filter((line) => line.trim() !== "");

        lines.forEach((line) => {
          docs.push(
            new Document({
              pageContent: line,
              metadata: {
                source: file, // 记录文件名到 metadata
                category: "knowledge-base",
              },
            })
          );
        });
      }
    }

    if (docs.length > 0) {
      await vectorStore.addDocuments(docs);
      console.log(`✅ 数据入库完成，共 ${docs.length} 条记录`);
    }
  } else {
    console.log(`📊 数据库中已存在 ${count} 条记录。`);
  }

  // 5️⃣ 执行搜索
  const question = "如何实现单点登录 SSO";
  const similarDocs = await vectorStore.similaritySearch(question, 3);

  // 6️⃣ 输出引用的知识库文件
  console.log("🔍 检索到的引用来源:");
  const sources = similarDocs.map((d) => d.metadata.source);
  const uniqueSources = [...new Set(sources)];
  uniqueSources.forEach((source) => console.log(`- [文件]: ${source}`));

  // 7️⃣ 构建 RAG 链
  const context = similarDocs.map((d) => d.pageContent).join("\n");
  const prompt = PromptTemplate.fromTemplate(`使用上下文回答问题。

CONTEXT:
{context}

QUESTION:
{question}

ANSWER:`);

  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  const answer = await chain.invoke({ context, question });

  console.log("📌 AI 答案:", answer);
}

main().catch(console.error);
