# OarBoard Project Context Document

## 1. 项目概述（Project Overview）

### 1.1 项目名称
- OarBoard

### 1.2 项目目的
- OarBoard 是一个个人划船机训练数据看板，用于可视化展示来自 Mok Fitness（摩刻健身）接口的运动数据。
- 项目目标是以比原生 App 更清晰、更美观的方式呈现划船训练结果，重点突出划船场景下最重要的指标，例如 500m 配速、桨频、训练频率和总里程。
- 当前产品形态是一个单页仪表盘，不涉及用户编辑数据，核心是“读取、聚合、展示”。

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

### 2.3 Shadcn UI
- 要求中的定位：
  - 作为基于 Radix 的可定制组件库。
- 当前仓库事实：
  - 当前代码库并未实际接入 Shadcn UI。
  - `package.json` 中没有 shadcn 相关依赖。
  - 仓库中不存在 `components/ui/` 目录。
- 结论：
  - 文档中应视为“目标技术栈要求”，不是“当前已落地实现”。

### 2.4 Lucide React
- 要求中的定位：
  - 用于图标系统。
- 当前仓库事实：
  - 当前源码未使用 `lucide-react`。
  - 没有看到相关 import。
- 结论：
  - 也是“规划要求”，不是“当前实现”。

### 2.5 Framer Motion
- 用途：
  - 为 Hero、卡片、分区和图表切换提供动画。
- 当前使用位置：
  - `src/components/poster-hero.tsx`
  - `src/components/fitness-rings.tsx`
  - `src/components/lifetime-stats.tsx`
  - `src/components/calendar-first-section.tsx`
  - `src/components/dashboard-section.tsx`
- 当前约定：
  - 过渡曲线大量复用 `[0.16, 1, 0.3, 1]`。
  - 主要动画形式是 opacity + y 位移 + 轻微 scale。

### 2.6 Recharts
- 用途：
  - 在训练详情面板中渲染双 Y 轴折线图。
  - 一条线表示 `speed`，另一条线表示 `rpm`。
- 当前使用位置：
  - `src/components/dashboard-section.tsx`
- 当前约定：
  - `speed` 线颜色是 cyan。
  - `rpm` 线颜色是 lime。
  - Tooltip 使用深色半透明背景。

### 2.7 Vercel
- 用途：
  - 作为预期部署平台。
  - 承担托管和环境变量配置。
- 当前仓库事实：
  - README 已说明在 Vercel 中配置 `MOKE_AUTHORIZATION` 和 `NEXT_PUBLIC_BASE_URL`。
  - 没有额外的 Vercel 专属业务代码。

### 2.8 TypeScript
- 用途：
  - 整个项目使用 TypeScript。
- 当前约定：
  - `strict: true`
  - `noEmit: true`
  - 类型定义集中在数据层文件中，而不是单独的 `types/` 目录。

### 2.9 Vitest
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
  - Mok Fitness 接口相关逻辑。
  - 包括 client、proxy、mock、formatters、types、service。
- 当前包含：
  - `src/lib/moke/client.ts`
  - `src/lib/moke/service.ts`
  - `src/lib/moke/types.ts`
  - `src/lib/moke/proxy.ts`
  - `src/lib/moke/mock-data.ts`
  - `src/lib/moke/formatters.ts`

#### `src/lib/oarboard/`
- 用途：
  - OarBoard 项目自身的 UI 数据映射层。
  - 把原始 workout 数据转成页面展示所需的数据结构。
- 当前包含：
  - `src/lib/oarboard/poster-data.ts`
  - `src/lib/oarboard/dashboard-data.ts`
  - `src/lib/oarboard/calendar-data.ts`
  - `src/lib/oarboard/rings.ts`

#### `src/lib/**/__tests__/`
- 用途：
  - 单元测试。
- 当前覆盖：
  - `formatters`
  - `mock-data`
  - `proxy`
  - `service`
  - `calendar-data`
  - `dashboard-data`
  - `poster-data`
  - `rings`

### 3.2 要求中提到但当前不存在的目录
- `components/`：不存在，实际位置为 `src/components/`
- `components/ui/`：不存在
- `lib/`：不存在，实际位置为 `src/lib/`
- `hooks/`：不存在
- `types/`：不存在，类型定义目前分散在 `src/lib/moke/types.ts` 等文件中

