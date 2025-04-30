# Remix & React Router 日本語ドキュメント + 翻訳管理ツール

このリポジトリは、[Remix](https://remix.run/) と [React Router](https://reactrouter.com/) の日本語版ドキュメントサイト、およびその翻訳作業を支援するための管理ツールを含むモノレポです。

**ドキュメントサイト:**

* **Remix 日本語ドキュメント:** [https://remix-docs-ja.techtalk.jp](https://remix-docs-ja.techtalk.jp)
* **React Router 日本語ドキュメント:** [https://react-router-docs-ja.techtalk.jp](https://react-router-docs-ja.techtalk.jp)

## ✨ 特徴

* **最新ドキュメントの日本語訳:** Remix と React Router の公式ドキュメントを日本語で提供。
* **翻訳管理ツール:** Markdown ファイルの翻訳状況管理、Gemini API を利用した翻訳支援機能などを備えた管理アプリケーション (`apps/admin`)。
* **モノレポ構成:** [pnpm Workspaces](https://pnpm.io/workspaces) と [Turborepo](https://turbo.build/repo) を使用して効率的に管理。
* **高速な開発体験:** [Vite](https://vitejs.dev/) による高速なビルドと HMR。
* **モダンな技術スタック:** React, TypeScript, Remix/React Router, Tailwind CSS, shadcn/ui, Prisma, Pagefind など。
* **Cloudflare へのデプロイ:** ドキュメントサイトは Cloudflare Workers/Pages に最適化。

## 📁 プロジェクト構成

```plaintext
.
├── apps
│   ├── admin          # 翻訳管理用 Remix アプリケーション (Vite + Prisma + Gemini API)
│   ├── react-router   # React Router 日本語ドキュメントサイト (React Router + Vite + Pagefind)
│   └── remix          # Remix 日本語ドキュメントサイト (React Router + Vite + Pagefind)
├── docs               # オリジナルの Markdown ドキュメント (翻訳元)
├── packages
│   └── scripts        # ビルドスクリプト (メニュー生成、検索インデックス生成など)
├── patches            # 依存パッケージへのパッチ
├── .gitignore         # Git 無視ファイル
├── .npmrc             # npm 設定
├── biome.json         # Biome (Linter/Formatter) 設定
├── LICENSE            # ライセンス
├── package.json       # ルートパッケージ設定
├── pnpm-lock.yaml     # pnpm ロックファイル
├── pnpm-workspace.yaml # pnpm Workspaces 設定
├── README.md          # このファイル
└── turbo.json         # Turborepo 設定
```

## 🚀 開発

### 前提条件

* Node.js (v18 以降推奨)
* pnpm (v8 以降推奨)

### セットアップ

1. **リポジトリのクローン:**

    ```bash
    git clone https://github.com/coji/remix-docs-ja.git
    cd remix-docs-ja
    ```

2. **依存関係のインストール:**

    ```bash
    pnpm install
    ```

3. **Admin アプリ用データベースのセットアップ:**

    ```bash
    pnpm --filter admin prisma migrate dev
    ```

    *(必要に応じて `pnpm --filter admin prisma db seed` を実行)*

4. **Admin アプリ用環境変数の設定:**
    `apps/admin` ディレクトリに `.env` ファイルを作成し、以下のように設定します。

    ```dotenv
    # apps/admin/.env
    DATABASE_URL="file:./prisma/dev.db"
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
    ```

### 開発サーバーの起動

リポジトリのルートで以下を実行します。

```bash
pnpm dev
```

これにより、Turborepo が関連するアプリケーションとパッケージをビルドし、開発サーバーを起動します。

* **Admin:** `http://localhost:5170` (デフォルト)
* **React Router Docs:** `http://localhost:5175` (デフォルト)
* **Remix Docs:** (vite.config.ts を参照)

特定のアプリのみ起動する場合:

```bash
pnpm --filter admin dev
# または
pnpm --filter react-router dev
# または
pnpm --filter remix dev
```

## 🛠️ ビルド

プロジェクト全体を本番用にビルドします。

```bash
pnpm build
```

ビルド成果物は各 `apps/*` ディレクトリ内の `build/` (Admin) または `build/client/` (ドキュメントサイト) に出力されます。

## ☁️ デプロイ

### ドキュメントサイト (React Router / Remix)

これらのアプリは Cloudflare Pages/Workers へのデプロイが想定されています。各アプリ内の `wrangler.toml` を参照してください。

```bash
# 例: React Router サイトのデプロイ (適切な npm script がある場合)
pnpm --filter react-router deploy
```

### Admin アプリケーション

Node.js 環境が必要です。

1. `pnpm build` を実行。
2. `apps/admin/build/`, `apps/admin/node_modules/`, `apps/admin/package.json`, `apps/admin/prisma/` (DBファイル含む), `.env` をサーバーにデプロイ。
3. サーバーで `pnpm start` (または `node build/server/index.js`) を実行。

## 🤝 貢献

貢献を歓迎します！ Issue の報告や Pull Request は GitHub リポジトリにお願いします。

## 📜 ライセンス

[MIT License](./LICENSE)
