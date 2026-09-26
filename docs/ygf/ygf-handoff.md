# YGF Explore 交接（2026-09-25 收尾）

新会话开场：先读这份 + `ygf-explore-naming.md` + `ygf-next-tasks.md`，不要凭记忆复述项目状态。
**事实来源永远是 `git log` 和 POS 截图，不是记忆档案。**

## 仓库与部署

- `github.com/jy0088/luxtyle-menu` → Vercel 自动部署 → `luxtyle.biz`
- 本地：`E:\Projects\luxtyle-menu`，Windows + PowerShell
- Next.js 16 App Router + Turbopack + TypeScript
- `next-pwa` 已从主 config 解耦（与 Next 16 Turbopack 不兼容）

## 交付流程（Claude Code）

2026-09-26 起改在 Claude Code 里直接改仓库，不再走「下载 → temp → Move-Item」的搬运流程。

1. 直接编辑目标文件
2. `npm run build` 必须通过（push 到 main 即上线）
3. 给 Kevin 看改动摘要，确认后再 `git push`

**commit message 只能单行。** 多行字符串粘进 PowerShell 会触发 `>>` 续行，整段解析失败。
`copy` 对含 `[id]` 的路径会静默失败，用 `Copy-Item -LiteralPath`。
写文件用 `>` 而不是 `Out-File`（UTF-8 双编码问题）；Python 读带 BOM 的文件用 `utf-8-sig`。

## 2026-09-25 已推送

commit `feat(YGF): orbital entry deck + banner accordions for all four sections`

改了两个文件：`src/app/menu/ygf/page.tsx`、`src/app/menu/ygf/picksData.ts`

### 落地页：轨道
四张竖版大牌在压扁的椭圆轨道上：`x = 100·sinθ`，`y = 56·cosθ`，`scale = 0.60 + 0.40d`，
`d = (cosθ+1)/2`。最前靠下最大最亮，最后靠上最小最暗 → 后排从前排上缘露出来，四张同时可见。
- 一圈 20 秒；按住暂停、拖动拨、松开继续；四个指示点点击转到那张并停 2.2 秒
- `prefers-reduced-motion`：**保留轨道排布**，只是不自动转，多出 ‹ › 按钮并在松手时吸附
  （Kevin 的 iPhone 开了 Reduce Motion，之前静态降级导致他看不到环形）
- 组件名 `EntryOrbit`，常量 `ORB_N/ORB_STEP/ORB_RX/ORB_KY/ORB_SPEED` 提到模块级
- rAF + 直接写 DOM transform，零 React 重渲染（只在换头牌时 setState 一次）
- 午餐特惠横幅 `margin-top:auto` 钉在落地页最底
- `.orb-wrap { min-height: calc(100dvh - 190px) }` —— **190 是估值；实机下方有约半屏留白，见 next-tasks A1**
- 过敏源在落地页压成一行半，进内容页恢复完整三行版

### 二三级：同页横幅手风琴
`AccItem` 组件。点开的展开，其余 `scale(.978)` + 降透明度退让；展开后 `scrollIntoView`
配合 `scroll-margin-top:132px`。子内容常驻挂载（收起动画才顺）。

- **Ma-Fans**：店长推荐（默认展开，三级落在饮品）→ 当季活动 → 会员福利 →（新品限时，空则不渲染）
  —— **9/25 晚改决定：改为全部收起，见 next-tasks A3**
- **汤底**：`BROTHS` 五款各一横幅，横幅渐变用该款汤底色，展开是 16:9 图 + 特点/原料/风味/适合配 + 辣度 + 加价 + 查看搭配
- **食材**：NEW / YGF FAVORITES / TRY THIS，卡片点开进详情弹层
- **调料**：照着调（默认展开）→ 认识调料 → 全部调料 → 隐藏配方→频道

饮品小吃卡瘦身：列表只放图/名/一句话/价格/「详情 ›」，完整口味+搭配+已配好参数进弹层。
—— **9/25 晚改决定：饮品卡改文字优先，见 next-tasks A4**
详情弹层统一状态 `sheet: {k:'spot'|'pick'; id}`。

### picksData 新增
`MAFANS_BANNERS`、`ITEM_BANNERS`、`SAUCE_BANNERS`、`SECTION_INTRO`、`BROTH_NOTES`、`Banner`、`BrothNote`

## 待 Kevin 提供内容（有了才能上线）

- **`SAUCE_RECIPES` 三个配方的比例与用料** —— 现为 `[草稿]`，比例是编的，上线前必须替换
- 饮品 d4–d8 的口味/搭配文案；小吃 s3–s6 的口味文案
- `SPOTLIGHTS` 六款食材的「怎么煮」「配什么汤底」
- `BROTH_NOTES` 五款汤底各自可公开的 特点/原料/风味/适合配（现为 `{}`，空着不会出现空壳标题）

## 内容红线

**产品事实绝不能由文案推测而来。** 已修正过的事故：
- Tom Yum 曾写「椰奶」→ 海报实为香茅/青柠/鱼露，已删
- 曾写「熬制超过 8 小时」→ 实际 10+ 小时，已删
- `Grind Pleasant Spicy Dry Mix` 是早前一次会话里 Claude 自己的坏翻译，已印在海报上，已回退为 `Spicy Dry Mix`

带 `[草稿]` 标记的文案一律待店内逐条核对。

## 未做 / 已知问题

- Deals 页、BY/Tomo Share 页未做（BottomNav 仍闪「即将上线」）
- 小福弹窗内容未填；桌卡二维码建议带 `?src=table`
- 有米酸奶 Mira Mesa 单品未加
- YGF 9 张调料图坏图（Kevin 已降优先级）
- 夜市烤香肠(3条) $11.98 无图，与 S14 台式烤香肠 $10.98 同 App 并存（Kevin：这个不用变）
- 会员注册（收手机号）已讨论未立项：需 Vercel API 路由 + 托管数据库；是否与 POS 积分打通未定

## 背景（不要再推翻）

YGF 页面是后发优势，**90% 使用场景是客人已入座等餐**。任务是引流、检索观赏性、让客人进私域群。
这不是菜单 APP，是「顾客站在选菜台旁边时的 YGF Explore / 杨国福探索页」。

WhatsApp **频道是匿名的** —— 没有成员名单、没有 API、无法服务端核验会员身份。
核销只能在柜台按单执行（出示已关注的频道 / 每单限一份 / 仅限堂食）。
优惠只在频道里发，非会员看不到，所以不需要核验；App 里公开 $1.99 是因为
Ma-Fans 是**领取资格**，不是信息门槛。

一级四个名字锁定，不再变动：Ma-Fans · 小福会员 / 汤底 · 一碗的灵魂 Our Broths /
食材 · 今天吃什么 Ingredients / 调料 · 调出你的味道 Sauce Bar。

所有内容必须中英双语 —— Kevin 原话：「原则哦，所有都要有英文。」
