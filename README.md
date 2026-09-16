# chaos-ui

前端学习项目，包含**单一 git 仓库下的两个边界清晰的子项目**：前端 `chaos-vue` 与配套后端 `chaos-nestjs`。二者在同一仓库中并排放置，但各自是独立的 npm 工程（独立依赖、构建、测试），仅通过 HTTP 接口协作。**工程边界**：前后端不互相引用源码、不共享 `node_modules`，各自拥有 `package.json` / `tsconfig` / `AGENTS.md` / `README.md` / `.gitignore`，可独立安装、构建与运行。

## 组成

| 子项目 | 技术栈 | 端口 | 说明 |
| --- | --- | --- | --- |
| **chaos-vue** | Vue 3 + Vite 8 + Element Plus + Pinia + Vue Router 5 + ECharts 6 | `:30047` | 练习后台管理系统（登录 / 用户列表 / 详情 / 角色 / 数据看板 / 个人中心）。详见 `chaos-vue/README.md`。 |
| **chaos-nestjs** | NestJS 11 + TypeORM 0.3 + better-sqlite3（SQLite） | `:30048` | `chaos-vue` 的配套后端（学习仓库），统一响应 `{ code, message, data }`、分页 `{ items, total, page, size }`。详见 `chaos-nestjs/README.md`。 |

## 前后端联调约定

- 后端全局路由前缀 `/api`；前端经 `VITE_API_BASE_URL`（缺省 `/api`）访问。
- 开发期 `chaos-vue` 的 `vite.config.ts` 已配 `/api` 代理到 `http://localhost:30048`，免 CORS。
- 端口固定：前端 `30047`、后端 `30048`；改动任一侧端口须同步对应子项目 `AGENTS.md` 的「端口记录」约定。
- 统一响应：`code === 0` 成功；列表分页字段为 `page` / `size`，响应结构 `{ items, total, page, size }`（**勿用 `list` / `pageSize`**）。

## 快速开始

```sh
# 前端（独立 npm 包）
cd chaos-vue && npm install && npm run dev      # http://localhost:30047

# 后端（独立 npm 包，另开终端）
cd chaos-nestjs && cp .env.example .env && npm install && npm run start:dev   # http://localhost:30048/api
```

## 目录结构

```
chaos-ui/                      # 单一 git 仓库根
├── chaos-vue/                # 前端子项目（独立 npm 包：package.json / node_modules / tsconfig / AGENTS.md / README.md）
└── chaos-nestjs/             # 后端子项目（独立 npm 包：同上）
```

> 各子项目的代码规则与详细约定见其目录内的 `AGENTS.md`；本目录级 `AGENTS.md` 只约束**跨子项目的全局行为与共同契约**。
