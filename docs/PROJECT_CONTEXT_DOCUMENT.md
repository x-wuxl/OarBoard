# OarBoard Project Context Document

## 1. 项目概述（Project Overview）

### 1.1 项目名称
- OarBoard

### 1.2 项目目的
- OarBoard 是一个个人划船机训练数据看板，用于可视化展示来自 Mok Fitness（摩刻健身）接口的运动数据。
- 项目目标是以比原生 App 更清晰、更美观的方式呈现划船训练结果，重点突出划船场景下最重要的指标，例如 500m 配速、桨频、训练频率和总里程。
- 当前产品形态是一个单页仪表盘，不涉及用户编辑数据，核心是“读取、聚合、展示”。
- 第二阶段优化已落地一套运行时缓存与数据摘要层，用于减少首页首屏阻塞请求，并为热力图、历史列表和累计统计提供更轻量的数据来源。

### 1.3 目标用户
- 主要用户：拥有 Mok Fitness 划船训练数据的个人用户。
- 使用场景：
  - 查看当天训练完成情况。
  - 查看最近训练记录和详细曲线。
  - 查看近一年训练热力图和周/月/年统计趋势。
  - 查看累计总时长、总消耗、总距离、总训练次数。
- 次要用户：后续负责维护、扩展、修复此项目的 AI Agent 或开发者。

### 1.4 核心功能
- 通过 Next.js 后端代理请求 Mok Fitness 数据接口。
- 在缺少 `MOKE_AUTHORIZATION` 时自动切换到 mock 数据，便于本地开发。
- 首页 Hero 区展示 Apple Fitness Rings 风格的三层运动圆环。
- 展示今日训练的配速、桨频、桨次、时长、距离、热量。
- 展示累计总运动数据。
- 展示 GitHub Contribution Wall 风格的训练热力图。
- 支持热力图“近一年”和按年份切换查看。
- 支持趋势卡片按“本周 / 本月 / 本年”切换。
- 展示训练历史列表，支持分页。
- 点击历史记录后，在详情面板中展示平均配速、平均速度、平均桨频、总桨次，以及速度/桨频折线图。
- 当接口返回疑似 401 授权错误时显示 Token 异常提示。
- 通过 `.cache/moke/<accountId>/` 维护运行时缓存文件，包括 month files、summary、heatmap 和 index。

---

## 2. 技术栈（Tech Stack）

### 2.1 Next.js 16（App Router）
- 用途：
  - 负责页面路由。
  - 负责服务端渲染。
  - 负责服务器组件与 API Route。
- 当前约定：
  - 只使用 App Router。
  - 项目中不存在 `pages/` 目录。
  - 首页由 `app/page.tsx` 实现。
  - API 代理由 `app/api/moke/[...path]/route.ts` 实现。

### 2.2 Tailwind CSS
- 用途：
  - 作为当前项目唯一实际启用的样式系统。
  - 负责布局、间距、圆角、颜色、阴影、响应式样式。
- 当前约定：
  - 优先使用 Tailwind utility class。
  - 全局主题变量定义在 `app/globals.css`。
  - 少量全局 CSS 仅用于圆环视觉和全局主题，不用于替代组件级 utility class。
- 当前事实：
  - 项目使用 Tailwind CSS 4 方案，`@import 'tailwindcss'` 写在全局 CSS 中。
  - `postcss.config.mjs` 里使用 `@tailwindcss/postcss`。

### 2.3 Framer Motion
- 用途：
  - 为需要动画的局部组件提供过渡效果。
- 当前使用位置：
  - `src/components/fitness-rings.tsx`
  - `src/components/calendar-first-section.tsx`
  - `src/components/dashboard-section.tsx`
- 当前事实：
  - 第二阶段优化后，`poster-hero.tsx` 与 `lifetime-stats.tsx` 已退回服务端展示组件，不再整体依赖 `framer-motion`。

### 2.4 Recharts
- 用途：
  - 在训练详情面板中渲染双 Y 轴折线图。
  - 一条线表示 `speed`，另一条线表示 `rpm`。
