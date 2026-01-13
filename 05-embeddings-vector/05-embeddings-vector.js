// 导入 dotenv 库，用于加载 .env 文件中的环境变量
import { config } from "dotenv";
// 从 @langchain/google-genai 库导入 GoogleGenerativeAIEmbeddings 类，用于生成文本嵌入
// import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { OpenAIEmbeddings } from "@langchain/openai";
// 从 @langchain/classic/vectorstores/memory 库导入 MemoryVectorStore 类，用于创建内存向量存储
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";

// 调用 config() 函数加载 .env 文件中的环境变量。
// 这使得可以通过 process.env.VAR_NAME 访问 .env 文件中定义的环境变量。
config();
process.env.OPENAI_BASE_URL = process.env.OLLAMA_BASE_URL;

// 1️⃣ 初始化嵌入模型 (将文本转换为向量数字)
const embeddings = new OpenAIEmbeddings({
  // 指定用于生成嵌入的模型，这里使用的是 OpenAI 的 text-embedding-004 模型
  model: "qwen3-embedding:4b",
  // 从环境变量中获取 OpenAI API 密钥
  // configuration: {
  //   baseURL: process.env.OPENAI_BASE_URL,
  // },
  // apiKey: process.env.OPENAI_API_KEY,
});

// 2️⃣ 初始化向量存储 (基于内存，快速，无需数据库)
const vectorStore = new MemoryVectorStore(embeddings);

