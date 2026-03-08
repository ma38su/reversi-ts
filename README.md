# reversi-ts

TypeScriptで実装されたリバーシ（オセロ）のWebアプリです。AIアルゴリズムによるスコア表示やNPC対戦が可能です。

### デモ

https://ma38su.github.io/reversi-ts/

### 機能

- 人間 vs NPC の対戦
- NPC vs NPC の自動対戦
- 各マスのスコア表示（候補手の評価値を可視化）
- 3種類のAIアルゴリズムを選択可能
  - **Greedy** — 貪欲法（即時評価）
  - **Alpha-Beta** — アルファベータ枝刈り
  - **MCTS** — モンテカルロ木探索

### 遊び方

1. 黒石（先手）としてプレイし、NPCが白石を担当します
2. 「Score」チェックボックスで各マスの評価値を表示できます
3. スコア表示とNPCのアルゴリズムはそれぞれ独立して変更可能です
4. 「NPC」チェックボックスをオフにすると、人間同士の対戦になります

### ローカルで実行

```
npm install
npm start
```

### NPC vs. NPC

```
npx tsx src/match.ts
```