### 3.3 核心组件说明

#### `PosterHero`
- 文件：
  - `src/components/poster-hero.tsx`
- 职责：
  - 渲染首页顶部 Hero 大卡片。
  - 根据 `hasWorkout` 渲染“有训练数据”或“空状态”。
  - 展示今日核心指标和圆环图例。
- 输入（props）：
  - `averagePace: string`
  - `averageRpm: string`
  - `totalTurns: string`
  - `duration: string`
  - `distance: string`
  - `calories: string`
  - `hasWorkout: boolean`
  - `ringData: { calorie; duration; distance }`
  - `children: React.ReactNode`
- 输出：
  - 一块玻璃风格 Hero 区域。
  - 有数据时输出多个指标块。
  - 无数据时输出“暂无运动记录”空状态。

#### `FitnessRings`
- 文件：
  - `src/components/fitness-rings.tsx`
- 职责：
  - 渲染三层同心 SVG 健身圆环。
  - 根据 progress 计算 strokeDashoffset。
  - 动画展示圆环完成度。
- 输入（props）：
  - `calorie: { value: number; goal: number }`
  - `duration: { value: number; goal: number }`
  - `distance: { value: number; goal: number }`
  - `dateLabel: string`
- 输出：
  - SVG 圆环和中心文字。
  - 中心显示缩写日期与平均完成度百分比。

#### `LifetimeStats`
- 文件：
  - `src/components/lifetime-stats.tsx`
- 职责：
  - 展示累计总运动数据。
- 输入（props）：
  - `totalDuration: string`
  - `totalCalories: string`
  - `totalDistance: string`
  - `sportCount: number`
- 输出：
  - 4 个统计卡片的网格。

#### `CalendarFirstSection`
- 文件：
  - `src/components/calendar-first-section.tsx`
- 职责：
  - 渲染热力图区域。
  - 渲染周/月/年趋势卡片切换。
  - 管理热力图年份模式切换和 tooltip 状态。
- 输入（props）：
  - `heatmap: HeatmapCellView[]`
  - `weekCards: TrendCardView[]`
  - `monthCards: TrendCardView[]`
  - `yearCards: TrendCardView[]`
- 输出：
  - 热力图网格。
  - 筛选 tabs。
  - 趋势卡片列表。
  - Tooltip。

#### `DashboardSection`
- 文件：
  - `src/components/dashboard-section.tsx`
- 职责：
  - 渲染训练历史列表。
  - 管理当前选中记录和分页。
  - 渲染详情指标和折线图。
- 输入（props）：
  - `historyRows: WorkoutHistoryRowView[]`
  - `detailsById: Record<string, DetailPanelView>`
  - `defaultSelectedId: string | null`
- 输出：
  - 左侧历史卡片列表。
  - 右侧详情卡片和 Recharts 图表。

### 3.4 状态管理
- 当前状态管理方式：
  - 不使用 Redux、Zustand、MobX、Jotai 等全局状态库。
  - 不使用 React Context。
  - 仅使用 React 本地状态和 hooks。
- 实际使用：
  - `useState`
    - 热力图筛选模式
    - 热力图年份模式
    - hovered cell
    - 当前选中 workout id
    - 当前历史列表页码
  - `useLayoutEffect`
    - tooltip 定位计算
  - `useRef`
    - tooltip DOM 尺寸测量
- 数据来源：
  - 页面数据来自远程 API。
  - 缺少授权时来自本地 mock。
- 数据位置：
  - 数据在服务端拉取和转换后作为 props 下发。
  - 客户端组件不主动发起远程请求。

### 3.5 数据流（非常重要）

#### 3.5.1 数据来源
- 页面数据由 `app/page.tsx` 统一拉取。
- 它调用以下 service：
  - `fetchWorkoutList`
  - `fetchWorkoutHistory`
  - `fetchWorkoutTotals`
- 底层通过 `src/lib/moke/client.ts` 构造请求。
- 如果没有 `MOKE_AUTHORIZATION`，API Route 使用 `src/lib/moke/mock-data.ts` 返回模拟响应。

