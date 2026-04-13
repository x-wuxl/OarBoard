# OarBoard Project Context Document

## 1. 项目概述

### 1.1 项目名称
- OarBoard

### 1.2 项目定位
- OarBoard 是一个个人划船训练数据看板，用于展示 Mok Fitness（摩刻健身）接口返回的训练记录。
- 产品形态是单页只读仪表盘，不提供编辑能力，核心目标是“读取、聚合、展示”。
- 当前页面叙事结构为：`今天 -> 宏观 -> 阶段 -> 微观`。
- 项目强调服务端聚合、轻量分析层、动效驱动的数字展示，以及较强的视觉统一性。

### 1.3 目标用户
- 主要用户：拥有 Mok Fitness 划船训练数据的个人用户。
- 次要用户：维护、扩展、修复该项目的开发者或 AI Agent。

### 1.4 当前核心功能
- 通过 Next.js App Router 在服务端读取环境变量并拉取 Mok Fitness 数据。
- 提供 `/api/moke/[...path]` 代理；缺少 `MOKE_AUTHORIZATION` 时可回退到 mock data。
- 首页由四个主模块组成：
  - `PosterHero`：展示今日 Rings、今日核心指标，以及无当日训练时的激励型空状态。
  - `MacroOverviewSection`：展示累计数据、热力图和 Fitness/Fatigue 面板。
  - `TrendSection`：展示本周 / 本月 / 本年的阶段性指标。
  - `DashboardSection`：展示历史记录、详情图、训练标签和里程碑时间线。
- 提供纯函数分析层，用于生成：
  - 里程碑
  - 连续训练周数
  - 训练标签
  - Fitness/Fatigue 状态
  - 历史对比（Time Machine）
- 通过 `.cache/moke/<accountId>/` 维护运行时缓存，降低首页重复请求成本。

---

## 2. 技术栈

### 2.1 框架
- `Next.js 16`（App Router）
- `React 19`
- 服务端组件优先，交互区块通过 `"use client"` 拆分

### 2.2 样式与视觉
- `Tailwind CSS 4`
- 深色玻璃拟态风格
- `lucide-react` 图标

### 2.3 动效与图表
- `framer-motion`
- `recharts`

### 2.4 测试与类型
- `TypeScript` 严格模式
- `Vitest` 单元测试，覆盖 `src/lib/moke` 与 `src/lib/oarboard`

---

## 3. 当前目录结构

### 3.1 `app/`
- `app/page.tsx`
  - 首页唯一顶层数据聚合入口。
  - 负责读取缓存、补拉今日实时数据、组装各区块 props。
- `app/api/moke/[...path]/route.ts`
  - Mok Fitness API 代理入口。

### 3.2 `src/components/`
- `poster-hero.tsx`
  - 顶部 Hero 区。
  - 现在包含三种状态：
    - 今日已有训练：展示 Rings 和今日指标。
    - 今日无训练但有历史：展示激励型空状态，包括“下一个里程碑”和最近一次训练摘要。
    - 完全无历史：展示轻量占位空状态。
- `fitness-rings.tsx`
  - 三环 SVG 组件。
- `macro-overview.tsx`
  - 累计卡片 + 热力图 / Fitness 状态面板。
- `trend-section.tsx`
  - 本周 / 本月 / 本年切换区。
  - 当前 4 张指标卡支持环比展示：
    - 当前值
    - 环比百分比
    - `vs 上周 / 上月 / 上年`
    - inline 趋势箭头图标
  - 当前趋势表现已从背景装饰型 SVG 箭头，收敛为更克制的 `lucide-react` inline 图标：
    - 上涨：红色 `ArrowUp`
    - 下跌：绿色 `ArrowDown`
    - 持平：中性 `Minus`
    - `暂无环比` 不显示图标
- `dashboard-section.tsx`
  - 历史列表、微观细节和里程碑时间线。
- `animated-metrics.tsx`
  - 动画数字和进度条。
- `section-intro.tsx`
  - 主模块公共头部组件。
  - 用于统一“宏观概览 / 阶段聚焦 / 历史记录”的标题和副说明样式。

### 3.3 `src/lib/moke/`
- Mok Fitness 数据接入层：
  - `client.ts`：HTTP 客户端与错误包装
  - `service.ts`：接口请求与格式化
  - `cache-store.ts`：缓存读写
  - `cache-service.ts`：缓存策略与首页用数据组合
  - `mock-data.ts`：mock 回退

