---
requirement_id: REQ-DOMAIN-NNN
revision: 1
status: proposed
title: 简短需求标题
created_at: YYYY-MM-DDTHH:mm:ss+08:00
timezone: Asia/Shanghai
---

# REQ-DOMAIN-NNN：简短需求标题

## 规则

有效性由 front matter 的 `status` 决定：`proposed` 表示拟议内容、不是有效基线；只有关联变更已 `approved` 且有可核验的用户决定证据后才能转为 `active`。既有需求修改获批前，原 `active` 修订仍是基线。

只写一条可独立验收的业务行为或约束。

- **条件/分支**：适用条件及各分支结果。
- **权限**：谁可以执行或查看。
- **异常/边界**：错误、极值和例外处理。

## 验收标准

- [ ] 给定……，当……，则……。

## 变更记录

| 修订 | 变更 ID            | 变更状态 | 摘要                 |
| ---- | ------------------ | -------- | -------------------- |
| 1    | `CHG-YYYYMMDD-NNN` | pending  | 首次提出，非有效基线 |