#### 3.5.2 服务端请求流程
- 首页会计算多个查询条件：
  - 今天日期
  - 当前月份
  - 当前周范围
  - 生命周期范围
  - 最近 12 个月月份列表
- 首页通过 `Promise.allSettled(...)` 发起多组请求：
  - 今日训练列表
  - 今日 totals
  - 最近 12 个月训练列表
  - 每日历史分页
  - 本周 totals
  - 本月 totals
  - 本年 totals
  - 生命周期 totals

#### 3.5.3 数据转换流程
- 原始 workout list 通过 `flattenWorkoutGroups(...)` 展平。
- 最近 12 个月历史记录被合并、按 `_id` 去重、按 `startTime` 倒序。
- Hero 数据通过 `buildPosterHeroData(...)` 构建。
- Dashboard 列表通过 `buildDashboardData(...)` 构建。
- 单条详情通过 `buildWorkoutDetailPanel(...)` 构建。
- 热力图数据通过 `buildCalendarHeatmap(...)` 构建。
- 趋势卡片通过 `buildTrendCards(...)` 构建。

#### 3.5.4 数据传递方式
- 所有页面主数据都由服务端页面组件生成，再传给客户端组件。
- 客户端组件只负责：
  - 交互状态
  - 显示切换
  - tooltip
  - 分页
  - 当前选中项切换

#### 3.5.5 数据更新方式
- 当前页面是只读的。
- 没有用户写操作。
- 没有轮询。
- 没有 optimistic update。
- 没有 SWR/react-query。
- 数据更新依赖于页面重新请求。

---

## 4. 页面说明（Page Description）

### 4.1 首页 `/`

#### 页面路径
- `/`

#### 页面结构
- `main`
- `header`
- Hero section
- Token warning banner（条件渲染）
- Lifetime stats section
- Calendar + Trend section
- Dashboard history + detail section
- `footer`

### 4.2 Header 模块

#### 模块名称
- Brand Header

#### 页面位置
- 页面最顶部

#### UI 结构
- 使用 flex 布局。
- 移动端为纵向堆叠。
- 大屏为横向左右分布。
- 左侧包含：
  - 圆形品牌徽标 `OB`
  - 文本 `OarBoard`
- 右侧包含：
  - 文本 `个人划船数据面板`

#### 展示的数据
- 全部为静态文本。

#### 用户交互
- 无。

#### 空状态 / 加载状态
- 无。

#### 响应式行为
- 桌面端：
  - 左右分布
- 移动端：
  - 上下排列

### 4.3 Hero 模块

#### 模块名称
- Daily Hero Poster

#### 页面位置
- Header 下方

#### UI 结构
- 大型圆角玻璃卡片。
- 内部在桌面端为两列：
  - 左侧圆环
  - 右侧指标卡
- 移动端堆叠：
  - 上方圆环
  - 下方指标

#### 展示的数据
- 今日配速：`averagePace`
- 今日桨频：`averageRpm`
- 今日桨次：`totalTurns`
- 今日时长：`duration`
- 今日距离：`distance`
- 今日热量：`calories`
- 三个圆环目标进度：
  - calorie
  - duration
  - distance

#### 用户交互
- 无点击交互。
- 有进入动画。
- 圆环 stroke 具有动画展开效果。

#### 空状态
- 当 `hasWorkout = false` 时：
  - 显示 `暂无运动记录`
  - 显示提示语：完成一次划船运动后，数据将在此展示

#### 加载状态
- 没有显式 loading skeleton。

#### 响应式行为
- 桌面端：
  - 左右布局
- 移动端：
  - 上下布局
- 风险：
  - 三列指标在窄屏仍然保留，视觉略密。

### 4.4 Token Warning 模块

#### 模块名称
- Token Warning Banner

#### 页面位置
- Hero 下方，条件显示

#### UI 结构
- 单个 amber 风格提示框
- 圆角 + 半透明背景 + 边框

#### 展示的数据
- `authError`

#### 用户交互
- 无。

#### 空状态
- `authError` 为空时整个模块不渲染。

#### 加载状态
- 无。

#### 响应式行为
- 宽度随容器自适应。

### 4.5 Lifetime Stats 模块

#### 模块名称
- Lifetime Stats

#### 页面位置
- Hero 或 Token Warning 下方