// 定义一个异步主函数
async function main() {
  // 3️⃣ 向向量存储添加一些文档
  await vectorStore.addDocuments([
    {
      pageContent: "Paresh 正在使用 LangChain 构建一个智能体 AI 后端。",
    },
    {
      pageContent: "他希望通过构建 RAG、智能体和电子商务 AI 应用达到 15 LPA 的目标。",
    },
    {
      pageContent: "LangChain 帮助轻松创建智能体、链、工具和向量内存。",
    },
    {
      pageContent: "Paresh 今年 20 岁。",
    },
    {
      pageContent:
        "微服务架构是一种将应用程序构建为松散耦合服务集合的设计方法。每个服务都有特定的业务功能，可以独立开发、部署和扩展。这种架构提高了系统的可维护性和灵活性，但同时也增加了分布式系统的复杂性。",
    },
    {
      pageContent:
        "RESTful API 设计遵循资源导向的架构风格，使用 HTTP 动词表示操作，通过状态码表达结果。良好的 API 设计应该具备一致性、可发现性和良好的文档支持，采用版本控制来管理 API 的演进。",
    },
    {
      pageContent:
        "数据库索引是提高查询性能的关键技术。B+树索引适用于范围查询，哈希索引适用于精确匹配，位图索引适用于低基数列。创建索引需要权衡查询性能和写入开销，适当的索引策略可以显著提升系统响应速度。",
    },
    {
      pageContent:
        "持续集成和持续部署（CI/CD）是现代软件开发的最佳实践。通过自动化构建、测试和部署流程，团队可以更快地交付高质量软件。Jenkins、GitLab CI 和 GitHub Actions 是常用的 CI/CD 工具。",
    },
    {
      pageContent:
        "容器化技术通过 Docker 和 Kubernetes 实现了应用的可移植性和可扩展性。容器提供了轻量级的虚拟化，共享主机操作系统内核，比传统虚拟机更加高效。Kubernetes 提供了容器编排和自动扩缩容能力。",
    },
    {
      pageContent:
        "代码审查是保证代码质量的重要环节。通过同事之间的相互审查，可以发现潜在问题、分享知识、保持代码风格一致。Pull Request 和 Merge Request 是常用的代码审查工作流程。",
    },
    {
      pageContent:
        "软件测试金字塔包括单元测试、集成测试和端到端测试。单元测试占比最大，运行最快，专注于验证单个函数或类的行为。测试驱动开发（TDD）是一种先写测试后写实现的方法论。",
    },
    {
      pageContent:
        "系统设计中的CAP定理指出分布式系统无法同时满足一致性、可用性和分区容错性。在设计分布式系统时，需要根据业务需求在这三个特性之间做出权衡，选择合适的架构方案。",
    },
    {
      pageContent:
        "消息队列如 RabbitMQ 和 Kafka 在分布式系统中起着异步通信和解耦的作用。Kafka 适合高吞吐量的日志流处理，RabbitMQ 提供丰富的路由功能。选择合适的消息中间件需要考虑吞吐量、延迟和可靠性需求。",
    },
    {
      pageContent:
        "缓存策略是提升系统性能的重要手段。Redis 和 Memcached 是常用的分布式缓存解决方案。合理的缓存过期策略、缓存穿透防护和缓存雪崩处理是缓存设计的关键考虑因素。",
    },
    {
      pageContent:
        "系统安全设计需要遵循最小权限原则。输入验证、SQL 注入防护、XSS 防护和 CSRF 防护是 Web 应用安全的基本要求。HTTPS、身份认证和授权机制是保护系统安全的基石。",
    },
    {
      pageContent:
        "性能优化需要从多个维度进行。数据库查询优化包括使用适当的索引、避免 N+1 查询、优化慢查询。应用层优化包括代码算法改进、异步处理、资源池化。前端优化包括代码分割、懒加载和缓存策略。",
    },
    {
      pageContent:
        "领域驱动设计（DDD）是一种复杂软件系统的设计方法论。它强调通过深入理解业务领域来构建软件模型。核心概念包括限界上下文、聚合、实体、值对象和领域事件。",
    },
    {
      pageContent:
        "事件驱动架构通过事件的发布和订阅实现系统组件之间的松耦合。这种架构适合处理异步任务、实时系统和复杂的业务流程。事件溯源和 CQRS 是事件驱动架构中的重要模式。",
    },
    {
      pageContent:
        "云原生应用设计遵循十二要素应用原则。这些原则包括基准代码管理、显式依赖声明、配置外部化、后台服务等同、无状态进程、端口绑定、并发模型、便利性原则和开发生产平等。",
    },
    {
      pageContent:
        "服务网格如 Istio 和 Linkerd 提供了微服务间通信的可观测性、安全性和流量管理能力。通过 Sidecar 代理模式，服务网格可以在不修改应用代码的情况下实现服务治理功能。",
    },
    {
      pageContent:
        "Git 版本控制是现代软件开发的基础。分支策略如 Git Flow 和 GitHub Flow 指导团队协作开发。代码合并冲突的解决需要理解基础分支的变更并谨慎地整合代码。",
    },
    {
      pageContent:
        "接口隔离原则（ISP）是 SOLID 设计原则之一。它建议将大型接口拆分为多个小型、特定的接口，使客户端只依赖它们需要的方法。这减少了不必要的依赖和耦合，提高了系统的灵活性。",
    },
    {
      pageContent:
        "高可用系统设计需要考虑冗余、故障转移和负载均衡。通过多活数据中心、自动扩缩容和健康检查机制，系统可以在组件故障时继续提供服务。SLA 和 SLO 是衡量可用性的关键指标。",
    },
    {
      pageContent:
        "面向对象设计原则包括封装、继承和多态。SOLID 原则（单一职责、开放封闭、里氏替换、接口隔离和依赖倒置）提供了编写可维护、可扩展代码的指导方针。",
    },
    {
      pageContent:
        "API 网关是微服务架构的统一入口点。它负责请求路由、负载均衡、身份认证、限流熔断和日志监控。Kong、Apigee 和 AWS API Gateway 是常用的 API 网关解决方案。",
    },
    {
      pageContent:
        "分布式事务管理是微服务架构中的挑战。二阶段提交（2PC）、三阶段提交（3PC）和Saga模式是处理分布式事务的常见方法。TCC（Try-Confirm-Cancel）模式适用于需要强一致性的场景。",
    },
    {
      pageContent:
        "代码重构是持续改进代码质量的过程。识别代码异味（如长方法、重复代码、巨型类）并应用重构技术可以提高代码的可读性和可维护性。重构应该在有测试保障的情况下进行。",
    },
    {
      pageContent:
        "无服务器架构（Serverless）如 AWS Lambda 和阿里云函数计算允许开发者专注于业务逻辑代码，无需管理服务器。事件驱动和按需执行是无服务器架构的特点，适合处理突发流量和定时任务。",
    },
    {
      pageContent:
        "搜索引擎技术如 Elasticsearch 提供了全文搜索和分析能力。倒排索引是搜索引擎的核心数据结构，支持高效的词汇查询。分词器和相关性评分算法决定了搜索结果的质量。",
    },
    {
      pageContent:
        "系统监控和可观测性包括指标、日志和追踪三大支柱。Prometheus 和 Grafana 组合用于指标监控，ELK Stack（Elasticsearch、Logstash、Kibana）用于日志分析，Jaeger 和 Zipkin 用于分布式追踪。",
    },
    {
      pageContent:
        "OAuth 2.0 和 OpenID Connect 是现代身份认证和授权的标准协议。授权码流程适用于 Web 应用，客户端凭证流程适用于服务间通信，PKCE 增强了移动和单页应用的安全性。",
    },
    {
      pageContent:
        "GraphQL 是一种 API 查询语言和运行时，它允许客户端精确请求所需的数据。与 REST 相比，GraphQL 减少了网络请求次数，避免了数据过度获取，但需要合理的查询复杂度限制和缓存策略。",
    },
    {
      pageContent:
        "设计模式是软件设计中常见问题的解决方案。创建型模式（单例、工厂、建造者）处理对象创建，结构型模式（适配器、装饰器、代理）处理对象组合，行为型模式（观察者、策略、状态）处理对象交互。",
    },
    {
      pageContent:
        "Kubernetes 核心概念包括 Pod、Service、Deployment、StatefulSet、ConfigMap 和 Secret。Pod 是最小调度单元，Service 提供服务发现和负载均衡，Deployment 管理无状态应用的部署和扩缩容。",
    },
    {
      pageContent:
        "数据库事务的 ACID 特性保证了数据的一致性。原子性确保操作全做或全不做，一致性保证事务前后数据都处于有效状态，隔离性控制并发事务之间的相互影响，持久性确保提交的事务不会丢失。",
    },
    {
      pageContent:
        "异步编程模式提高了系统的并发能力和响应速度。JavaScript 的 Promise 和 async/await、Python 的 asyncio、Java 的 CompletableFuture 提供了优雅的异步编程接口。事件循环是异步执行的基础机制。",
    },
    {
      pageContent:
        "负载测试和压力测试是验证系统性能的重要手段。JMeter、Locust 和 k6 是常用的性能测试工具。测试场景应该模拟真实用户行为，关注响应时间、吞吐量和系统资源的利用率。",
    },
    {
      pageContent:
        "技术债是快速开发中积累的代码质量和设计问题。适度的技术债可以加速产品上市，但需要定期偿还。代码重构、自动化测试和技术升级是偿还技术债的主要方式。",
    },
    {
      pageContent:
        "混沌工程通过在生产环境中引入故障来验证系统的韧性。Netflix 的 Chaos Monkey 是著名的混沌工程工具。故障模式包括服务延迟、资源耗尽和网络分区，目标是提前发现系统的薄弱环节。",
    },
    {
      pageContent:
        "API 版本管理是 API 演进的关键策略。URI 路径版本化（如 /v1/resource）和 Header 版本化（如 Accept: application/vnd.api.v1+json）是常见的版本控制方式。向后兼容性应该尽可能保持。",
    },
    {
      pageContent:
        "领域特定语言（DSL）是为特定问题域设计的编程语言。SQL 用于数据库查询，HTML 用于网页结构，Regex 用于模式匹配。构建内部 DSL 可以提高领域专家和开发者之间的沟通效率。",
    },
    {
      pageContent:
        "分布式锁是协调分布式系统并发访问的机制。Redis 的 SETNX 和 Redlock 算法、ZooKeeper 的临时顺序节点是实现分布式锁的常见方式。锁的过期时间设置需要平衡安全性和可用性。",
    },
    {
      pageContent:
        "响应式编程是一种面向数据流和变化传播的编程范式。Reactor、RxJava 和 Project Reactor 提供了丰富的响应式编程库。背压（Backpressure）是响应式系统处理负载的重要机制。",
    },
    {
      pageContent:
        "基础设施即代码（IaC）通过代码管理 IT 基础设施。Terraform 和 Pulumi 是声明式 IaC 工具，Ansible 和 Chef 是命令式配置管理工具。IaC 实现了基础设施的可重复部署和版本控制。",
    },
    {
      pageContent:
        "服务降级和熔断是保护系统稳定性的重要机制。当服务出现故障时，熔断器阻止请求继续发送到故障服务，服务降级提供备选响应。Hystrix 和 Resilience4j 是常用的熔断库。",
    },
    {
      pageContent:
        "搜索引擎优化（SEO）技术包括语义化 HTML、合理的标题层级结构、内部链接优化和页面加载速度优化。结构化数据标记（Schema.org）可以帮助搜索引擎更好地理解页面内容。",
    },
    {
      pageContent:
        "单点登录（SSO）允许用户使用一套凭证访问多个应用。SAML 和 OAuth 2.0 的 Authorization Code Flow with PKCE 是实现 SSO 的主流协议。CAS（Central Authentication Service）是另一种 SSO 解决方案。",
    },
    {
      pageContent:
        "数据湖和数据仓库是两种不同的数据存储架构。数据湖存储原始格式的多样化数据，适合探索性分析；数据仓库存储结构化的加工后数据，适合报表和 BI 分析。Lake House 架构试图融合两者优势。",
    },
    {
      pageContent:
        "边缘计算将计算和数据存储推送到靠近数据源的边缘节点，减少延迟和带宽消耗。CDN 缓存、物联网网关和 5G MEC（多接入边缘计算）是边缘计算的典型应用场景。",
    },
  ]);

  console.log("文档已添加到向量存储。\\n");

  // 4️⃣ 执行查询 → 转换为向量 → 查找相似文档
  const result = await vectorStore.similaritySearch(
    "OAuth" // 查询文本
    // 2 // 返回最相似的 2 个文档
  );

  console.log("🔍 搜索结果:\\n");
  console.log(result);
}

// 调用主函数并捕获可能发生的错误
main().catch(console.error);
