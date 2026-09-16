# chaos-ui 容器级代码规则

> 本文件约束 `chaos-ui/` 容器层面的**全局行为**，不重复各子项目的代码细节。
>
> 项目状态：**公开 = 是，归档 = 否**。本文件规则优先级低于根目录 `AGENTS.md`。

## 仓库结构（单一仓库 + 边界清晰的子项目）

- `chaos-ui` 为**一个单一的 git 仓库**（根目录 `chaos-ui/.git` 统一版本控制）。
- 仓库内含两个**边界清晰、互不耦合**的子项目：`chaos-vue`（前端）与 `chaos-nestjs`（后端）。
- 二者**仅通过 HTTP 接口（前缀 `/api`）协作**；源码层面不得互相 `import`、不得依赖对方的 `node_modules`，不得在子项目目录约定之外搬运对方文件。

## 工程边界（硬性）

以下边界在两个子项目间必须维持，改动不得破坏：

- 各自拥有独立的 `package.json`、`node_modules`、`tsconfig*.json` 与构建 / 脚本配置，依赖与构建互不干扰。
- 各自拥有独立的 `AGENTS.md` / `README.md` 与 `.gitignore`，负责本子项目的规则与忽略项。
- 根目录 `AGENTS.md` / `README.md` **只管跨子项目的全局约束与共同契约**，不替代子项目自身的规则。
- 子项目自身 `AGENTS.md` 与本文件冲突时，**以子项目 `AGENTS.md` 为准**（子项目对具体技术栈拥有最终解释权）。
- 忽略项分工：根 `.gitignore` 仅覆盖容器级产物（`.idea`、`.scratch`）；各子项目的 `node_modules`、`dist`、`.env*` 等由其自身 `.gitignore` 覆盖（已验证 `chaos-vue/node_modules`、`chaos-nestjs/node_modules|dist` 均被忽略，勿在根 `.gitignore` 重复或越权管理子项目产物）。

## 与根 AGENTS.md 的关系

- 遵循根 `AGENTS.md` 的全局约束：不主动 `git add / commit / push`；尊重子项目边界；语言中文。
- 本项目为**公开（公开 = 是）**，须严格遵守根 `AGENTS.md` 的敏感信息约束（禁止写入密码 / 密钥 / Token / 内网地址 / 个人身份等，发布前一律脱敏）；`.env*`、`.idea`、`.scratch/` 不入库（见各子项目 `.gitignore`）。
- 本项目**未归档**，可正常读写，但新增 / 修改仍须遵守各子项目 `AGENTS.md` 的硬性规则。

## 前后端对齐约定（勿破坏）

以下约定是 `chaos-vue` 与 `chaos-nestjs` 的共同契约，改动任一侧都不得破坏兼容：

1. **统一响应**：`{ code, message, data }`，`code === 0` 为成功；异常也包成同构结构。
2. **路由前缀 `/api`**：后端 `main.ts` 已 `setGlobalPrefix('api')`，前端经 `VITE_API_BASE_URL` 访问，**勿硬编码**后端 host。
3. **分页**：请求参数 `page` / `size`（非 `pageSize`），响应 `{ items, total, page, size }`（非 `list`）。
4. **端口固定**：前端 `30047`、后端 `30048`；`chaos-vue` 的 `vite.config.ts` 已配 `/api` 代理到 `http://localhost:30048`。改动端口须同步记入对应子项目 `AGENTS.md`。

## 工具与格式

- 两子项目均用 Prettier 格式化（**无分号、单引号、printWidth 100**）；提交 / 交付前确保各自 `type-check` 与 `lint` 通过。
- 前端类型检查用 `vue-tsc --build`，后端用 `tsc --noEmit`（即 `npm run build`）；二者 TS 主版本不同（前端 6、后端 5），各自独立，勿混用。

## 常用操作

```sh
# 前端（独立 npm 包）
cd chaos-vue && npm install && npm run dev        # http://localhost:30047

# 后端（独立 npm 包，另开终端）
cd chaos-nestjs && cp .env.example .env && npm install && npm run start:dev   # http://localhost:30048/api
```

> 各子项目的完整脚本与分层约定见其子目录 `README.md` 与 `AGENTS.md`。