#### UI 结构
- 顶部标题 + 横线
- 下方 stats grid
- 移动端 2 列
- 中等屏幕及以上 4 列

#### 展示的数据
- `totalDuration`
- `totalCalories`
- `totalDistance`
- `sportCount`

#### 用户交互
- 无。

#### 空状态
- totals 为空时仍会显示 0 值格式化结果。

#### 加载状态
- 无。

#### 响应式行为
- 桌面端：4 列
- 移动端：2 列

### 4.6 热力图与趋势卡模块

#### 模块名称
- Calendar First Section

#### 页面位置
- Lifetime Stats 下方

#### UI 结构
- 外层是大玻璃卡片。
- 顶部：
  - 标题
  - 描述文字
  - 本周 / 本月 / 本年切换按钮
- 主体：
  - 左侧热力图卡片
  - 右侧趋势卡片列表
- 在 `xl` 屏幕时左右并排。
- 在移动端上下堆叠。

#### 展示的数据
- 热力图 cell 级别数据：
  - `date`
  - `distance`
  - `level`
  - `weekday`
- 趋势卡片字段：
  - `id`
  - `label`
  - `value`

#### 用户交互
- 点击 filter buttons：
  - `本周`
  - `本月`
  - `本年`
- 点击左/右箭头切换热力图年份模式。
- hover 非零 cell 显示 tooltip。
- focus 非零 cell 时也显示 tooltip。

#### 空状态
- 没有专门空态插画。
- 零距离或不存在的日期会渲染成空/弱可见单元格。

#### 加载状态
- 无显式 loading。

#### 响应式行为
- 桌面端：
  - 热力图和趋势卡并排
- 移动端：
  - 热力图横向可滚动
  - 趋势卡堆叠在下方
- 风险：
  - 小屏必须滚动查看热力图完整宽度

### 4.7 训练历史与详情模块

#### 模块名称
- Dashboard Section

#### 页面位置
- 热力图模块下方

#### UI 结构
- 外层 grid
- `xl` 屏幕：
  - 左列训练历史
  - 右列训练详情
- 移动端上下堆叠

#### 展示的数据

##### 左侧历史列表字段
- `id`
- `title`
- `subtitle`
- `pace`
- `duration`
- `distance`
- `energy`

##### 右侧详情字段
- `title`
- `subtitle`
- `averagePace`
- `averageSpeed`
- `averageRpm`
- `totalTurns`
- `chartPoints[]`

##### 图表字段
- `minute`
- `speed`
- `rpm`
- `pace`

#### 用户交互
- 点击某条历史记录切换详情。
- 点击 `上一页` / `下一页` 切换列表分页。
- 图表 hover 时显示 Recharts Tooltip。

#### 空状态
- 如果没有任何详情数据：
  - 页面会注入 `fallback` 详情项
  - 显示 `No workout data`
  - 图表为空数组

#### 加载状态
- 无。

#### 响应式行为
- 桌面端双列。
- 移动端单列堆叠。
- 图表高度固定，窄屏时周围内容会显得较紧凑。

### 4.8 Footer 模块

#### 模块名称
- Footer

#### 页面位置
- 页面底部

#### UI 结构
- flex 布局
- 桌面端左右排列
- 移动端上下排列

#### 展示的数据
- 静态 slogan
- 当前年份版权文本

#### 用户交互
- 无。

#### 空状态 / 加载状态
- 无。

---

## 5. 热力图功能（Heatmap Feature）

### 5.1 数据结构

#### 原始数据来源
- 类型：
  - `MokeWorkoutHistoryEntry[]`
- 定义文件：
  - `src/lib/moke/types.ts`
- 字段：
  - `_id: string`
    - 例如 `2026-03-31`
    - 表示某一天
  - `totalDistance: number`
    - 当前项目假定单位为 km

#### 热力图视图模型
- 类型：
  - `HeatmapCellView`
- 定义文件：
  - `src/lib/oarboard/calendar-data.ts`
- 字段：
  - `date: string`
    - 日期字符串，格式 `YYYY-MM-DD`
  - `distance: number`
    - 该日训练距离，单位 km
  - `level: 0 | 1 | 2 | 3 | 4 | 5`
    - 强度档位
  - `weekday: number`
    - 由 JavaScript `Date.getDay()` 计算
    - `0 = 周日`, `6 = 周六`

