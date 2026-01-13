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
  model: "gpt-4o",
});

async function main() {
  // 更改集合名称以重新导入修复后的数据
  const collectionName = "multi-category-kb-v5";

  // 3️⃣ 连接到 Chroma 向量数据库
  const vectorStore = await Chroma.fromExistingCollection(embeddings, {
    collectionName: collectionName,
    url: "http://192.168.0.99:8300",
  });

  // 4️⃣ 处理 .md 文件并填充数据
  const count = await vectorStore.collection.count();
  if (count === 0) {
    console.log("检测到数据库为空，正在加载 10 大类别知识库...");

    const dataDir = path.join(process.cwd(), "06-rag/data");
    const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".md"));
    const docs = [];

    for (const file of files) {
      const filePath = path.join(dataDir, file);
      const content = fs.readFileSync(filePath, "utf-8");

      // 使用正则匹配 ====== 并处理前后换行
      const sections = content.split(/\r?\n?======\r?\n?/).filter((s) => s.trim() !== "");

      sections.forEach((section) => {
        const trimmedSection = section.trim();
        const lines = trimmedSection.split("\n");
        const firstLine = lines[0] || "";

        // 匹配第一行是否为标题
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
        console.log(`✅ 已写入进度: ${Math.min(i + chunkSize, docs.length)} / ${docs.length}`);
      }
      console.log("🎉 数据入库完成");
    }
  } else {
    console.log(`📊 数据库 [${collectionName}] 中已存在 ${count} 条记录。`);
  }

  // 5️⃣ 执行测试搜索
  const questions = [
    "什么是黑洞，它有什么特点？",
    "介绍一下牛顿第一定律",
    "如何预防高血压？",
    "文艺复兴三杰是谁？",
    "什么是 5G 通信技术？",
  ];

  for (const question of questions) {
    console.log("\n" + "=".repeat(60));
    console.log(`❓ 问题: ${question}`);

    // 检索
    const similarDocs = await vectorStore.similaritySearch(question, 4);

    // 输出来源
    console.log("🔍 知识库引用来源:");
    const sourceInfo = similarDocs.map((d) => `[${d.metadata.source}] -> ${d.metadata.title}`);
    const uniqueSourceInfo = [...new Set(sourceInfo)];
    uniqueSourceInfo.forEach((s) => console.log(`  📍 ${s}`));

    // 构建 RAG 链并回答
    const context = similarDocs.map((d) => d.pageContent).join("\\n");
    const prompt =
      PromptTemplate.fromTemplate(`你是一个专业的知识库助手。请根据以下上下文详细回答问题。

上下文内容:
{context}

待回答问题:
{question}

回答:`);

    const chain = prompt.pipe(model).pipe(new StringOutputParser());
    const answer = await chain.invoke({ context, question });

    console.log(`
💡 AI 回答:
${answer}`);
  }
}

main().catch(console.error);
