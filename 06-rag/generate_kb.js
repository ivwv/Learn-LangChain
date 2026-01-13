import fs from "fs";
import path from "path";

const categories = [
  { name: "天文", file: "astronomy.md" },
  { name: "地理", file: "geography.md" },
  { name: "水文", file: "hydrology.md" },
  { name: "历史", file: "history.md" },
  { name: "生物", file: "biology.md" },
  { name: "物理", file: "physics.md" },
  { name: "化学", file: "chemistry.md" },
  { name: "科技", file: "technology.md" },
  { name: "艺术", file: "art.md" },
  { name: "医学", file: "medicine.md" },
];

const dataDir = path.join(process.cwd(), "06-rag/data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 删除旧的 txt 文件
const allFiles = fs.readdirSync(dataDir);
allFiles.forEach((f) => {
  if (f.endsWith(".txt")) fs.unlinkSync(path.join(dataDir, f));
});

categories.forEach((cat) => {
  let entries = [];
  for (let i = 1; i <= 50; i++) {
    let entry = `## ${cat.name}知识点 ${i}
`;
    entry += `这是关于${cat.name}的第 ${i} 条详细描述内容。${cat.name}是一个非常广阔且深奥的领域，涵盖了人类对该领域探索的多种成果。具体来说，这是第 ${i} 个研究发现或常识总结。`;
    entries.push(entry);
  }
  const content = entries.join("======");
  fs.writeFileSync(path.join(dataDir, cat.file), content);
  console.log(`已生成: ${cat.file}`);
});