### 5.2 渲染逻辑
- 首页先通过 `buildCalendarHeatmap(entries)` 将每日历史转换成 `HeatmapCellView[]`。
- 组件 `CalendarFirstSection` 根据当前模式继续转换：
  - 如果是 rolling：
    - 调用 `buildRollingYearHeatmap(heatmap)`
  - 如果是具体年份：
    - 调用 `buildFullYearHeatmap(year, heatmap)`
- 返回的数据结构是 `HeatmapWeekColumnView[]`：
  - `key`
  - `monthLabel`
  - `days`
- UI 按“周”为列进行渲染。
- 每列内部按 weekday 0 到 6 渲染 7 个位置。
- 某个 weekday 没有数据时，仍然渲染空位，保证网格完整。

### 5.3 按列/按行组织方式
- 列：
  - 一列代表一周。
- 行：
  - 一行代表星期几。
- 当前周起始规则：
  - 周日为一周起点。
- 月份标签规则：
  - 当某一列包含“该月前 7 天中的某一天”时，显示该列 `MM` 作为月标签。

### 5.4 布局结构
- 采用 CSS Grid，不使用 flex 实现热力图主体。
- 外层滚动容器：
  - 小屏允许横向滚动。
- 主网格：
  - `gridTemplateColumns` 动态设置为列数。
- 每个周列：
  - 自身也是 grid。
- 当前布局理由：
  - Grid 更容易保证所有单元格是规则正方形。
  - 如果改用 flex，热力图更容易发生尺寸挤压和不规则对齐。

### 5.5 单元格样式规则（必须严格）

#### 宽高
- 单元格必须是正方形。
- 当前实现通过 `aspect-square` 保证宽高相等。
- wrapper class：
  - `group relative aspect-square w-full max-w-4`

#### 尺寸
- 实际最大宽度由 `max-w-4` 控制。
- 对应 Tailwind 默认宽度约为 `1rem`。
- 高度由 `aspect-square` 自动等于宽度。

#### 间距（gap）
- 外层 grid gap：
  - 默认 `3px`
  - `md` 时 `2px`
  - `xl` 时回到 `3px`
- 每个周列内部 gap：
  - 固定 `2px`

#### 圆角
- 热力图单元格统一使用：
  - `rounded-[0.2rem]`
- 禁止混用：
  - `rounded-full`
  - `rounded`
  - `rounded-md`
  - 其他任何会破坏统一感的圆角

#### 边框
- 有数据 cell：
  - `border-white/5`
- 空 cell：
  - `border-white/[0.03] bg-transparent`

#### 颜色映射规则
- 定义在 `src/components/calendar-first-section.tsx`
- 映射如下：
  - `0` -> `bg-[#0f1f16]`
  - `1` -> `bg-[#143d24]`
  - `2` -> `bg-[#1e5a35]`
  - `3` -> `bg-[#2f7d47]`
  - `4` -> `bg-[#46a85c]`
  - `5` -> `bg-[#56d468]`

### 5.6 强度映射规则
- 定义在 `src/lib/oarboard/calendar-data.ts`
- 精确规则：
  - `distance <= 0` -> `0`
  - `distance < 0.8` -> `1`
  - `distance < 1.5` -> `2`
  - `distance < 2.5` -> `3`
  - `distance < 3.5` -> `4`
  - `distance >= 3.5` -> `5`

### 5.7 Tooltip 行为

#### 显示内容
- 第一行：
  - `date`
- 第二行：
  - `${distance.toFixed(2)} km`

#### 触发方式
- hover
- keyboard focus
- 仅在 `distance > 0` 的单元格上启用
- 零值或空位不响应 tooltip

#### 定位逻辑
- 初始优先显示在目标单元格上方并水平居中。
- 如果顶部越界：
  - 放到下方
- 如果左右越界：
  - 进行 viewport clamp
- 如果底部也越界：
  - 尝试右侧
  - 再尝试左侧
  - 最后贴紧 viewport 底部安全区域

#### 防遮挡策略
- 使用 `createPortal(..., document.body)`
- tooltip 使用 `fixed`
- z-index：
  - `z-[1000]`
