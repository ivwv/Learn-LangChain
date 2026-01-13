import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OpenAIEmbeddings } from "@langchain/openai";
import { config } from "dotenv";

config();

const embeddings = new OpenAIEmbeddings({
  configuration: {
    baseURL: process.env.OLLAMA_BASE_URL,
  },
  model: "qwen3-embedding:4b", // 确保与你 06-rag.js 中一致
});

async function checkChromaData() {
  try {
    // 1. 连接到你 Docker 运行的 Chroma
    const vectorStore = await Chroma.fromExistingCollection(embeddings, {
      collectionName: "langchain-demo", // 这里要和你存入时的 collectionName 一致
      url: "http://localhost:8300",
    });

    // 2. 尝试搜索一个已知词汇
    console.log("正在查询数据...");
    const results = await vectorStore.similaritySearch("Paresh", 2);

    if (results.length === 0) {
      console.log("❌ 未找到数据。请确保你已经运行过入库脚本，且 collectionName 匹配。");
    } else {
      console.log("✅ 成功找到数据！预览如下：");
      results.forEach((doc, i) => {
        console.log(`
[文档 ${i + 1}]:`);
        console.log(`内容: ${doc.pageContent}`);
        console.log(`元数据: ${JSON.stringify(doc.metadata)}`);
      });
    }
  } catch (error) {
    console.error("❌ 连接失败，请检查 Docker 是否启动并确认端口为 8300:", error.message);
  }
}

checkChromaData();