### 3.4 `src/lib/oarboard/`
- 纯分析 / 视图模型层：
  - `poster-data.ts`
  - `dashboard-data.ts`
  - `calendar-data.ts`
    - 现在不仅负责 heatmap / trend cards 的基础数据，还负责阶段卡片的环比状态建模：
      - `up / down / flat / na / new`
      - 百分比文案
      - 上一周期原始值
      - tooltip 所需比较信息
  - `rings.ts`
  - `time-machine-data.ts`
  - `milestones-data.ts`
  - `fitness-fatigue-data.ts`
  - `dna-data.ts`
  - `today-data.ts`

`today-data.ts` 是新增辅助模块，用于：
- 合并缓存记录与今日实时记录
- 只把“缓存缺失的今日记录”补进累计 totals
- 基于记录重新生成本月 / 本年汇总

---

## 4. 当前首页行为

### 4.1 首页结构
- `PosterHero`
- `MacroOverviewSection`
- `TrendSection`
- `DashboardSection`

### 4.2 Hero 当前逻辑

#### 今日已有训练
- 使用 `buildTodayPosterHeroData()` 生成今日 Rings 与 Bento 指标。
- 显示距离、时长、热量、配速、桨频、桨次等信息。

#### 今日无训练但有历史
- 不再显示“空三环占满首屏”的旧空状态。
- 改为激励型空状态：
  - 标题：`今天还没开始运动`
  - 副信息：`下一个里程碑：X km`
  - 辅助信息：最近一次训练摘要
  - 右侧为单个“里程碑进度环”
- 该空状态经过多轮收缩，当前已经去掉重复卡片和过重的嵌套容器。

#### 完全无历史
- 展示极简空状态提示，不再保留无意义的巨大进度视觉。

### 4.3 模块头部统一
- `宏观概览`、`阶段聚焦`、`历史记录` 现在都通过 `SectionIntro` 输出。
- 三者统一为同一套结构：
  - 主标题
  - 副说明
  - 可选右侧控件（如筛选器、总条数）

### 4.4 纵向节奏统一
- 三个主模块的顶部外边距已统一收口。
- `PosterHero` 底部 padding 也做了收缩，避免 Hero 与 `MacroOverviewSection` 之间空白过大。

### 4.5 阶段聚焦（TrendSection）当前逻辑
- 支持 `本周 / 本月 / 本年` 三种周期切换。
- 每个周期输出 4 张指标卡：
  - 训练次数
  - 周期距离
  - 周期时长
  - 周期热量
- 每张卡片当前包含：
  - 指标标题
  - 主数值
  - 一行环比信息
- 环比信息的当前规则：
  - 默认只显示百分比，不默认显示绝对变化量
  - 周期映射为：
    - `本周 -> vs 上周`
    - `本月 -> vs 上月`
    - `本年 -> vs 上年`
  - 状态包括：
    - `up`
    - `down`
    - `flat`
    - `na`
    - `new`
- 视觉上当前采用 inline 图标而非背景趋势纹理，以保证小尺寸下的可读性与克制感。

---

## 5. 数据流与缓存

### 5.1 缓存机制
- 缓存根目录为 `.cache/moke/<accountId>/`
- 缓存文件包括：
  - `summary.json`
  - `heatmap.json`
  - `index.json`
  - `months/<yyyy-mm>.json`
- 当前策略是：
  - `6h TTL`
  - 基于 `latestWorkoutDay` 的增量刷新
  - 最近 `7` 天回看兜底
  - 刷新失败时回退旧缓存

### 5.2 首页数据拼装
- 首页先读取缓存摘要和缓存历史记录。
- 然后再单独请求当日汇总 `getTodayTotalsFromUpstream()`。
- 如果当日汇总显示“今天已有训练”，但缓存中的今日记录数量不足，则额外调用 `getTodayRecordsFromUpstream()` 拉取今日明细。
- 新拉回的今日明细不会直接重写缓存，但会在页面层面并入：
  - Hero 今日数据
  - 历史列表
  - 累计 totals
  - 本月 / 本年趋势
  - 里程碑分析
- 当前 `TrendSection` 所需的上一周期对比数据也在 `app/page.tsx` 中直接组装：
  - 当前周 vs 上周
  - 当前月 vs 上月
  - 当前年 vs 上年