- `pointer-events-none`
- 这些设计用于避免被父容器 `overflow` 裁剪

### 5.8 热力图年份模式
- `heatmapMode` 类型：
  - `'rolling'`
  - `number`
- `'rolling'` 表示过去 12 个月
- 数字年份表示完整年份视图

#### 上一页按钮逻辑
- 如果当前是 rolling：
  - 切换到 `currentYear - 1`
- 如果当前是某个数字年份：
  - `heatmapMode - 1`

#### 下一页按钮逻辑
- 仅数字年份模式可点击
- 如果下一年达到当前年：
  - 返回 `'rolling'`
- 否则：
  - 切到下一个数字年份

### 5.9 已知问题与限制

#### 移动端问题
- 热力图必须横向滚动。
- 原因是需要保持 cell 正方形和固定视觉节奏。
- 如果强行缩窄以适配窄屏，会破坏 heatmap 的结构感。

#### tooltip 被裁剪问题
- 当前已经通过 portal + fixed 基本解决。
- 但如果未来外层容器加 transform 或复杂 stacking context，需要重新验证。

#### 样式冲突风险
- 最常见风险：
  - 把 cell 圆角改成 `rounded-full`
  - 改用 flex 导致 cell 被压扁
  - 改掉 `aspect-square`
  - 改掉 `min-w-[680px]` 导致小屏布局塌陷

#### 时间与时区风险
- `weekday` 是用本地 `Date` 解析得到的。
- 如果运行时区变化，星期计算可能偏移。

#### 周起始规则限制
- 当前是周日开头。
- 不可单改 UI，不同步修改数据构造逻辑。

---

## 6. UI/UX 设计规范（Design Principles）

### 6.1 设计风格
- 整体风格：
  - 深色
  - 现代
  - 轻毛玻璃
  - Apple Fitness 风格启发
- 视觉关键词：
  - 高对比
  - 玻璃感
  - 运动感
  - 柔和发光
  - 大圆角

### 6.2 配色方案
- 全局定义在 `app/globals.css`
- 主背景：
  - `#04131f`
- 辅助背景：
  - `#0b2232`
- 文字主色：
  - `#f4fbff`
- 弱化文字：
  - `rgba(226, 241, 248, 0.72)`
- 强调色：
  - rose：`#ff5a7a`
  - lime：`#8dfc61`
  - cyan：`#4ed8ff`
- 当前模式：
  - 仅深色优先
  - 没有单独的浅色模式

### 6.3 背景规范
- 全局背景由多层 gradient 组成：
  - 顶部 cyan radial glow
  - 左下 rose radial glow
  - 深色 linear gradient 底层
- 页面中还额外渲染了两个大 blur 光斑。

### 6.4 间距规范
- 页面主 padding：
  - `px-6 py-6`
  - `lg:px-10 lg:py-8`
- 常见 section 间距：
  - `mt-8`
  - `mt-10`
  - `lg:mt-14`
- 卡片内边距：
  - 常用 `p-4`
  - `p-5`
  - `p-6`
  - `lg:p-8`
- grid gap：
  - 常用 `gap-3`
  - `gap-4`
  - `gap-6`

### 6.5 圆角规范
- 大卡片：
  - `rounded-[2rem]`
  - `rounded-[2.2rem]`
- 中卡片：
  - `rounded-[1.3rem]`
  - `rounded-[1.4rem]`
  - `rounded-[1.6rem]`
- 小卡片：
  - `rounded-[1rem]`
  - `rounded-[1.1rem]`
- 热力图单元格：
  - 必须 `rounded-[0.2rem]`

### 6.6 阴影规范
- 普通卡片：
  - 轻微半透明阴影
- Hero：
  - 阴影更强
  - 用于作为页面视觉锚点
- 选中态历史卡片：
  - 带 cyan 色调阴影
- 禁止：
  - 使用过重、过实的黑色阴影破坏玻璃风格

### 6.7 动效规范
- 推荐动画曲线：
  - `[0.16, 1, 0.3, 1]`
- 推荐形式：
  - fade in
  - slight upward reveal
  - ring stroke animation
  - detail chart fade switch
- hover 交互：
  - 历史卡 hover 提升边框亮度和背景亮度
  - filter button hover 提升文字对比度

