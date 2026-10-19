# Git 规范

## 分支

| 分支              | 用途                     |
| ----------------- | ------------------------ |
| `main`            | 稳定版本，仅通过 MR 合并 |
| `develop`         | 日常集成，仅通过 MR 合并 |
| `feature/<name>`  | 新功能                   |
| `fix/<name>`      | Bug 修复                 |
| `docs/<name>`     | 文档修改                 |
| `refactor/<name>` | 代码重构                 |
| `chore/<name>`    | 工具、依赖等维护         |
| `hotfix/<name>`   | 紧急修复                 |

分支名使用小写英文，多个单词用 `-` 连接，例如 `feature/user-login`。

## 提交信息

格式：

```text
<type>(可选范围): <简短说明>
```

类型使用 `feat`、`fix`、`docs`、`style`、`refactor`、`perf`、`test`、`build`、`ci`、`chore` 或 `revert`。

示例：

```text
feat(auth): 添加登录功能
fix: 修复配置读取错误
```

## 开发流程

1. 从 `develop` 创建对应类型的分支。
2. 在分支上开发并提交，提交信息遵守上述格式。
3. 完成后向 `develop` 发起 MR，等待检查和 Review 通过后合并。
4. 发布时由 `develop` 发起 MR 到 `main`。

紧急修复从 `main` 创建 `hotfix/<name>`，合并到 `main` 后同步回 `develop`。