- 对比逻辑保持在服务端页面层与纯函数分析层之间分工：
  - `app/page.tsx` 负责切周期、取当前 / 上一周期 summary
  - `calendar-data.ts` 负责把 summary 转成 UI 需要的趋势状态

### 5.3 这次修复的根因
- 之前首页出现过“页面知道今天有训练，但顶部 Rings 还是 0%”的问题。
- 根因是：
  - `todayTotals` 走上游实时数据
  - `todayRecords` 仍然只走缓存
- 现在已修正为“汇总与今日明细双通路协同”，避免当日训练后仍需手动等待缓存过期。

---

## 6. 里程碑系统

### 6.1 当前里程碑类型
- `distance-*`
  - 累计距离，如 `50 / 100 / 200 / 500 / 1000 km`
- `sessions-*`
  - 训练次数，如 `25 / 50 / 100 / 200 次`
- `single-*`
  - 单次突破，如 `3 km`、`5 km`
- `monthly-*`
  - 单月累计，如 `20 km`

### 6.2 新增内容
- 新增 `single-5`
- 新增 `monthly-20`

### 6.3 预览策略调整
- 之前未达成里程碑预览只是按模板顺序截取前几个，导致更有趣的条目不一定出现。
- 现在改为“按类型挑代表项”，优先展示：
  - `single`
  - `monthly`
  - `distance`
  - `sessions`

---

## 7. 测试与验证

### 7.1 当前测试覆盖
- `src/lib/moke/__tests__/`
  - 缓存服务
  - 格式化
  - mock data
  - proxy
  - service
- `src/lib/oarboard/__tests__/`
  - calendar
  - dashboard
  - dna
  - fitness fatigue
  - milestones
  - poster
  - rings
  - time machine
  - today-data
- `src/components/__tests__/`
  - dashboard-section
  - trend-section

### 7.2 本轮新增测试点
- `today-data.test.ts`
  - 验证今日记录合并、累计补齐、月/年汇总
- `cache-service.test.ts`
  - 验证 `getTodayRecordsFromUpstream()`
- `milestones-data.test.ts`
  - 验证 `monthly-20`
  - 验证 `single-5` 与 `monthly-20` 的未达成预览
- `calendar-data.test.ts`
  - 验证阶段卡片环比状态：
    - 正向百分比
    - 近似持平
    - 缺少上一周期
    - 上一周期为 0 时的 `新增`
- `trend-section.test.ts`
  - 验证趋势卡片渲染：
    - inline 上下 / 持平图标
    - `vs 上周 / 上月 / 上年`
    - 不再使用背景 SVG 趋势箭头
    - 当前配色语义为“上涨红、下跌绿”

### 7.3 验证说明
- `npm run typecheck` 是当前最稳定的校验命令。
- `vitest` 在某些受限 Windows 沙箱环境下可能因为 `esbuild spawn EPERM` 无法启动，这属于环境限制，不是项目逻辑本身的类型错误。

---

## 8. 已知限制

### 8.1 缓存仍以页面层合并为主
- 今日实时明细现在能补齐页面显示，但不会自动把新纪录立即落回 `.cache/moke`。
- 当前目标是先保证首页正确，再考虑是否做“当日写回缓存”。

### 8.2 热力图与趋势依旧偏重桌面布局
- 视觉上已经兼顾移动端，但热力图与大面板仍优先服务较宽视口。

### 8.3 沙箱环境限制
- 某些 Windows 沙箱下，`vitest/vite/esbuild` 可能触发 `spawn EPERM`。
- 类型检查通常可运行，测试命令可能受环境影响。

---

## 9. AI Agent 注意事项

- 不要恢复旧的 `lifetime-stats.tsx` 或 `calendar-first-section.tsx`。
- 不要在 Client Component 内直接做原始数据抓取和清洗。
- 修改分析层时优先保持“纯函数、无 I/O”的边界。
- 修改里程碑逻辑后，需要同步考虑：
  - Achievement scanner
  - 未达成预览策略
  - 对应单元测试
- 修改首页今日数据逻辑时，需要同时核对：
  - `todayTotals`
  - `todayRecords`
  - 缓存 totals
  - 月 / 年趋势汇总
- 修改 `TrendSection` 或 `calendar-data.ts` 时，需要同时核对：
  - 当前周期与上一周期 summary 是否同步
  - `trendState` 与 `trendDisplay` 是否一致
  - inline 图标颜色语义（当前约定：上涨红、下跌绿）
  - `trend-section.test.ts` 与 `calendar-data.test.ts`
