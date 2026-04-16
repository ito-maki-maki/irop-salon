# 技術スタック決定書

初版: 2026-04-09
改訂: 2026-04-10（静的HTML方式に変更）

## 選定結果

| 項目 | 選定技術 | 備考 |
|---|---|---|
| 構成 | 静的HTML + CSS | ビルドツール不要。ブラウザで直接開ける |
| スタイリング | CSS（Custom Properties） | ブランドカラーをCSS変数で管理 |
| フォント | Google Fonts | Comfortaa（英字見出し）、Zen Kaku Gothic New（和文・本文） |
| データベース | 未定 | 画面構築を優先し、後日決定 |
| 画像ストレージ | 未定 | 同上 |
| 認証 | 未定 | 同上 |
| ホスティング | 未定 | 静的ファイルのため選択肢は広い |

## 変更経緯

### 初版（2026-04-09）: Next.js + Supabase + Vercel
当初はNext.js（フレームワーク）、Supabase（DB・認証・画像）、Vercel（ホスティング）で構成を計画。

### 改訂（2026-04-10）: 静的HTML方式
プロジェクト全体を静的HTMLファイルで構築する方針に変更。理由：

- まず画面（見た目）を作ることを優先する
- ビルドやサーバー起動なしに、HTMLファイルをブラウザで開くだけで確認できる
- データベースやホスティングの判断は画面ができてから行う

## 現在の構成

```
Salondb/
├── index.html          ← トップページ
├── css/
│   └── style.css       ← ブランドデザイントークン + 基本レイアウト
├── design/
│   └── irop_logo.png   ← ロゴ画像
├── images/             ← 施術事例の写真
└── docs/               ← プロジェクトドキュメント
```

## スタイリング方針

### ブランドカラー（CSS Custom Properties）

| 変数名 | HEX | 用途 |
|---|---|---|
| `--color-purple` | #824fa3 | tasu PURPLE |
| `--color-lavender` | #dabfdd | tasu LAVENDER |
| `--color-pink` | #e57893 | tasu PINK |
| `--color-ash` | #6f89bc | tasu ASH |
| `--color-brown` | #a87d4c | tasu BROWN |

### フォント

| 用途 | フォント | 提供元 |
|---|---|---|
| 英字見出し・ロゴ的表示 | Comfortaa | Google Fonts |
| 和文・本文・可読性重視 | Zen Kaku Gothic New | Google Fonts |

※ Typo Round（ブランド指定フォント）はライセンス未確認のため、Comfortaaで代用中

### レスポンシブ対応

- モバイルファースト設計
- ブレークポイント: 600px（タブレット）、900px（デスクトップ）

## セキュリティ方針

静的HTML段階では特別な対策は不要。DB・認証を導入する際に改めて検討する。

## 将来の検討事項

- データベースの選定（Supabase / その他）
- 画像ストレージの選定
- 認証方式の決定
- ホスティング先の決定（Vercel / Netlify / Xserver / その他）
- salon.irop.jp のDNS設定