- 当前使用位置：
  - `src/components/dashboard-section.tsx`

### 2.5 Vercel
- 用途：
  - 作为部署平台。
  - 承担托管和环境变量配置。
- 当前事实：
  - 需要配置 `MOKE_ACCOUNT_ID`、`MOKE_AUTHORIZATION`、`MOKE_BASE_URL`。
  - `.cache/moke` 在 Vercel 上属于运行时文件缓存，不能视为长期持久化存储。

### 2.6 TypeScript
- 用途：
  - 整个项目使用 TypeScript。
- 当前约定：
  - `strict: true`
  - `noEmit: true`
  - 类型定义集中在数据层文件中，而不是单独的 `types/` 目录。

### 2.7 Vitest
- 用途：
  - 测试格式化函数、代理逻辑、mock 数据和 view-model 构建逻辑。
- 当前约定：
  - 测试环境为 `node`。
  - 当前没有浏览器 UI 自动化测试。

---

## 3. 项目架构（Architecture）

### 3.1 目录结构（当前真实结构）

#### `app/`
- 用途：
  - Next.js App Router 入口。
- 当前包含：
  - `app/layout.tsx`
  - `app/page.tsx`
  - `app/globals.css`
  - `app/api/moke/[...path]/route.ts`

#### `src/components/`
- 用途：
  - 所有通用页面组件和交互组件。
- 当前包含：
  - `src/components/poster-hero.tsx`
  - `src/components/fitness-rings.tsx`
  - `src/components/lifetime-stats.tsx`
  - `src/components/calendar-first-section.tsx`
  - `src/components/dashboard-section.tsx`

#### `src/lib/moke/`
- 用途：
  - Mok Fitness 接口、代理、缓存和类型逻辑。
- 当前包含：
  - `src/lib/moke/client.ts`
  - `src/lib/moke/service.ts`
  - `src/lib/moke/types.ts`
  - `src/lib/moke/proxy.ts`
  - `src/lib/moke/mock-data.ts`
  - `src/lib/moke/formatters.ts`
  - `src/lib/moke/request-policy.ts`
  - `src/lib/moke/cache-types.ts`
  - `src/lib/moke/cache-store.ts`
  - `src/lib/moke/cache-service.ts`

#### `src/lib/oarboard/`
- 用途：
  - OarBoard 项目自身的 UI 数据映射层。
  - 把原始 workout 数据转成页面展示所需的数据结构。
- 当前包含：
  - `src/lib/oarboard/poster-data.ts`
  - `src/lib/oarboard/dashboard-data.ts`
  - `src/lib/oarboard/calendar-data.ts`
  - `src/lib/oarboard/rings.ts`

#### `.cache/moke/`
- 用途：
  - 运行时缓存目录。
  - 存储按账号划分的月度快照、汇总索引、热力图摘要。
- 当前特点：
  - 已加入 `.gitignore`。
  - 本地运行时可复用。
  - 在 Vercel 上不应被当作长期持久化存储。

### 3.2 核心组件说明

#### `PosterHero`
- 文件：
  - `src/components/poster-hero.tsx`
- 职责：
  - 渲染首页顶部 Hero 大卡片。
  - 根据 `hasWorkout` 渲染“有训练数据”或“空状态”。
  - 展示今日核心指标和圆环图例。
- 当前实现说明：
  - 第二阶段后已变为服务端展示组件，不再整体带客户端动画。

#### `FitnessRings`
- 文件：
  - `src/components/fitness-rings.tsx`
- 职责：
  - 渲染三层同心 SVG 健身圆环。
  - 根据 progress 计算 strokeDashoffset。
  - 动画展示圆环完成度。
- 当前实现说明：
  - 仍保留为客户端组件，因为动画直接依赖 `framer-motion`。

#### `LifetimeStats`
- 文件：
  - `src/components/lifetime-stats.tsx`
- 职责：
  - 展示累计总运动数据。
- 当前实现说明：
  - 第二阶段后已退回服务端展示组件，不再整体依赖客户端动画。

