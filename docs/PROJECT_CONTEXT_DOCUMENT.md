# OarBoard Project Context Document

## 1. 项目概述（Project Overview）

### 1.1 项目名称
- OarBoard

### 1.2 项目目的
- OarBoard 是一个个人划船机训练数据看板，用于可视化展示来自 Mok Fitness（摩刻健身）接口的运动数据。
- 项目目标是以比原生 App 更清晰、更美观的方式呈现划船训练结果。通过一套极其精美的动态 Bento Box（便当盒架构）和 Apple Fitness 风格的极简主义，重点突出划船场景下的关键指标。
- 当前产品形态是一个单页仪表盘，不涉及用户编辑数据，核心是“读取、聚合、展示”。
- 具备完善的运行时缓存与数据摘要层，用于减少首页首屏阻塞请求，提升大型热力图与历史概览的解析性能。

### 1.3 目标用户
- 主要用户：拥有 Mok Fitness 划船训练数据的个人用户。
- 使用场景：
  - 查看当天训练完成情况与动态环形进度条（Hero 区）。
  - 查看极客且通透的跨屏巨型概览：将历史累计资产与 52 周热力图共框（Macro Overview）。
  - 通过按周期切换的方式追踪里程与消耗趋势，辅以精准的动画数字滚动（Trend Section）。
  - 在侧边抽屉级深度的历史记录板里穿梭，并能实时观察每一次发力/配速的荧光面积折线图（Dashboard Section）。
- 次要用户：后续负责维护、扩展、修复此项目的 AI Agent 或开发者。

### 1.4 核心功能
- 通过 Next.js 后端服务化代理请求 Mok Fitness 数据。
- 在缺少 `MOKE_AUTHORIZATION` 情况下自动无缝切回本地 mock_data 以容灾。
- 整个页面分三段架构进行“宏观 -> 切片 -> 微观”的降维展现：
  - **Macro Overview**：2x2 胖卡片统计叠加全宽动态年份热力图。
  - **Trend Section**：基于周一算起的本周/本月/本年的 1x4 指标流体切换排布。
  - **Dashboard Details**：附带深邃左侧高亮选择态与双 Y 轴荧光发光面积图。
- 引入了 Framer Motion 动效流，承担包含进度条增长、数值滚动和布局变换在内的微动效。
- 通过 `.cache/moke/<accountId>/` 维护运行时缓存文件，包括 month files、summary、heatmap 和 index。

---

## 2. 技术栈（Tech Stack）

### 2.1 Next.js 16（App Router）
- 负责页面路由、服务端渲染（RSC）、服务器组件与 API Route。
- 项目当前完全拥抱 App Router，不存在 `pages/` 目录。
- 服务端组件优先，将交互较重的模块利用 `"use client"` 进行剥离保障 SEO。

### 2.2 Tailwind CSS 4
- 作为当前项目唯一样式方案，全面采用 v4 alpha/beta 体系。
- 深度并广泛运用了 utility class 构建“Geek Glassmorphism”（例如 `backdrop-blur-xl`, `bg-zinc-900/30`, `border-white/5` 搭配纯黑和暗光阴影的组合）。

### 2.3 Framer Motion
- UI 交互与“生命感”的基石。在项目中用于构建 `AnimatedNumber`、`AnimatedProgressBar` 等丝滑补间动画，以及 `layout` 层级的无缝卡片重组跳跃。

### 2.4 Recharts
- 用于在最下方数据面板渲染高密度的双 Y 轴折线网络。
- 采用了无刻度实体、抹去垂直分割线、通过 SVG `<defs><linearGradient>` 的改造手段，将其强行压制并升级为了暗黑系“发光面积图（Glow Area Chart）”。

### 2.5 Lucide React (新增)
- 遵循 “Purposeful Minimalism” 的图标解决方案。使用高度精简并且可动态响应 currentColor 和 Tailwind Stroke 的前端矢量图标。

### 2.6 Vercel
- 项目部署首选。要求提供 `MOKE_ACCOUNT_ID`、`MOKE_AUTHORIZATION` 等环境变量。
- 对运行时环境敏感：`.cache/moke` 在 Vercel 的运行周期无法得到持久化保障。

---

## 3. 项目架构（Architecture）

### 3.1 目录结构（当前真实结构）

#### `app/`
- Next.js App Router 核心入口。
- 仅包舍布局 `layout.tsx`，入口端 `page.tsx` 与后端的 API 中转器 `route.ts`。

#### `src/components/`
- 所有被提炼出来的页面分区和高频交互件：
  - `src/components/poster-hero.tsx` (首页最顶部纯服务端动态渲染海报卡)
  - `src/components/animated-metrics.tsx` (为数值滚动拔出独立的通用客户端逻辑)
  - `src/components/fitness-rings.tsx` (三向健身闭环 SVG 组件)
  - `src/components/macro-overview.tsx` (第一层宏观合体巨幅容器：内置田字格与宽版热力图)
  - `src/components/trend-section.tsx` (第二层阶段聚焦容器：管理周、月、年的跨度)
  - `src/components/dashboard-section.tsx` (第三层深度数据解剖容器：内含列表及面积雷达)

