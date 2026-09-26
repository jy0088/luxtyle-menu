# YGF Explore · 下次任务清单（2026-09-25 晚定，9/26 更新）

新会话开场：读这份 + `ygf-handoff.md` + `ygf-explore-naming.md`，以 `git log` 为准。

## A. 代码改动（src/app/menu/ygf/page.tsx）

1. **落地页铺满**：午餐横幅下方有约半屏留白。原因是 `.orb-wrap { min-height: calc(100dvh - 190px) }` 里的 190 是估的，没量过。改法：落地页容器设 `height:100dvh` 并用 flex 纵向布局，`.orb-wrap { flex:1 }`，横幅放在最后，去掉 190 这个魔数。改完需要实机截图确认。
2. **卡片放大**：卡片尺寸改成按轨道区的实际可用高度计算（ResizeObserver 或容器查询），卡高吃满剩余空间。宽度上限 = 屏宽减去左右露边，保证后排仍能从前排上缘露出。可考虑把 `ORB_RX` 调小，让卡片横向更集中。
3. **Ma-Fans 落在二级**：进入后四个横幅全部收起，不默认展开店长推荐。
4. **饮品三级卡改为文字优先**：从上到下依次是 品名 → 搭配 → 描述 → 图片（缩小）→ 价格。
   - 这会推翻 9/25 的「卡片瘦身、内容进弹层」方案。需要一并决定饮品详情弹层是否还保留，或只留给「已替你配好参数」这类内容。
   - 小吃卡是否用同样的顺序，待 Kevin 确认。
   - d4–d8 没有文案，文字优先卡片会显得空。改版前要先补文案，或者设计缺文案时的降级样式。

## B. 素材（Kevin 提供）

5. 四张落地卡的**竖版实拍图**（建议 ≥1080×1620，2:3），分别对应 Ma-Fans、汤底、食材、调料。底部渐变遮罩压中英标题。图片到位前先用渐变加文字过渡。

## C. 内容（店内确认后才能上线）

6. `SAUCE_RECIPES` 三个配方的真实比例和用料（现为编造的 `[草稿]`，**上线前必须替换**）
7. 饮品 d4–d8 的口味和搭配；小吃 s3–s6 的口味
8. `SPOTLIGHTS` 六款食材的煮法和配汤
9. `BROTH_NOTES` 五款汤底的特点、原料、风味、适合配

## D. 验证

10. 推送后在 iPhone 上检查（开启 Reduce Motion）：四张牌是否同时可见、横幅是否贴底无留白、手风琴手感

## E. 待评估（A1–A3 完成后再定）

11. **GSAP**（官方 `greensock/gsap-skills`，MIT；GSAP 含全部插件现已免费商用）。
    安装：Claude Code 内 `/plugin marketplace add greensock/gsap-skills`，或 `npx skills add https://github.com/greensock/gsap-skills`。
    React 项目不需要 `gsap-frameworks`。
    可能用途：轨道拖动改 `Draggable` + `Inertia`（惯性 + 吸附）；手风琴用 `Flip`；`gsap.matchMedia()` 统一处理 Reduce Motion；`useGSAP` 负责清理。
    代价：现有轨道已是 rAF 写 transform、零重渲染，性能无问题；引入 GSAP 约增加二三十 KB。只在拖动手感确实值得提升时才换。
12. **会员注册（收手机号）**：需 Vercel API 路由 + 托管数据库（Supabase / Neon）。先定是否与 POS 积分打通（决定走「短信验证」还是「接 POS 会员」）。收集手机号需隐私说明（CCPA），发营销短信需单独勾选同意（TCPA）。
