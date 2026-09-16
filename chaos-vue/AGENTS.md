# chaos-ui 代码规则

> 本文件只列代码层面的硬规则与约定。功能规划与学习路线见 `示例清单.md`、`项目构建.md`。
>
> 项目状态：**公开 = 是，归档 = 否**。属于个人前端学习仓库，本文件规则优先级低于根目录 `AGENTS.md`。

## 技术栈

- Vue 3（`@vue/tsconfig` 严格模式，`<script setup lang="ts">` 写法）
- Vite 8 + Vue DevTools 插件
- TypeScript（类型检查用 `vue-tsc --build`，非 `tsc`）
- Pinia 4（状态管理，Setup 风格 store）
- Vue Router 5（`createWebHistory` 模式）
- Element Plus 2（当前在 `src/main.ts` **全量引入** `app.use(ElementPlus)`，仅适配后台学习场景，勿擅自改为按需自动导入）
- ECharts 6（图表）
- axios（HTTP，封装见下）

## 路径别名

- `@` 映射到 `src/`，已在 `vite.config.ts` 与 `tsconfig.app.json` 配置。
- 跨文件导入一律用 `@/xxx`，禁止相对路径跳级（如 `../../`）。

## HTTP 请求（`src/utils/request.ts`）

- 统一走 `src/utils/request.ts`，**不要**在业务页面里 `new axios` 或直连。
- 后端返回结构约定为 `ApiResponse<T> = { code, message, data }`，**`code === 0` 视为成功**。
- 业务调用使用导出的泛型封装 `get<T> / post<T> / put<T> / del<T>`，它们已剥掉外层、直接返回 `data` 业务字段。
- 鉴权：`request` 拦截器自动从 `localStorage` 读取 `token` 并以 `Bearer` 附加到 `Authorization`。
- 401 处理：响应拦截器清空 token 并跳转 `/login`；此跳转依赖未来真实登录路由，改动时保持行为一致。
- 后端地址通过环境变量 `VITE_API_BASE_URL` 注入，缺省 `/api`；**勿硬编码**后端 host。
- 开发端口固定：前端 `:30047`，后端 `chaos-nestjs` `:30048`；`vite.config.ts` 已配 `/api` 代理到 `http://localhost:30048`，改动端口须同步 `端口记录.md`。

## 分页约定（对齐 chaos-lib）

- 列表请求参数用 `page` / `size`（**不是** `pageSize`），由 `src/types/pagination.ts` 的 `PageQuery` 定义，`page`/`size` 可选（缺省由后端套默认值）。
- 列表响应结构为 `{ items, total, page, size }`（`PageResult<T>`），对应 chaos-lib `pagination.Result` 的字段；**不要用 `list`**。
- 页面查询参数统一形如 `{ page, size, ...搜索条件 }`，搜索时重置 `page=1` 再请求。
- **全部接口已由 chaos-nestjs 实现**：`src/api/*.ts` 直接调用真实后端（登录、用户 CRUD、批量删、导出/导入、字典、文件上传、仪表盘统计、个人资料 GET/PUT `/users/me`），无前端 mock 数据；不要回流到假数据占位。
- 错误在拦截器统一 `console.error` 并 reject；业务层捕获后给用户提示，勿静默吞掉。

## 路由（`src/router/index.ts`）

- 路由类型统一用 `RouteRecordRaw`。
- 非首屏页面统一 **懒加载**：`component: () => import('@/views/XxxView.vue')`。
- `meta` 字段经 `src/types/router.d.ts` 扩展类型（`title?`、`requiresAuth?`），新增 meta 字段须同步在此声明，禁止随意加未知属性。
- 全局前置守卫负责：设置 `document.title`、按 `meta.requiresAuth` 做登录校验（无 token 跳 `/login`）。改动守卫逻辑保持这两项职责。
- 页面级组件放 `src/views/`，命名 `<Name>View.vue`（如 `HomeView.vue`）。

## 状态管理（`src/stores/`）

- 使用 Pinia **Setup 风格** store（`defineStore(id, () => { ... })`），state 用 `ref`、getter 用 `computed`、action 用普通函数。
- 一个业务域一个文件（如 `user.ts`）；需要 store 类型时 `export type XxxStore = ReturnType<typeof useXxxStore>`。
- Pinia state 刷新会丢失；需持久化的状态（如登录态）要同步 `localStorage`，并在 store 初始化时回填。

## 组件与资源

- 通用组件放 `src/components/`，文件与组件名用 PascalCase（如 `HelloWorld.vue`）。
- 图标放 `src/components/icons/`；Element Plus 图标按需 `import { Search } from '@element-plus/icons-vue'`。
- 静态资源：经 Vite 处理的放 `src/assets/`；纯静态放根目录 `public/`。

## 代码规范（硬性，由工具保证）

- 提交/交付前确保：
  - `npm run type-check`（`vue-tsc --build`）无类型错误。
  - `npm run lint`（`oxlint --fix` + `eslint --fix`）通过。
- 格式化统一交给 Prettier（`npm run format`），规则：**无分号、单引号、printWidth 100**。不要手工调整格式，也不要改 `.prettierrc.json` 风格设定。
- `oxlint` 配置以 `.oxlintrc.json` 为基准，ESLint 通过 `eslint-plugin-oxlint` 复用该配置；改规则改 `.oxlintrc.json`，勿在 `eslint.config.ts` 里重复定义。
- 运行时要求：**Node `^22.18.0 || >=24.12.0`**（见 `package.json` engines）。

## 常用脚本

```sh
npm install        # 安装依赖
npm run dev        # 启动开发服务器（Vite :30047，热更新 + Vue DevTools）
npm run build      # 类型检查 + 生产构建（run-p type-check + build-only）
npm run preview    # 本地预览构建产物
npm run type-check # 仅类型检查
npm run lint       # oxlint + eslint 修复
npm run format     # Prettier 格式化 src/
```

## 学习项目约定

- `示例清单.md` 是后台管理系统能力的实现清单（搜索+表格+分页、增删改查弹窗、请求封装、路由菜单框架、登录鉴权、ECharts 封装等），按清单逐项落地到**真实页面**，不要单独写 demo 验证。
- 推荐载体：一个「用户管理系统」（登录 / 用户列表 / 详情 / 角色 / 数据看板 / 个人中心）即可串起大部分能力。
- 因项目为公开学习仓库（已推送 GitHub），涉及后端的对接（如 chaos-lib 提供的 API）以 `VITE_API_BASE_URL` 切换，不提交任何 token/密钥；`.env*` 不入库。
- 不主动 `git add/commit/push`，除非用户明确要求。