---

## 7. 已知问题与限制（Known Issues）

### 7.1 已存在 bug / 风险
- `src/lib/oarboard/dashboard-data.ts` 中的 `summaryCards` 已构建，但当前 UI 没有实际使用。
- `src/lib/oarboard/calendar-data.ts` 中的 `groupHeatmapIntoWeeks(...)` 有测试，但当前热力图组件并不依赖它。
- `authError` 只显示第一个失败请求的错误信息，多个失败时不会全部汇报。
- `fetchDailyHistoryPages(...)` 是顺序分页请求，历史过长时会拖慢首页渲染。

### 7.2 移动端适配问题
- 热力图必须横向滚动。
- Hero 中多个三列指标块在小屏略拥挤。
- 图表区域固定高度，在更小设备上会显得上下空间紧张。

### 7.3 性能问题
- 首页一次会发起很多远程请求：
  - 今日列表
  - 今日 totals
  - 12 个月列表
  - 最多 50 页 history
  - 周/月/年/总计 totals
- 没有缓存策略。
- 没有懒加载。
- 没有数据层聚合缓存。

### 7.4 可扩展性问题
- `ACCOUNT_ID` 写死在 `app/page.tsx`。
- 当前只有一个页面路由。
- 没有多用户支持。
- 没有正式的 design system 抽象层。
- 没有 hooks/types 独立目录。
- Shadcn UI / Lucide React 只是规划要求，未真正落地。

### 7.5 数据假设限制
- 默认使用 `deviceType: 2`。
- 依赖 `type: 1 | 2 | 3` 的查询方式。
- 假定 `paceList`、`rpmList` 是逗号分隔数字字符串。
- 假定 totals 中 distance 单位与当前格式化逻辑一致。
- 这些假设如需修改，必须先确认上游 API 协议。

---

## 8. 编码规范（Coding Conventions）

### 8.1 命名规范
- 文件名：
  - kebab-case
  - 例如 `poster-hero.tsx`
- React 组件名：
  - PascalCase
  - 例如 `PosterHero`
- 类型名：
  - PascalCase
  - 常见后缀包括 `View`、`Response`、`Query`

### 8.2 组件拆分原则
- `app/page.tsx`
  - 负责数据编排和页面级组合
- `src/components/`
  - 负责 JSX 渲染和局部交互
- `src/lib/moke/`
  - 负责外部 API、类型、代理、格式化
- `src/lib/oarboard/`
  - 负责 view-model 转换
- 原则：
  - 不要把 API 细节写进组件
  - 不要把格式化逻辑散落在 JSX 中

### 8.3 Tailwind 使用规范
- 优先使用 utility class。
- 仅在动态布局无法用 utility 表达时使用 inline style。
- 当前允许的 inline style 典型场景：
  - 动态 `gridTemplateColumns`
  - tooltip `top/left`
  - Recharts tooltip style object
- 尽量复用现有透明边框、玻璃背景、圆角尺度，避免风格漂移。

### 8.4 是否允许 inline style
- 允许，但仅限必要场景。
- 不允许大面积把原本可以用 Tailwind 表达的样式改成 inline style。
- 热力图和 tooltip 的几何定位属于允许范围。

### 8.5 复用策略
- 有重复计算：
  - 优先抽到 `src/lib/oarboard/` 或 `src/lib/moke/`
- 有重复 UI：
  - 优先抽到 `src/components/`
- 不要为了“看起来规范”而凭空创建 `components/ui/`，除非真的引入了共享 UI 原子组件体系。

### 8.6 容错与降级策略
- 请求失败时要保留 fallback。
- 缺 token 时要保留 mock 模式。
- 页面应优先显示“可降级的空态”，而不是直接崩溃。

---

## 9. 后续优化方向（Future Improvements）

### 9.1 UI 优化建议
- 优化 Hero 在窄屏上的密度。
- 给热力图补 weekday label。
- 增加图标，但前提是先确认 `lucide-react` 真正接入。
- 如果未来引入 Shadcn UI，可逐步抽离共享卡片/按钮表面样式。

### 9.2 性能优化
- 减少首页请求数量。
- 为 totals/history 引入服务端缓存或 revalidate。
- 重新设计 `fetchDailyHistoryPages(...)` 的请求策略。
- 如果上游允许，使用更聚合的接口减少 12 个月逐月拉取。

