# 产品需求文档 (PRD): GitFolio X - 生成式代码宇宙

| 文档版本     | V1.0                                                                                 |
| :----------- | :----------------------------------------------------------------------------------- |
| **项目名称** | GitFolio X (代号: Galaxy)                                                            |
| **目标用户** | 计算机专业大学生、寻找实习/工作的开发者、开源贡献者                                  |
| **核心价值** | 将枯燥的代码仓库转化为 HR 易读的 3D 可视化交互简历，利用 AI 挖掘代码背后的技术实力。 |
| **技术核心** | React 19 (RSC), Next.js 15, React Three Fiber (R3F), GraphQL, LLM-driven UI          |

---

## 1. 产品背景与痛点分析

- **痛点 (Pain Point):**
  - **信息鸿沟:** 学生的 GitHub 往往包含大量课程作业或未完成的项目，HR 和非技术面试官看不懂代码质量，只看 Star 数（通常很少）。
  - **展示同质化:** 传统的 Resume 模板千篇一律，无法体现“极客”精神。
  - **自我营销弱:** 学生难以从自己的代码中提炼出“具备高并发处理意识”、“擅长模块化设计”等软技能描述。
- **解决方案 (Solution):**
  - **可视化:** 用 3D 星系图展示提交记录和项目规模，视觉冲击力强。
  - **AI 解读:** 自动分析代码逻辑，生成“技术画像”和“能力雷达”。
  - **千人千面:** 也就是 **Generative UI**，根据用户的代码风格（严谨 vs 创意）自动生成不仅配色不同，甚至布局结构都不同的网页。

---

## 2. 核心功能需求 (Functional Requirements)

### 2.1 极速入口 (The Instant Entry)

- **输入:** 仅需输入 GitHub Username（无需 OAuth 登录，降低门槛，除非需要分析私有库）。
- **状态反馈:** 使用 **React Suspense** + **Streaming** 技术，让用户实时看到 AI 正在“阅读”哪个仓库（例如：“正在分析 `final-year-project` 的代码架构...”）。

### 2.2 3D 代码星系 (The Code Galaxy)

- **视觉隐喻:**
  - 每一个 Repository 是一个**星球**（大小取决于代码量/复杂度）。
  - 每一次 Commit 是环绕星球的**卫星/粒子**（颜色代表语言，如 TypeScript 是蓝色，Python 是黄色）。
  - 星球之间的连线代表技术栈的关联性。
- **交互:** 用户可以拖拽旋转星系，点击星球会进入“低空轨道”，展示项目的 README 摘要和核心代码片段。

### 2.3 AI 技能猎头 (The AI Recruiter Agent)

- **代码质量审计:** AI 不仅仅统计行数，它会通过 Sampling（采样）阅读核心逻辑，评价：
  - _注释规范度_
  - _工程化程度 (是否配置了 ESLint, Dockerfile, CI/CD)_
  - _算法复杂度 (是否存在过度嵌套)_
- **生成自然语言报告:**
  - “这位候选人偏好函数式编程，习惯在凌晨 2 点提交代码（典型的夜猫子极客）。”
  - “他在 `Shop-Backend` 项目中展示了对 RESTful API 设计的深刻理解。”

### 2.4 生成式简历 (The Generative Resume)

- **动态布局:**
  - 如果用户是**后端向**: 页面风格偏向终端风 (Terminal Style)，强调数据架构，减少花哨动画。
  - 如果用户是**前端/设计向**: 页面风格偏向玻璃拟态 (Glassmorphism)，强调 3D 交互和色彩。
- **一键导出:** 支持导出为 PDF 或部署为 Vercel 独立站点。

---

## 3. 技术架构与探索 (Technical Architecture) - _重点部分_

此项目将作为您展示 2025 年全栈能力的标杆。

### 3.1 前端框架：React 19 & Next.js 15

- **React Server Components (RSC):**
  - _应用场景:_ GitHub API 的数据获取、AI 分析结果的生成，全部在服务端完成。客户端只接收渲染好的 UI 流，首屏加载极快。
  - _Server Actions:_ 处理表单提交（输入 ID）和生成请求，无需编写独立的 API Route。
- **React Compiler (React Forget):**
  - 自动处理 `useMemo` 和 `useCallback`，在处理大量 3D 节点数据时，保证极高的渲染性能，无需手动优化。

### 3.2 3D 渲染引擎：React Three Fiber (R3F) + WebGPU

- **WebGPU Ready:** 虽然 R3F 默认基于 WebGL，但在 2025 年，我们应尝试引入 `Three.js` 的 **WebGPURenderer**。这将允许我们在浏览器中渲染数万个粒子（Commits）而不掉帧。
- **Drei & Ecosystem:**
  - 使用 `@react-three/drei` 中的 `Html` 组件将 DOM 元素（如文字标签）嵌入 3D 场景。
  - 使用 `instancedMesh` 技术：一次绘制调用渲染成千上万个几何体（星球/粒子），这是高性能的关键。

