# データベース設計書

決定日: 2026-04-09
使用DB: Supabase Database (PostgreSQL) — 東京リージョン

## テーブル構成の全体像

```
users（ユーザー）
  └── cases（施術事例）
        ├── case_colors（使用カラー情報）
        └── case_treatment_histories（施術履歴）

invitations（招待）
```

## テーブル詳細

### 1. users（ユーザー情報）

Supabase Authが認証を管理。アプリ固有の情報をこのテーブルで保管する。

| カラム名 | 型 | 必須 | 説明 | 例 |
|---|---|---|---|---|
| id | UUID | PK | Supabase Auth のユーザーIDと一致 | — |
| role | TEXT | Yes | 役割 | `poster` / `admin` |
| display_name | TEXT | Yes | 表示名 | 「田中美容師」 |
| salon_name | TEXT | No | サロン名 | 「Hair Salon ABC」 |
| created_at | TIMESTAMPTZ | Yes | 登録日時（自動） | — |

### 2. cases（施術事例 — メインテーブル）

1つの施術事例 = 1行。Before/After情報をまとめて持つ。

| カラム名 | 型 | 必須 | 説明 | 例 |
|---|---|---|---|---|
| id | UUID | PK | 事例ID（自動生成） | — |
| user_id | UUID | FK→users | 投稿者 | — |
| status | TEXT | Yes | 承認ステータス | `draft` / `in_review` / `published` / `rejected` |
| **Before情報** | | | | |
| before_photo_url | TEXT | No | Before写真のストレージURL（未登録時はNULL → 「No Image」表示） | — |
| before_lightness | INTEGER | Yes | 明度レベル（1〜20） | `12` |
| before_hue | TEXT | Yes | 色相（16色から選択） | `purple` |
| before_hue_note | TEXT | No | 色相の補足（自由記述） | 「やや赤みあり」 |
| before_gray_ratio | TEXT | Yes | 白髪率（5段階） | `under10` / `10to20` / `30to50` / `50to70` / `over70` |
| before_note | TEXT | No | 施術前メモ | 「毎日アイロン使用」 |
| **After情報** | | | | |
| after_photo_url | TEXT | Yes | After写真のストレージURL | — |
| contact_time | INTEGER | Yes | 放置時間（分） | `5` |
| after_note | TEXT | No | 施術後メモ | — |
| **管理** | | | | |
| created_at | TIMESTAMPTZ | Yes | 登録日時（自動） | — |
| updated_at | TIMESTAMPTZ | Yes | 更新日時（自動） | — |
| published_at | TIMESTAMPTZ | No | 公開日時（承認時に設定） | — |

#### 承認ステータスの遷移

```
draft（下書き）→ in_review（審査中）→ published（公開）
                                    → rejected（却下）
```

#### 白髪率の選択肢

| 値 | 表示 |
|---|---|
| `under10` | 10%未満 |
| `10to20` | 10〜20% |
| `30to50` | 30〜50% |
| `50to70` | 50〜70% |
| `over70` | 70%以上 |

#### 色相の選択肢（16色グループ、PCCS準拠）

**カラーリング系（11色）:**
| 値 | 日本語名 |
|---|---|
| `yellow` | イエロー |
| `golden` | ゴールデン/ブロンド |
| `khaki` | カーキ |
| `green` | グリーン |
| `ash` | アッシュ |
| `blue` | ブルー |
| `purple` | パープル |
| `pink` | ピンク |
| `red` | レッド |
| `orange` | オレンジ |
| `beige` | ベージュ |

**無彩色・特殊系（5色）:**
| 値 | 日本語名 |
|---|---|
| `white` | ホワイト |
| `silver` | シルバー |
| `grege` | グレージュ |
| `black` | ブラック |
| `brown` | ブラウン |

### 3. case_colors（使用カラー情報）

シャンプー/トリートメントで使用したiropカラーと配合比率を保管。
1つの事例に対して複数行が入る（単色なら1行、ミックスなら色の数だけ行が入る）。

| カラム名 | 型 | 必須 | 説明 | 例 |
|---|---|---|---|---|
| id | UUID | PK | ID（自動生成） | — |
| case_id | UUID | FK→cases | どの事例か | — |
| product_type | TEXT | Yes | 製品タイプ | `shampoo` / `treatment` |
| color | TEXT | Yes | iropカラー名 | `pink` / `lavender` / `ash` / `brown` / `purple` |
| ratio | INTEGER | Yes | 配合比率の数値部分 | `1` |

