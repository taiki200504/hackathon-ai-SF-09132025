# Meme Agent

「Zero-Click Meme Agent」は、画像をアップロードするだけで自動的にミーム画像を生成し、GIFアニメーションとして保存・共有できるウェブアプリケーションです。

## 機能

- 画像のドラッグ＆ドロップアップロード
- 5つのミームキャプション候補の表示（現在はモック、後にCoreSpeed統合予定）
- アニメーションGIFミームの生成（Impactフォント、アウトライン付き、上下テキスト配置）
- 簡単なズーム/タイピング/シェイクエフェクト（8フレーム）
- GIFのダウンロードとDiscord Webhookを通じた共有
- 共有回数のトラッキングとUI上での表示

## 技術スタック

- Next.js 14（App Router）
- TypeScript
- TailwindCSS
- gif.js（ブラウザ側でのGIF生成）

## 実行方法

### 環境変数の設定

プロジェクトのルートディレクトリに `.env.local` ファイルを作成し、以下の環境変数を設定してください：

```
DISCORD_WEBHOOK_URL=your_discord_webhook_url
CORESPEED_URL=your_corespeed_url
ZYPHER_PIPELINE_ID=your_zypher_pipeline_id
```

- `DISCORD_WEBHOOK_URL`: Discord共有機能を使用するために必要です
- `CORESPEED_URL` と `ZYPHER_PIPELINE_ID`: CoreSpeed統合のために将来的に使用予定（現在はモック実装）

### 開発サーバーの起動

```bash
npm install   # 依存関係のインストール
npm run dev   # 開発サーバーの起動
```

ブラウザで http://localhost:3000 を開くと、自動的に `/upload` ページにリダイレクトされます。

## API エンドポイント

- `/api/analyze`: 画像分析（現在はモック）
- `/api/caption`: キャプション生成（現在はモック、後にCoreSpeed統合予定）
- `/api/share`: Discord Webhookを通じたGIF共有
- `/api/stats`: 共有回数の統計取得

## 注意事項

- 現在のバージョンでは、キャプション生成はモックデータを使用しています
- Discord共有機能を使用するには、有効なWebhook URLが必要です
- 将来的にCoreSpeed APIとの統合を予定しています
