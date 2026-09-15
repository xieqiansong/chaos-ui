# chaos-nestjs

`chaos-ui` 前端练习项目的配套后端（**学习仓库**），使用 NestJS 11 + TypeORM + SQLite。

## 与前端的关系

- 全局路由前缀 `/api`，与 `chaos-ui` 的 `VITE_API_BASE_URL`（缺省 `/api`）对齐。
- 开发联调：在 `chaos-ui` 的 `vite.config.ts` 加代理

  ```ts
  server: {
    proxy: {
      '/api': 'http://localhost:30048',
    },
  }
  ```

  这样前端请求 `/api/users` 会被转发到本服务，免 CORS。
- 统一响应 `{ code, message, data }`（`code === 0` 成功），分页 `{ items, total, page, size }`，详见 `AGENTS.md`。

## 快速开始

```sh
cp .env.example .env   # 按需修改端口/数据库路径
npm install
npm run start:dev      # http://localhost:30048/api
```

## 示例接口（users 模块）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/users?page=1&size=10` | 分页列表，返回 `PageResult<User>` |
| GET | `/api/users/:id` | 详情 |
| POST | `/api/users` | 新增 |
| PUT | `/api/users/:id` | 修改 |
| DELETE | `/api/users/:id` | 删除 |

## 目录结构

```
src/
├── main.ts                         # 入口：全局前缀 /api、管道、拦截器、过滤器
├── app.module.ts                   # 根模块：Config + TypeORM(SQLite)
├── common/
│   ├── response/                   # ApiResponse 接口 + 响应拦截器
│   ├── exception/                  # 全局异常过滤器
│   └── pagination/                 # 分页 DTO / PageResult 接口
└── modules/
    └── users/                      # 示例领域模块（实体/服务/控制器/DTO）
```
