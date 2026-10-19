# Git 分支与 Commit 规范

## 1. Git 分支列表

| 分支         | 示例                         | 用途                      |
| ------------ | ---------------------------- | ------------------------- |
| `main`       | `main`                       | 生产稳定代码、正式发布    |
| `develop`    | `develop`                    | 日常开发集成              |
| `feature/*`  | `feature/user-login`         | 新功能开发                |
| `fix/*`      | `fix/login-error`            | 普通 Bug 修复             |
| `hotfix/*`   | `hotfix/payment-error`       | 生产紧急修复              |
| `release/*`  | `release/1.2.0`              | 版本验收、发布准备        |
| `refactor/*` | `refactor/project-structure` | 代码重构、架构调整        |
| `chore/*`    | `chore/ci-pipeline`          | 工程配置、依赖、CI 等维护 |
| `docs/*`     | `docs/api-guide`             | 文档修改                  |
| `test/*`     | `test/auth-coverage`         | 测试相关修改              |

## 2. Commit 类型列表

格式：

`<type>(<scope>): <description>`

| 类型       | 用途                     | 示例                                   |
| ---------- | ------------------------ | -------------------------------------- |
| `feat`     | 新增功能                 | `feat(auth): add user login`           |
| `fix`      | 修复 Bug                 | `fix(order): correct total amount`     |
| `refactor` | 代码重构                 | `refactor(user): extract user service` |
| `perf`     | 性能优化                 | `perf(query): optimize user query`     |
| `test`     | 测试相关                 | `test(auth): add login tests`          |
| `docs`     | 文档修改                 | `docs(api): update login guide`        |
| `style`    | 不影响逻辑的代码风格调整 | `style(user): format user service`     |
| `chore`    | 工程维护、依赖更新       | `chore: update dependencies`           |
| `ci`       | CI/CD 配置               | `ci: add unit test workflow`           |
| `build`    | 构建和打包配置           | `build: configure Maven profile`       |
| `revert`   | 回滚提交                 | `revert: revert login change`          |

## 3. 分支流转规则

- 新功能：`develop` → `feature/*` → MR → `develop`
- 普通 Bug：`develop` → `fix/*` → MR → `develop`
- 架构重构：`develop` → `refactor/*` → MR → `develop`
- 工程化调整：`develop` → `chore/*` → MR → `develop`
- 版本发布：`develop` → `release/*` → MR → `main`，并同步回 `develop`
- 生产紧急修复：`main` → `hotfix/*` → MR → `main`，并同步回 `develop`

## 4. 规范要求

- `main`、`develop` 禁止直接提交，统一通过 MR 合并。
- MR 必须通过 CI 检查和 Code Review。
- 分支使用小写英文，单词之间使用连字符。
- 每个功能或修复使用独立分支。
- 正式发布使用 Git Tag，例如 `v1.2.0`。
- `release/*` 仅在需要版本冻结和集中验收时使用。
- 生产紧急修复必须同步回开发主线，避免后续版本再次引入相同问题。
