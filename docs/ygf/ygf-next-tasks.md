# YGF Explore · 任务清单（2026-09-26 晚更新）

新会话开场：读这份 + `ygf-handoff.md` + `ygf-explore-naming.md`，以 `git log` 为准。

## 协作流程（9/26 起）

- Claude 写代码（直接写入 `E:\Projects\luxtyle-menu`）→ Kevin `git status` 确认 modified → 推送 → Codex 审查 → Kevin 把意见交给 Claude 判断和修改。
- Codex 只审查不改代码：规则在仓库根目录 `AGENTS.md`。审查时下面「已定决策」一节优先于通用最佳实践。
- 本地跑 build / tsc 前先 `npm install`（9/26 新增依赖 `gsap`、`@gsap/react`）。

## 已定决策（审查时不要当成缺陷再报）

- **店长推荐 = 产品舞台**（`src/components/ygf/PickStage.tsx`，GSAP 3.15.0）：Draggable + Inertia 拖动甩动、按离中心距离实时算景深（两侧 scale .8 / opacity .5 / rotationY ±8°）、三层视差、滚轮计数器、Flip 共享元素进详情、SplitText（英文标题逐词、正文逐行遮罩；中文整句淡入）、Pair It 配料 chip、关闭整段倒放。
- **详情页自动慢速滚动在两种动效模式下都开**（Kevin 9/26 决定）。约 26px/s，停 1.4s 才开始，任何触摸 / 滚轮 / 按键即停。
- **Reduce Motion**：禁 3D 旋转、模糊、Flip 飞行；保留拖动吸附；改用淡入 + 轻缩放。
- **饮品 / 小吃文案**：d4–d8、s2–s6 的 STORY / TASTE / PAIR IT 来自 Kevin 9/26 提供的文案文件（含白桃果肉、菊香、真椰肉、自制手工香肠、店内自制现炸等事实）。唯一改动：大红袍英文 PAIR IT 按其预设的 House Creamer 写，**待 Kevin 最终确认**。
- **Pair It chip 只给文案点名了配料的 4 杯**：桂花乌龙→芦荟、白桃乌龙→招牌特调奶、大红袍→招牌奶香、椰香乌龙→招牌特调奶。
- GSAP 只在进入 Ma-Fans 时加载（`next/dynamic` + `ssr:false`）。

## A. 代码

1. ~~落地页铺满~~ —— `19c5508`。
2. ~~卡片放大~~ —— `d0829ee` + `d43e8d1`（含 Codex 审出的矮屏卡宽修复）。
3. ~~Ma-Fans 落在二级~~ —— `d43e8d1`。
4. ~~饮品三级卡文字优先~~ —— 被「产品舞台」方案取代，`f7f01d2`。
5. ~~详情弹层可访问性~~（Codex 审查 `f7f01d2`）：打开时背景 `inert`、焦点进弹层；关闭时焦点回舞台。

## B. 素材（Kevin 提供）

6. 四张落地卡的**竖版实拍图**（≥1080×1620，2:3）：Ma-Fans、汤底、食材、调料。
7. 夜市烤香肠图片（1:1，≥1000×1000）。

## C. 内容（店内确认后才能上线）

8. `SAUCE_RECIPES` 三个配方的真实比例和用料（现为编造的 `[草稿]`，**上线前必须替换**）。
9. d1–d3（蜂蜜茶、奶茶、泰式奶茶）和 s1（盐酥鸡）的 STORY。
10. `SPOTLIGHTS` 六款食材的口感、怎么煮、配什么汤底。
11. `BROTH_NOTES` 五款汤底的特点、原料、风味、适合配。

完整的文字 / 图片规范见 claude.ai 项目里的文档「YGF Explore 内容规范 · 文字与图片」。

## D. 验证

12. iPhone 实机：店长推荐拖动手感、帧率、详情转场、自动滚动、关闭回弹；Full 与 Reduce Motion 各一遍。

## E. 待评估

13. **lint 旧账**：12 个 error（7 个 `no-unescaped-entities` 在 review / vip / tomo 页；5 个 `set-state-in-effect` 在 PsstWidget / CartBar / QilinWidget / beiyuan 页）。不影响 build，低优先级一次性清理。
14. **落地页轨道是否也改用 GSAP Draggable + Inertia**：依赖已经在了，成本低。等 Kevin 对比两处手感再定。
15. **会员注册（收手机号）**：需 Vercel API 路由 + 托管数据库。先定是否与 POS 积分打通；收集手机号需隐私说明（CCPA），营销短信需单独勾选同意（TCPA）。
