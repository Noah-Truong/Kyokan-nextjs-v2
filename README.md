# ラクユーZ工法協会 — 公式ウェブサイト

Next.js 14 + Tailwind CSS + Framer Motion で構築した公式コーポレートサイト。  
CMS バックエンドとして WordPress.com (Business) を REST API 経由で接続しています。

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| 3D Viewer | Google `<model-viewer>` (GLB/GLTF) |
| CMS | WordPress.com Business — REST API |
| Hosting (Front) | Vercel (推奨) |
| Hosting (CMS) | WordPress.com (managed) |

---

## セットアップ

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run start
```

### 環境変数

`.env.local` を作成し、WordPress サイトの URL を設定してください。

```env
# WordPress サイトの URL（末尾スラッシュなし、https:// 必須）
NEXT_PUBLIC_WP_API_URL=https://your-site.wpcomstaging.com
```

> この変数が設定されていない場合、またはプレースホルダーのままの場合、  
> ニュースパネルと資料ダウンロードはモックデータで表示されます。

---

## ページ一覧

| パス | ページ | CMS 連携 |
|---|---|---|
| `/` | ホーム（ニュースティッカー付き） | ✅ WordPress posts |
| `/construction` | 工法について | — |
| `/specification` | 6つの特徴 | — |
| `/process` | 施工手順 | — |
| `/works` | 施工事例（フィルター・ライトボックス） | — |
| `/machine` | 主な使用機器（3D モデルビューア） | — |
| `/downloads` | 資料ダウンロード | ✅ WordPress CPT `document` + ACF |
| `/news` | お知らせ・新着情報 | ✅ WordPress posts |
| `/about` | 協会について | — |
| `/contact` | お問い合わせフォーム | — |

---

## ディレクトリ構成

```
src/
├── app/
│   ├── layout.tsx              # ルートレイアウト・メタデータ・構造化データ
│   ├── page.tsx                # ホームページ
│   ├── construction/page.tsx   # 工法について
│   ├── specification/page.tsx  # 6つの特徴
│   ├── process/page.tsx        # 施工手順
│   ├── works/page.tsx          # 施工事例
│   ├── machine/page.tsx        # 主な使用機器
│   ├── downloads/page.tsx      # 資料ダウンロード（WordPress CPT）
│   ├── news/page.tsx           # ニュース（WordPress posts）
│   ├── about/page.tsx          # 協会について
│   └── contact/page.tsx        # お問い合わせ
├── components/
│   ├── ui/
│   │   ├── Button.tsx          # Button, SectionHeader, Badge
│   │   ├── ModelViewer.tsx     # <model-viewer> ラッパー（GLB/GLTF）
│   │   ├── NewsTicker.tsx      # ホームのニュース一覧（モーダル付き）
│   │   └── WpNewsPanel.tsx     # WordPress ニュースパネル（未使用・予備）
│   ├── layout/
│   │   ├── Header.tsx          # 固定ヘッダー・モバイルメニュー
│   │   └── Footer.tsx
│   └── sections/               # ホームページのセクションコンポーネント
│       ├── HeroSection.tsx
│       ├── ServicesSection.tsx
│       ├── RakuyuzSection.tsx
│       ├── AboutSection.tsx
│       └── CTASection.tsx
├── lib/
│   ├── animations.ts           # Framer Motion variants
│   ├── wordpress.ts            # WordPress REST API ヘルパー・型定義・モックデータ
│   └── utils.ts                # ユーティリティ関数・全静的コンテンツデータ
├── hooks/
│   └── useAnimations.ts        # useHeaderScroll, useCountUp カスタムフック
└── styles/
    └── globals.css             # Tailwind ディレクティブ・カスタムクラス
```

---

## WordPress 連携

### ニュース（標準 posts）

WordPress の通常投稿を使用。カテゴリースラッグは以下の3つを使用します。

| スラッグ | 表示ラベル |
|---|---|
| `info` | お知らせ |
| `download` | 資料追加 |
| `award` | 受賞報告 |

### 資料ダウンロード（カスタム投稿タイプ + ACF）

カスタム投稿タイプ `document` に ACF フィールドグループを紐付けます。  
フィールドグループの「Show in REST API」を **Yes** に設定してください。

| ACF フィールド名 | フィールドタイプ | 内容 |
|---|---|---|
| `document_category` | Select | `catalog` / `technical-spec` / `construction-manual` / `design-reference` |
| `file_url` | File（Return: File URL） | ダウンロードファイル URL |
| `file_size` | Text | 例: `8.4 MB` |
| `short_description` | Textarea | カードに表示する説明文 |

### API エンドポイント

```
GET /wp-json/wp/v2/posts          # ニュース投稿
GET /wp-json/wp/v2/categories     # カテゴリー一覧
GET /wp-json/wp/v2/document       # 資料ダウンロード CPT
```

---

## 3D モデルビューア

`public/models/` に GLB ファイルを配置し、`machine/page.tsx` の `pumpSpecs` 配列で  
`modelPath` を指定します。Google `<model-viewer>` を使用（CDN 経由で読み込み）。

```
public/
└── models/
    ├── pump-orange.glb         # 2インチポンプ
    ├── pump-unit.glb           # 4インチポンプ
    ├── industrial-pump.glb     # 6インチポンプ
    └── gas-cylinder-3d-model.glb  # 通水ポンプ
```

**推奨スペック**: ファイルサイズ 5MB 以下、テクスチャ 2048×2048 以下

---

## 静的コンテンツの更新

ニュース・資料以外のすべてのコンテンツ（施工事例・機器仕様・施工手順など）は  
`src/lib/utils.ts` に定数として定義されています。  
WordPress 接続は不要で、直接編集してください。

| 定数名 | 用途 |
|---|---|
| `companyInfo` | 会社名・住所・電話・メール |
| `navigationItems` | ヘッダーナビゲーション |
| `sixFeatures` | 6つの特徴ページのコンテンツ |
| `processSteps` | 施工手順のステップ |
| `caseStudies` | 施工事例（19件） |
| `pumpSpecs` | 特殊ポンプ仕様 |
| `waterFlowPlugSpecs` | 通水プラグ仕様 |
| `stopperSpecs` | ストッパー仕様 |
| `businessActivities` | 協会の事業内容 |