#### `CalendarFirstSection`
- 文件：
  - `src/components/calendar-first-section.tsx`
- 职责：
  - 渲染热力图区域。
  - 渲染周/月/年趋势卡片切换。
  - 管理热力图年份模式切换和 tooltip 状态。
- 当前实现说明：
  - 仍为客户端组件，因为包含 tab 切换、年份切换和 tooltip 定位交互。

#### `DashboardSection`
- 文件：
  - `src/components/dashboard-section.tsx`
- 职责：
  - 渲染训练历史列表。
  - 管理当前选中记录和分页。
  - 渲染详情指标和折线图。
- 当前实现说明：
  - 仍为客户端组件，因为包含分页、选择态和 Recharts 图表交互。

### 3.3 数据流（非常重要）

#### 3.3.1 数据来源
- 页面数据由 `app/page.tsx` 统一编排。
- 当前优先数据来源是缓存层：
  - `src/lib/moke/cache-service.ts`
  - `src/lib/moke/cache-store.ts`
- 首次缓存缺失时，会回源拉取最近 12 个月数据，并写入 `.cache/moke/<accountId>/`。
- `todayTotals` 仍然会实时从上游读取，以保留当天数据的即时性。
- 如果没有 `MOKE_AUTHORIZATION`，API Route 继续使用 `src/lib/moke/mock-data.ts` 返回模拟响应。

#### 3.3.2 缓存结构
- 按账号目录隔离。
- 每个账号下包含：
  - `months/YYYY-MM.json`
  - `summary.json`
  - `heatmap.json`
  - `index.json`
- 主存储策略：
  - 按月存储运动记录。
- 辅助读取层：
  - `summary.json` 提供累计与近期摘要。
  - `heatmap.json` 提供热力图日级摘要。
  - `index.json` 提供月份索引与最近训练日期。

#### 3.3.3 服务端请求流程（第二阶段后）
- 首页不再在首屏链路中执行大规模历史分页扫描。
- 首页主要做两类读取：
  - 读取缓存摘要（summary / heatmap）
  - 拉取当天 totals 作为实时补充
- 当缓存缺失时：
  - 仅回源拉取最近 12 个月月度列表
  - 落盘后再读缓存文件

#### 3.3.4 代理请求策略
- 代理层现已按接口类型区分缓存策略与超时。
- 当前已支持：
  - 超时控制
  - 401/403 与 timeout / upstream 故障的错误分级
  - 不同接口的 `revalidate` 设置

#### 3.3.5 数据转换流程
- 缓存月文件中会把：
  - `turns` 规范化为 number
  - `paceList`、`rpmList` 规范化为 number[]
- 首页渲染前会把缓存摘要恢复成 UI 构建所需结构。
- Hero 数据通过 `buildPosterHeroData(...)` 构建。
- Dashboard 列表通过 `buildDashboardData(...)` 构建。
- 单条详情通过 `buildWorkoutDetailPanel(...)` 构建。
- 热力图数据通过 `buildCalendarHeatmap(...)` 构建。
- 趋势卡片通过 `buildTrendCards(...)` 构建。

---

## 4. 页面说明（Page Description）

### 4.1 首页 `/`
- 仍为单页仪表盘。
- 当前页面在首屏会额外显示一行轻量数据来源提示：
  - `本地缓存`
  - 或 `上游同步`
- 目的是帮助开发阶段判断当前首页是否命中缓存层。

### 4.2 Hero / Lifetime / Heatmap / Dashboard
- 页面分区结构保持不变。
- 视觉布局没有做大规模重构。
- 第二阶段重点是数据链路与客户端边界优化，而不是 UI 重设计。

---

## 5. 热力图功能（Heatmap Feature）
- 热力图展示逻辑和单元格规范保持不变。
- 第二阶段变化在于数据来源：
  - 由 `heatmap.json` 提供日级摘要后，再转换为 `HeatmapCellView[]`
- 这避免了每次首页都从全量历史明细重新计算热力图。

---

