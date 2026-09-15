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

## 示例接口（auth 模块）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/auth/login` | 登录：入参 `{ username, password }`，返回 `{ token, user }` |
| GET | `/api/auth/profile` | 当前用户信息（需 `Authorization: Bearer <token>`，演示路由守卫） |

- 演示账号：`admin` / `admin123`（库内无用户时由 `AuthService.onModuleInit` 自动种入）。
- 密码以 scrypt 哈希存储（`salt:hash` 格式，见 `common/auth/password`），token 为内置 HS256 JWT（`common/auth/jwt`，密钥取 `JWT_SECRET`，缺省开发默认值）。
- `users` 模块已挂 `JwtAuthGuard`，需登录后携带 token 方可访问；401 经全局 `AllExceptionsFilter` 包成统一结构 `{ code, message, data: null }`。
- 前端 `chaos-vue` 的 `src/api/auth.ts` 已对接本模块 `/auth/login`。

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
