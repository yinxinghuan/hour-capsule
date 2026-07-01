# Requirements

## 1. Overview

Hour Capsule 是一个 `casual` 类型的移动端小游戏：每小时收一个时间胶囊。AI 根据当前世界、当前小时、你和其他玩家最近抽到的东西，决定下一个该被装进真空袋的物品 — 第一原则是多元（同一小时永不重复）。每袋自动烧上 MFG 生产时间戳、左下 α 角标、右下你的用户名和编号，呈现产品摄影质感的真空塑料袋。Field 是公共陈列墙、Capsule 是你自己的藏品。AlterU After Dark 系列。

## 2. Visual Design

- 整体布局：页面占用 100vw x 100vh，主体验居中，HUD 与操作区覆盖在游戏层上方，移动端以单手操作为优先。
- 背景与配色：主要颜色使用 #fff、#2A0612、#999、#000、#888、#555、#5a7a98、#444；高亮元素用于可点击目标、得分、结果或稀有状态。
- 字体：使用 "Iowan Old Style", "Georgia", "Source Han Serif SC", "Songti SC", serif、ui-monospace, SFMono-Regular, Menlo, monospace、'Inter', system-ui, -apple-system, sans-serif、'Cormorant Garamond', serif，按钮与状态文字保持 12-24 px 的可读范围。
- 动画：常规按钮/卡片反馈控制在 120-240 ms；结果、命中、生成或翻牌反馈控制在 300-900 ms。
- 视觉元素：主对象保持在屏幕中心 40%-65% 视觉区域内；顶部/底部 HUD 保留至少 12 px 安全边距；可滚动墙或列表卡片使用固定间距，避免文本挤压。
- 美术素材清单：
- typo-after-bottom.png：位图图片，用于角色、场景、封面、反馈或品牌视觉。
- typo-hero-bottom.png：位图图片，用于角色、场景、封面、反馈或品牌视觉。
- poster.png：位图图片，用于角色、场景、封面、反馈或品牌视觉。
- v5_vs_v6-screenshot.png：位图图片，用于角色、场景、封面、反馈或品牌视觉。
- typo-hero.png：位图图片，用于角色、场景、封面、反馈或品牌视觉。
- variants-screenshot.png：位图图片，用于角色、场景、封面、反馈或品牌视觉。
- capsules-screenshot.png：位图图片，用于角色、场景、封面、反馈或品牌视觉。
- v5-screenshot.png：位图图片，用于角色、场景、封面、反馈或品牌视觉。
- typo-after.png：位图图片，用于角色、场景、封面、反馈或品牌视觉。
- sealdetail-anchor.png：位图图片，用于角色、场景、封面、反馈或品牌视觉。
- 0_A_real_v3.jpg：位图图片，用于角色、场景、封面、反馈或品牌视觉。
- 2_D_empty.jpg：位图图片，用于角色、场景、封面、反馈或品牌视觉。

## 3. Game Mechanics

- 初始化参数：
- `MAX_LEN`：140
- `MAX_STORED`：30
- `STREAK_GRACE_MS`：60
- `COLLECT_COOLDOWN_MS`：60
- `CACHE_TTL_MS`：15
- `PER_FETCH_TIMEOUT_MS`：2000
- `SCROLL_FRESH_MS`：5
- `TICKER_INTERVAL_MS`：2200
- `COUNTDOWN_START_S`：30
- `MAX_DISPLAY`：60
- `T11`：06
- 更新循环：使用 requestAnimationFrame 驱动逐帧更新，目标刷新频率 60 FPS。 使用定时器推进倒计时、生成节奏或阶段切换。
- 核心机制：玩家完成主操作后更新分数、阶段、生成结果或收藏状态；反馈必须在 200 ms 内出现。
- 碰撞 / 命中：若存在运动目标，使用目标边界、距离或格子索引判断；命中后更新得分/连击，失误后扣除生命、时间或进入失败状态。
- 特殊机制：包含公共墙/画廊/归档浏览，玩家可以查看他人结果。 包含 AI 生成或视觉识别结果作为核心 payoff。
- 粒子 / 特效：命中、完成、生成、失败等关键事件使用上浮文字、闪光、缩放、抖动或淡出效果，单次特效 300-900 ms。

## 4. Controls

- Pointer：按下主操作区立即触发核心动作，单次 pointerdown 只计算 1 次。
- Click：用于按钮、卡片、结果项和可滚动列表里的选择确认。
- Keyboard：键盘事件用于桌面调试或方向/确认操作。
- Drag / Move：记录指针坐标变化，用于拖拽、瞄准、绘制或移动角色。

## 5. Win / Lose Conditions

- 达成目标后进入胜利/完成状态。
- 生命值/血量归零触发失败。
- 倒计时结束触发结算。
- 结算界面展示最终结果、历史最好或收藏结果，并提供再来一次、返回首页或继续浏览入口。

## 6. Sound Effects

- 主操作成功：合成短促提示音，正弦/三角波，约 440-880 Hz，80-160 ms。
- 失败或结束：低频下行提示，约 180-320 Hz，180-320 ms。
- 连击或奖励：上行音阶，约 660-1200 Hz，60-140 ms。