#### `src/lib/moke/`
- Mok Fitness 的底层网关层、强类型与防雪崩缓存代理（与之前架构一致）。

#### `src/lib/oarboard/`
- 数据向业务 View 转换的桥梁。把原始杂乱的数据组装给大卡片。包含：
  - `poster-data.ts`
  - `dashboard-data.ts`
  - `calendar-data.ts`
  - `rings.ts`

### 3.2 核心组件群改貌

#### `PosterHero` & `Animated Metrics`
- `PosterHero` 退为一个强服务端组件以保留首次并发流特性。它自身构建了一个灵活的小型 Bento-CSS-Grid，并通过向下传值给封装后的 `<AnimatedNumber>` 与 `<AnimatedProgressBar>` 实现纯客户端侧的无损入场。

#### `MacroOverviewSection`
- 取代了早期分散的 `LifetimeStats` 和一部分日程卡模块。
- 它是一个包含巨大弥散高光遮罩的巨型视口容器。
- 它的左侧强行划分为了 2x2 的深黑内凹胖卡片阵列，右侧则包裹着年度横向热力流，彻底解决了旧版头重脚轻或一边倒的平衡隐患。

#### `TrendSection`
- 接管了早期位于 `CalendarFirstSection` 的卡片统计逻辑。
- 采用 1x4 的并列长条展开排布。已使用 `rawValue` 的数值底层改造替代了字符串覆盖，配合 `Framer Motion`，能在各个时间跨度点之间提供连续的数据平滑跳跃快感。

#### `DashboardSection`
- 接管全部底部查询面板。
- 引入新的悬停及专属选种态设计（类似强光描边+透明青色叠加）。
- Area 图形渲染被极端化地降低了底噪，只保留速度流和桨频的流体视觉。

### 3.3 数据流变更说明
- 当前系统缓存逻辑（`.cache/moke`）已升级为“TTL + 增量同步”模型：
  - `summary.json` 与 `heatmap.json` 在 6 小时 TTL 内直接复用。
  - 超过 TTL 后，不会全量重抓 12 个月，而是基于 `index.latestWorkoutDay` 做增量刷新。
  - 刷新范围覆盖：`latestWorkoutDay` 所在月份到当前月份，并额外回看最近 7 天作为兜底窗口。
  - 新抓取记录会和已缓存 month files 中的 records 合并去重，再统一重建 `summary / heatmap / index / month files`。
  - 如果刷新失败但旧缓存存在，系统会回退到旧缓存，保证首页可用。
- TrendSection 的“本周”逻辑已经更新，开始支持标准的从星期一至星期日的严格自然周。

---

## 4. 页面说明（Page Description）

### 4.1 首页 `/`
- 结构由早期的“卡片无序堆叠”转入严格的三大块横向剖分：`MacroOverview` -> `TrendSection` -> `DashboardSection`。
- 本身具备极简极客之美，无需多余导航与侧边抽屉。

---

## 5. UI/UX 设计规范（Design Principles）
- 本次升级确立了项目的核心骨架为“Dynamic Bento Box”。
- 主导思想为“有目的的极简主义（Purposeful Minimalism）”，所有图标仅使用 Lucide-react 线框，配合高色纯度的 Accent Color 表达唯一用意，彻底抛弃无用拟物填充与花哨外边框。
- 文字方面，绝大部分可衡量数字都被锁定到等宽字体 `font-mono` 上，确保表格化视觉严丝合缝。

---

## 6. 已知问题与限制（Known Issues）

### 6.1 缓存刷新限制
- 历史缓存已不再是永久命中，但当前仍属于“基于月级接口的窗口增量同步”方案，而非严格的逐日增量流。
- 在极端情况下，如果上游接口返回延迟、跨月边界异常，仍可能需要扩大回看窗口或补充主动强刷机制。
- 当前 fallback 策略是“刷新失败则回退旧缓存”，因此首页可用性优先于绝对实时性。

### 6.2 其余技术债
- 热力图的滚轮机制需要在小宽屏进行辅助滚动，在部分场景不完美。
- `npm run build` 在 Windows 独立沙箱常会存在 EPERM 权限挂毯。

---

## 7. 编码规范（Coding Conventions）
- 维持早期定义的原则与模块拆解界限。绝不能为了 UI 把复杂的源数据拉取丢在 Client Component 里处理，数据清洗坚守服务端。

---

## 8. AI Agent 使用指南（CRITICAL）

### 8.1 严禁操作提醒
- **绝不要试图恢复：`lifetime-stats.tsx` 或 `calendar-first-section.tsx`，这两个组件已经被历史淘汰，相关逻辑均已在 `macro-overview` 与 `trend-section` 中重写。**
- 不要在未使用 `AnimatedNumber` 的情况下在 UI 直接裸写 `card.value` 给生硬的数据展示，我们要遵守高生命周期动效的全局底线。
- 请小心操作 `cachar-data`，其包含复杂的日期换算，极容易在热修改中引发周边界及年份热力图崩溃。
- 不要把 `cache-service.ts` 误判为“永久强缓存”旧实现；当前版本已包含 `6h TTL + latestWorkoutDay 增量刷新 + 最近 7 天兜底 + 失败回退旧缓存` 的刷新策略。