## 6. UI/UX 设计规范（Design Principles）
- 现有视觉规范保持不变。
- 第二阶段优化没有修改主题色、圆角尺度、热力图单元格规则或核心版式。

---

## 7. 已知问题与限制（Known Issues）

### 7.1 运行时缓存限制
- `.cache/moke` 是运行时文件缓存，不是可靠的长期持久化存储。
- 在本地开发环境通常可复用。
- 在 Vercel 上不能保证实例重启、冷启动或重新部署后仍然存在。
- 如果未来需要真正持久化，应迁移到：
  - 项目内静态数据目录
  - 或外部持久化存储

### 7.2 当前仍存在的 UI/交互限制
- 热力图仍然需要横向滚动。
- `CalendarFirstSection` 和 `DashboardSection` 仍是客户端组件。
- `FitnessRings` 仍依赖客户端动画。

### 7.3 构建验证限制
- 在当前受限环境中，`npm run build` 会在编译通过后被 `spawn EPERM` 中断。
- 已确认 `npm run typecheck` 通过。
- 当前没有证据表明第二阶段改动引入了新的 TypeScript 级问题。

### 7.4 数据缓存限制
- 当前缓存构建默认只回源最近 12 个月。
- 这有利于首页性能，但意味着缓存层目前不是完整历史镜像。
- 如需完整多年历史，需要扩展同步策略。

---

## 8. 编码规范（Coding Conventions）
- 现有命名、组件拆分和 Tailwind 使用规范继续有效。
- 新增约定：
  - 运行时缓存相关逻辑统一放在 `src/lib/moke/cache-*.ts`
  - 接口级缓存/超时策略统一放在 `src/lib/moke/request-policy.ts`
  - 代理错误分类统一通过 `src/lib/moke/proxy.ts` 管理

---

## 9. 后续优化方向（Future Improvements）
- 将 `.cache/moke` 从运行时缓存升级为真正持久化方案。
- 将当前“最近 12 个月缓存”扩展为可控的全量历史同步策略。
- 为缓存层增加显式刷新入口或后台同步任务。
- 继续压缩客户端边界，评估 `CalendarFirstSection` 与 `DashboardSection` 的进一步拆分。
- 为数据同步链路增加测试覆盖。

---

## 10. AI Agent 使用指南（CRITICAL）

### 10.1 如何快速理解项目
- 推荐阅读顺序：
  1. `README.md`
  2. `app/page.tsx`
  3. `src/lib/moke/cache-service.ts`
  4. `src/lib/moke/cache-store.ts`
  5. `src/lib/moke/request-policy.ts`
  6. `src/components/calendar-first-section.tsx`
  7. `src/components/dashboard-section.tsx`
  8. `src/lib/oarboard/calendar-data.ts`
  9. `src/lib/oarboard/dashboard-data.ts`
  10. `app/api/moke/[...path]/route.ts`

### 10.2 如何安全修改
- 如果修改缓存层，必须同时检查：
  - `cache-types.ts`
  - `cache-store.ts`
  - `cache-service.ts`
  - `app/page.tsx`
- 如果修改代理层，必须同时检查：
  - `request-policy.ts`
  - `proxy.ts`
  - `client.ts`
  - `route.ts`
- 修改后必须跑：
  - `npm run typecheck`
  - `npm run build`
- 如果 `build` 在当前受限环境里仍然因为 `spawn EPERM` 中断，要明确说明这是环境限制，不要误报为代码通过。

### 10.3 禁止行为（非常重要）
- 不要把 `.cache/moke` 误当作 Vercel 上的长期持久化存储。
- 不要破坏热力图单元格的正方形、圆角和 tooltip 规则。
- 不要移除 mock fallback。
- 不要在未同步数据层的情况下直接改首页读取逻辑。

### 10.4 当前项目的关键运行假设
- 这是一个单页、只读的数据看板。
- 当前首页优先依赖缓存摘要，再用少量实时接口补充。
- `.cache/moke` 是运行时缓存，不保证跨实例持久化。
- 如果文档与源码冲突，优先相信源码，再更新文档。