### 3.3 数据层：GraphQL & Edge Caching

- **GitHub GraphQL API v4:** 相比 REST API，GraphQL 可以一次请求获取 User -> Repositories -> Languages -> Commits 的深层嵌套数据，避免 Waterfall 请求。
- **Edge Runtime:** 将数据获取逻辑部署在 Edge Function 上，利用地理位置优势加速 GitHub 数据抓取。

### 3.4 AI 驱动层：Structured Output & Generative UI

- **Model:** 调用 OpenAI `gpt-4o-mini` 或 Anthropic `claude-3-haiku` (低成本、高速度)。
- **Structured Output (Zod Schema):** 强制 AI 返回 JSON 格式的数据。
  - _不仅仅是文本:_ AI 甚至决定 UI 组件的 Props。例如 AI 返回 `{ "theme": "cyberpunk", "layout": "grid", "highlightColor": "#00ffcc" }`，前端根据这个配置动态加载 Tailwind 类名。
  - _Vercel AI SDK:_ 使用 `streamUI` 函数，直接从服务器流式传输 React 组件给客户端。

---

## 4. 详细实施路线图 (Implementation Roadmap)

### Phase 1: 原型与数据跑通 (MVP)

1.  搭建 Next.js 15 + Tailwind 环境。
2.  编写 GraphQL 查询，获取指定用户的 Top 10 仓库、常用语言分布、提交热力图数据。
3.  实现一个简单的 JSON 页面展示抓取到的数据。

### Phase 2: 视觉化构建 (The "Wow" Factor)

1.  引入 **React Three Fiber**。
2.  实现“星系生成算法”：
    - 中心点是 User。
    - 轨道半径 = 项目时间远近。
    - 星球体积 = Star 数 + Fork 数。
    - 星球材质 = 根据主要语言生成程序化纹理 (Procedural Texture)。
3.  添加后处理效果 (Post-processing)：Bloom (发光) 效果，让星系看起来有科技感。

### Phase 3: AI 智能接入 (The Brain)

1.  集成 OpenAI API。
2.  编写 Prompt 工程：提取 `README.md` 内容，让 AI 用“招聘经理”的口吻写 3 句亮点总结。
3.  实现“技能雷达图”数据生成。

### Phase 4: 性能与部署 (Polish)

1.  优化 3D 性能（使用 Instancing）。
2.  添加 `og:image` 动态生成功能（当链接分享到微信/Twitter 时，显示生成的简历缩略图）。
3.  部署至 Vercel。

---

## 5. 关键技术难点与解决方案 (Technical Challenges)

### 难点 A: GitHub API 速率限制 (Rate Limiting)

- **问题:** 匿名访问 API 次数有限，容易触发 403。
- **2025 解决方案:** 实现更智能的 **ISR (Incremental Static Regeneration)**。
  - 对于同一个用户 ID 的请求，如果 24 小时内已生成过，直接返回缓存的页面（HTML + RSC Payload），不再请求 GitHub。
  - 对于热门用户，自动触发后台预构建。

### 难点 B: 3D 场景与 HTML 的交互同步

- **问题:** 拖拽 3D 星球时，2D 的文字介绍面板如何平滑跟随且不遮挡？
- **解决方案:** 使用 R3F 的 `<View>` (Tunneling) 技术，或者将 HTML UI 层与 Canvas 层分离，通过 Zustand 状态库同步坐标。当 3D 摄像机移动时，只计算投影坐标更新 DOM 位置。

### 难点 C: 移动端适配

- **问题:** 手机浏览器跑 3D 星系可能会卡顿或发热。
- **解决方案:** **渐进式增强 (Progressive Enhancement)**。
  - 检测设备性能（通过 `navigator.hardwareConcurrency` 或 FPS 侦测）。
  - 如果是高性能设备 -> 渲染完整 WebGL 星系。
  - 如果是低端设备 -> 自动降级为 Canvas 2D 绘图或精美的 SVG 交互图表。

---

## 6. 面试/简历亮点话术 (Why this project wins)

当你在面试中介绍这个项目时，可以强调：

1.  **"我没有使用现成的图表库，而是基于 React Three Fiber 手写了 3D 空间布局算法，并使用了 InstancedMesh 优化，使得页面能以 60FPS 渲染 5000+ 个节点。"** (体现图形学与性能优化)
2.  **"我利用 React Server Components 实现了 AI 分析的流式传输，用户在看到 3D 场景加载的同时，AI 的分析文字是一个字一个字打出来的，极大地降低了首屏跳出率。"** (体现对现代 React 架构和 UX 的理解)
3.  **"利用 Generative UI 的概念，我让 AI 控制了前端组件的渲染逻辑，实现了真正的动态界面。"** (体现对 AI Native 开发模式的探索)
