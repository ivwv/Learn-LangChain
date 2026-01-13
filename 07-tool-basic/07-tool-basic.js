// 导入 RunnableLambda 类，用于将普通 JavaScript 函数包装成 LangChain 可识别的工具
import { RunnableLambda } from "@langchain/core/runnables";

// 定义一个加法工具
// RunnableLambda.from() 方法允许我们将一个函数转换为 LangChain 的 Runnable 格式，使其可以集成到链中
const addTool = RunnableLambda.from((input) => {
  // 从输入对象中解构出 'a' 和 'b' 两个参数
  const { a, b } = input;
  // 返回它们的和
  return a + b;
});

// 定义一个异步主函数 main
async function main() {
  // 调用 addTool 的 invoke 方法执行工具
  // 传入一个包含 'a' 和 'b' 属性的对象作为输入
  const result = await addTool.invoke({ a: 5, b: 7 });
  // 打印工具执行的结果
  console.log("结果:", result);
}

// 调用 main 函数开始执行
// 这里没有使用 .catch，因为工具本身没有异步操作或错误处理的复杂性，
// 但在实际应用中，通常会加上 .catch(console.error) 来处理潜在的错误。
main();
