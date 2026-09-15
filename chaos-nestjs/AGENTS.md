# chaos-nestjs 代码规则

> 本文件只列代码层面的硬规则与约定。
>
> 项目状态：**公开 = 是，归档 = 否**。属于 `chaos-ui` 前端练习项目的配套后端（学习仓库），本文件规则优先级低于根目录 `AGENTS.md`。

## 技术栈

- NestJS 11（`@nestjs/core` + `@nestjs/platform-express`）
- TypeORM 0.3 + `better-sqlite3`（SQLite 数据库，学习项目用，生产应改迁移）
- class-validator / class-transformer（DTO 校验与转换）
- TypeScript 5.x（注意：**不是** `chaos-ui` 的 TS 6，二者各自独立）
- 响应校验/格式化由全局拦截器与过滤器统一处理

## 与 chaos-ui 前端的约定（对齐，勿破坏）

前端 `chaos-ui` 的 `request.ts` 期望如下结构，后端必须保持一致：

1. **统一响应**：所有成功响应被 `ResponseInterceptor` 包成
   `ApiResponse<T> = { code: number, message: string, data: T }`；**`code === 0` 表示成功**。
2. **异常响应**：`AllExceptionsFilter` 把异常也包成同构 `{ code, message, data: null }`，`code` 取 HTTP 状态码。
3. **全局前缀 `/api`**：`main.ts` 已 `setGlobalPrefix('api')`，所有路由形如 `/api/users`。
   配合 `chaos-ui` 的 Vite 开发代理 `/api -> http://localhost:30048` 免 CORS。
4. **分页**：列表查询参数为 `page` / `size`（**不是** `pageSize`）；响应结构为
   `PageResult<T> = { items, total, page, size }`（**不要用 `list`**）。
   基类 `PageQueryDto` 已提供默认值（page=1、size=10），业务列表接口的 Query DTO 继承它即可。

## 分层约定

- 业务按领域放在 `src/modules/<domain>/`，每个域含 `*.module.ts` / `*.controller.ts` / `*.service.ts` / `*.entity.ts` 与 `dto/`。
- 跨域通用能力放 `src/common/`：
  - `common/response/`：统一响应接口与拦截器
  - `common/exception/`：全局异常过滤器
  - `common/pagination/`：分页 DTO 与结果接口
- 新增实体的模块用 `TypeOrmModule.forFeature([Entity])` 注册；根模块 `autoLoadEntities` 自动汇总。

## 代码规范（硬性，由工具保证）

- 提交/交付前确保：
  - `npm run type-check`（`tsc --noEmit`）无类型错误。
  - `npm run lint`（`eslint`）通过。
- 格式化统一交给 Prettier（`npm run format`），规则：**无分号、单引号、printWidth 100**（与 `chaos-ui` 一致）。
- 后端返回结构、分页字段、全局前缀等「与前端对齐」的约定，改动时务必保持兼容。

## 常用脚本

```sh
npm install        # 安装依赖
npm run start:dev  # 开发（watch 热重载），默认监听 :30048，路由前缀 /api
npm run build      # nest build 生产构建到 dist/
npm run start:prod # node dist/main 启动生产产物
npm run type-check # 仅类型检查
npm run lint       # eslint
npm run format     # Prettier 格式化 src/
```

## 安全约定（遵循根 AGENTS.md）

- `.env` 含端口/数据库路径等，**禁止入库**；仅提交 `.env.example`。
- 不主动 `git add/commit/push`，除非用户明确要求。
