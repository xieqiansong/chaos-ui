# chaos-ui

前端学习项目容器，包含**两个相互独立的 git 仓库**：前端 `chaos-vue` 与配套后端 `chaos-nestjs`。二者在 `chaos-ui/` 下并排放置，但各自拥有独立的版本控制与依赖，互不直接引用。

## 组成

| 子仓库 | 技术栈 | 端口 | 说明 |
| --- | --- | --- | --- |
| **chaos-vue** | Vue 3 + Vite 8 + Element Plus + Pinia + Vue Router 5 + ECharts 6 | `:30047` | 练习后台管理系统（登录 / 用户列表 / 详情 / 角色 / 数据看板 / 个人中心）。详见 `chaos-vue/README.md`。 |
| **chaos-nestjs** | NestJS 11 + TypeORM 0.3 + better-sqlite3（SQLite） | `:30048` | `chaos-vue` 的配套后端（学习仓库），统一响应 `{ code, message, data }`、分页 `{ items, total, page, size }`。详见 `chaos-nestjs/README.md`。 |

## 前后端联调约定

- 后端全局路由前缀 `/api`；前端经 `VITE_API_BASE_URL`（缺省 `/api`）访问。
- 开发期 `chaos-vue` 的 `vite.config.ts` 已配 `/api` 代理到 `http://localhost:30048`，免 CORS。
- 端口固定：前端 `30047`、后端 `30048`；改动任一侧端口须同步 `chaos-vue/AGENTS.md` 的「端口记录」约定。
- 统一响应：`code === 0` 成功；列表分页字段为 `page` / `size`，响应结构 `{ items, total, page, size }`（**勿用 `list` / `pageSize`**）。

## 快速开始

```sh
# 前端
cd chaos-vue && npm install && npm run dev      # http://localhost:30047

# 后端（另开终端）
cd chaos-nestjs && cp .env.example .env && npm install && npm run start:dev   # http://localhost:30048/api
```

## 目录结构

```
chaos-ui/
├── chaos-vue/        # 前端仓库（独立 git）
└── chaos-nestjs/     # 后端仓库（独立 git）
```

> 各子仓库的代码规则与详细约定见其目录内的 `AGENTS.md`；本目录级 `AGENTS.md` 只约束**容器层面的全局行为**。
