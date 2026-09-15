# chaos-ui 容器级代码规则

> 本文件约束 `chaos-ui/` 容器层面的**全局行为**，不重复各子仓库的代码细节。
>
> 项目状态：**公开 = 是，归档 = 否**。本文件规则优先级低于根目录 `AGENTS.md`。

## 仓库边界（硬性）

- `chaos-ui` 下含两个**相互独立**的 git 仓库：`chaos-vue`（前端）与 `chaos-nestjs`（后端）。
- 改动只落在目标仓库内；**不跨仓库移动 / 展示对方源码**，不把 A 仓库的文件提交进 B 仓库。
- 两套 `package.json`、`node_modules`、`tsconfig`、`AGENTS.md` / `README.md` 各自独立，互不影响。
- 各子仓库的代码规则见其自身 `AGENTS.md`，本目录规则与其冲突时，**以子仓库 `AGENTS.md` 为准**（子仓库对具体技术栈拥有最终解释权），本文件只管跨仓库的通用约束。

## 与根 AGENTS.md 的关系

- 遵循根 `AGENTS.md` 的全局约束：不主动 `git add / commit / push`；尊重仓库边界；语言中文。
- 本项目为**公开（公开 = 是）**，须严格遵守根 `AGENTS.md` 的敏感信息约束（禁止写入密码 / 密钥 / Token / 内网地址 / 个人身份等，发布前一律脱敏）；`.env*`、`.idea`、`.scratch/` 不入库（见各仓库 `.gitignore`）。
- 本项目**未归档**，可正常读写，但新增 / 修改仍须遵守各子仓库 `AGENTS.md` 的硬性规则。

## 前后端对齐约定（勿破坏）

以下约定是 `chaos-vue` 与 `chaos-nestjs` 的共同契约，改动任一侧都不得破坏兼容：

1. **统一响应**：`{ code, message, data }`，`code === 0` 为成功；异常也包成同构结构。
2. **路由前缀 `/api`**：后端 `main.ts` 已 `setGlobalPrefix('api')`，前端经 `VITE_API_BASE_URL` 访问，**勿硬编码**后端 host。
3. **分页**：请求参数 `page` / `size`（非 `pageSize`），响应 `{ items, total, page, size }`（非 `list`）。
4. **端口固定**：前端 `30047`、后端 `30048`；`chaos-vue` 的 `vite.config.ts` 已配 `/api` 代理到 `http://localhost:30048`。改动端口须同步记入对应 `AGENTS.md`。

## 工具与格式

- 两仓库均用 Prettier 格式化（**无分号、单引号、printWidth 100**）；提交 / 交付前确保各自 `type-check` 与 `lint` 通过。
- 前端类型检查用 `vue-tsc --build`，后端用 `tsc --noEmit`；二者 TS 主版本不同（前端 6、后端 5），各自独立，勿混用。

## 常用操作

```sh
# 前端
cd chaos-vue && npm install && npm run dev

# 后端
cd chaos-nestjs && cp .env.example .env && npm install && npm run start:dev
```

> 各仓库的完整脚本与分层约定见其子目录 `README.md` 与 `AGENTS.md`。