### 9.3 功能扩展
- 给历史列表增加筛选功能。
- 加入更多划船指标：
  - 分段最佳配速
  - 稳定性
  - 每分钟热量
- 增加日期范围选择器。
- 支持多账号切换。

### 9.4 可维护性提升
- 清理未使用或半使用的 helper。
- 增加浏览器级 UI 测试。
- 若项目规模继续扩大，可建立单独的 `types/` 和设计 token 结构。
- 将核心配置如 `ACCOUNT_ID` 改为环境变量或用户配置。

---

## 10. AI Agent 使用指南（CRITICAL）

### 10.1 如何快速理解项目
- 推荐阅读顺序：
  1. `README.md`
  2. `app/page.tsx`
  3. `src/components/calendar-first-section.tsx`
  4. `src/components/dashboard-section.tsx`
  5. `src/lib/oarboard/calendar-data.ts`
  6. `src/lib/oarboard/dashboard-data.ts`
  7. `src/lib/moke/service.ts`
  8. `src/lib/moke/types.ts`
  9. `app/api/moke/[...path]/route.ts`
  10. `app/globals.css`

### 10.2 如何安全修改

#### 推荐修改流程
1. 先判断改动属于哪个层：
   - 页面编排层
   - 组件层
   - OarBoard view-model 层
   - Moke API 层
2. 在修改组件前，先读它依赖的 helper。
3. 保持当前“服务端取数 -> 转换 -> props 下发”的主数据流。
4. 如果改热力图，必须同时检查：
   - 数据 builder
   - UI grid
   - tooltip
   - 移动端滚动
5. 修改后必须跑：
   - `npm run test`
   - `npm run typecheck`
6. 如果涉及 UI，必须手动看桌面端和移动端。

#### 需要谨慎修改的核心文件
- `app/page.tsx`
- `src/components/calendar-first-section.tsx`
- `src/lib/oarboard/calendar-data.ts`
- `app/globals.css`
- `app/api/moke/[...path]/route.ts`

### 10.3 禁止行为（非常重要）
- 不要修改 heatmap 单元格尺寸规则，使其失去正方形。
- 不要把 heatmap 单元格改成 `rounded-full`。
- 不要破坏 heatmap 当前的 grid 结构。
- 不要把 tooltip 放回会被 `overflow` 裁剪的容器内部。
- 不要悄悄把热力图从“周日开头”改成“周一开头”。
- 不要移除 mock fallback。
- 不要在未确认依赖接入的情况下假设 Shadcn UI / Lucide React 已可用。
- 不要随意改掉 `Promise.allSettled(...)` 的索引结构而不同步修正后续读取逻辑。

### 10.4 常见坑
- `overflow` 导致 tooltip 被裁剪。
- 用 flex 重写 heatmap 可能导致布局变形。
- Tailwind class 冲突会改变 cell 圆角、宽高、边框和背景强度。
- 去掉 `aspect-square` 会直接破坏热力图。
- 改掉 `min-w-[680px]` 会让小屏 heatmap 崩坏。
- 改日期解析逻辑可能导致 weekday 偏移。
- `Promise.allSettled(...)` 的结果读取是按位置取值的，非常容易误改出错。

### 10.5 测试要求
- 必须运行：
  - `npm run test`
  - `npm run typecheck`
- 必须验证：
  - 桌面端 UI
  - 移动端 UI
  - 热力图横向滚动
  - 热力图 tooltip 是否完整显示
  - 历史选择是否正确切换详情
  - 图表是否正常渲染
- 如果修改热力图，必须额外检查：
  - cell 是否仍然是正方形
  - gap 是否仍一致
  - 圆角是否仍是 `rounded-[0.2rem]`
  - tooltip 是否没有被裁剪
  - 年份切换是否正常

### 10.6 当前项目的关键运行假设
- 这是一个单页、只读的数据看板。
- 代码是真实权威，旧文档只作辅助。
- 规划中的技术栈项不等于当前已实现。
- 缺 token 时使用 mock 数据是故意设计，不是异常。
- 如果文档与源码冲突，优先相信源码，再更新文档。