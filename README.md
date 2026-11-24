# 互联网专家服务平台（Internet Expert Service Platform）

基于 **Vue 2 + Element UI** 与 **Express + sql.js** 构建的互联网专家服务平台课程设计项目，包含管理控制台、会员中心、专家中心三端界面与统一登录体系。

## 在线演示

本项目提供了一个**免安装、免后端**的静态演示版，直接打开即可体验全部界面与交互：

**https://2522081904.github.io/internet-expert-platform/**

该版本位于 `docs/` 目录，由 GitHub Pages 托管。它将后端接口替换为浏览器 `localStorage` 持久化，数据字段与 `server/db.js` 的预置数据完全一致，因此无需启动 Node 服务即可完整走通三端流程。Vue、Element UI 与图标字体均已本地化到 `docs/vendor/`，断网也能正常打开。

演示账号见下方[演示账号](#演示账号)一节，登录页提供一键填入按钮。

> 如需真实的后端联动版本，请按[快速开始](#快速开始)启动 Express 服务后打开根目录的 HTML 页面。

## 功能概览

| 端 | 页面 | 功能 |
| --- | --- | --- |
| 管理端 | `index.html` | 数据看板、会员管理、专家管理、主题管理、订单管理 |
| 会员端 | `member-system.html` | 专家浏览、主题查看、我的订单、咨询消息、个人资料 |
| 专家端 | `expert-system.html` | 咨询消息、订单列表、我的主题、个人资料 |
| 通用 | `login.html` | 统一登录，按角色跳转至对应工作台 |

## 技术栈

- **前端**：Vue 2.x、Element UI、原生 `fetch`，单文件 HTML 多页结构，无构建步骤
- **后端**：Node.js、Express 4.x、CORS
- **数据库**：sql.js（SQLite 的 WebAssembly 版本，数据持久化至 `server/data.db`）
- **开发工具**：IntelliJ IDEA

## 目录结构

```
expert-platform/
├── index.html             # 管理控制台
├── member-system.html     # 会员中心
├── expert-system.html     # 专家中心
├── login.html             # 统一登录页
├── bamboo-bg.jpg          # 登录页背景图
└── server/
    ├── server.js          # Express 服务与全部 REST 接口
    ├── db.js              # sql.js 初始化、建表与预置数据
    ├── package.json
    └── package-lock.json

docs/                      # 静态演示版（GitHub Pages 部署目录）
├── index.html             # 单文件应用，含三端全部界面
├── bamboo-bg.jpg
└── vendor/                # 本地化的 Vue / Element UI / 图标字体
```

## 静态演示版说明

`docs/index.html` 是一个约 52 KB 的单文件应用，使用与后端无关的 `localStorage` 数据层：

- **数据键**：`iep_static_demo_v1`，首次打开自动写入预置数据；清空该键即可恢复初始状态。
- **登录**：在登录页校验账号密码，按角色（admin / member / expert）渲染不同的侧栏菜单与页面。
- **移动端**：宽度小于 768px 时侧栏收起为抽屉菜单，通过顶部汉堡按钮唤出。
- **离线可用**：所有前端依赖均在 `docs/vendor/` 内，无任何外部 CDN 请求。

## 快速开始

### 1. 启动后端

```bash
cd server
npm install
npm start          # 默认监听 http://localhost:3000
```

首次启动会自动创建 `server/data.db`，建表并写入演示数据。

### 2. 打开前端

前端为静态页面，任一方式均可：

- 直接用浏览器打开 `login.html`；
- 或使用任意静态服务器，例如 `npx serve .`。

前端各页面的 `API_BASE` 均指向 `http://localhost:3000`，如需修改请编辑对应 HTML 中的该常量。

## 演示账号

| 角色 | 账号 | 密码 |
| --- | --- | --- |
| 管理员 | `admin` | `123456` |
| 会员 | `member001` / `member002` | `123456` |
| 专家 | `expert001` / `expert002` | `123456` |

> 演示账号与密码仅为课程设计使用，生产环境请务必替换为加密存储与鉴权方案。

## 后端接口

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/login` | 统一登录，返回角色与用户信息 |
| GET/POST | `/api/members` | 会员列表 / 新增 |
| GET/PUT/DELETE | `/api/members/:id` | 会员详情 / 更新 / 删除 |
| GET/POST | `/api/experts` | 专家列表 / 新增（支持 `status` 过滤） |
| GET/PUT/DELETE | `/api/experts/:id` | 专家详情 / 更新 / 删除 |
| GET/POST | `/api/topics` | 主题列表 / 新增 |
| GET/PUT/DELETE | `/api/topics/:id` | 主题详情 / 更新 / 删除 |
| GET/POST | `/api/orders` | 订单列表 / 新增（支持按用户过滤） |
| PUT/DELETE | `/api/orders/:id` | 订单更新 / 删除 |
| GET/POST | `/api/messages` | 消息列表 / 发送 |
| PUT | `/api/messages/:id/read` | 标记消息已读 |
| DELETE | `/api/messages/:id` | 删除消息 |

## 说明

- 本项目为课程设计作品，未包含鉴权中间件、密码加密、分页与输入校验等生产级能力。
- `server/data.db` 属于运行时生成文件，已加入 `.gitignore`，克隆后首次启动会自动重建。