#### データ例

**トリートメント: ラベンダー+パープル 1:1**

| case_id | product_type | color | ratio |
|---|---|---|---|
| abc-123 | treatment | lavender | 1 |
| abc-123 | treatment | purple | 1 |

**シャンプー: パープル単色**

| case_id | product_type | color | ratio |
|---|---|---|---|
| abc-123 | shampoo | purple | 1 |

**シャンプー未使用の場合:** case_colors に `shampoo` タイプの行が存在しない。

#### iropカラーの選択肢（5色）

| 値 | 日本語名 | ブランドカラー |
|---|---|---|
| `pink` | PINK | #e57893 |
| `lavender` | LAVENDER | #dabfdd |
| `ash` | ASH | #6f89bc |
| `brown` | BROWN | #a87d4c |
| `purple` | PURPLE | #824fa3 |

### 4. case_treatment_histories（施術履歴）

Before（施術前）の施術履歴を保管。1つの事例に対して複数行が入る。

| カラム名 | 型 | 必須 | 説明 | 例 |
|---|---|---|---|---|
| id | UUID | PK | ID（自動生成） | — |
| case_id | UUID | FK→cases | どの事例か | — |
| history_type | TEXT | Yes | 施術タイプ | `relaxer` / `perm` / `bleach` / `color` / `other` |
| note | TEXT | No | 補足（自由記述） | 「インナーのみ」 |

#### データ例

**縮毛矯正（下層のみ）+ カラー歴あり**

| case_id | history_type | note |
|---|---|---|
| abc-123 | relaxer | インナーのみ |
| abc-123 | color | — |

#### 施術タイプの選択肢

| 値 | 日本語名 |
|---|---|
| `relaxer` | 縮毛矯正 |
| `perm` | パーマ |
| `bleach` | ブリーチ |
| `color` | カラー |
| `other` | その他 |

### 5. invitations（招待管理）

| カラム名 | 型 | 必須 | 説明 | 例 |
|---|---|---|---|---|
| id | UUID | PK | ID（自動生成） | — |
| token | TEXT | Yes, Unique | 招待トークン（URL用） | `abc123xyz` |
| invited_by | UUID | FK→users | 招待した管理者 | — |
| used_by | UUID | FK→users | 使用したユーザー（未使用ならnull） | — |
| status | TEXT | Yes | ステータス | `pending` / `used` / `revoked` |
| created_at | TIMESTAMPTZ | Yes | 発行日時（自動） | — |
| expires_at | TIMESTAMPTZ | No | 有効期限 | — |

## 設計判断の記録

| 判断 | 理由 |
|---|---|
| カラー情報を別テーブル（case_colors）に分離 | 「ASHを使った事例」などのフィルター検索を高速に行うため。JSONカラムだと検索が遅くなる |
| 施術履歴も別テーブル（case_treatment_histories）に分離 | 「ブリーチ歴ありの事例」のフィルター検索を高速に行うため |
| Before/Afterは同じテーブル（cases）に | 1事例=1行のシンプルさを保つため。Before/Afterは常にセットで存在する |
| 白髪率は固定の5段階選択肢 | 10%未満 / 10-20% / 30-50% / 50-70% / 70%以上 ※PRD原案(4段階)から変更 |
| ratio を INTEGER にする | 比率は「1:1」「2:1」のような整数比で表現するため |

## Supabase Storage バケット設計

| バケット名 | アクセス | 用途 |
|---|---|---|
| `case-photos-private` | 非公開（RLS制御） | 承認前の写真を保管 |
| `case-photos-public` | 公開 | 承認済みの写真を配信 |

承認時に private → public にファイルを移動（またはURLを切り替え）する。

## インデックス（検索最適化）

以下のカラムにインデックスを作成予定：
- `cases.status` — 公開事例の絞り込み
- `cases.before_lightness` — 明度レベルの範囲検索
- `cases.before_hue` — 色相フィルター
- `cases.before_gray_ratio` — 白髪率フィルター
- `case_colors.color` — iropカラーフィルター
- `case_colors.product_type` — シャンプー/トリートメント区分
- `case_treatment_histories.history_type` — 施術履歴フィルター
