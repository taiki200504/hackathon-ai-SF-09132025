# hackathon-ai-SF-09132025

## プロジェクト概要

AIハッカソン（サンフランシスコ、2025年9月13日）のためのプロジェクトリポジトリです。

## 技術スタック

### フロントエンド
- React.js
- TypeScript
- Vite

### バックエンド
- Node.js
- Express.js
- TypeScript
- MongoDB (Mongoose)

## 開発環境のセットアップ

### 前提条件
- Node.js (v18以上)
- npm (v8以上)
- Git

### インストール手順

1. リポジトリをクローンする
```bash
git clone https://github.com/taiki200504/hackathon-ai-SF-09132025.git
cd hackathon-ai-SF-09132025
```

2. フロントエンドの依存関係をインストールする
```bash
cd src/frontend
npm install
```

3. バックエンドの依存関係をインストールする
```bash
cd ../backend
npm install
```

4. 環境変数を設定する
```bash
cp .env.example .env
# .envファイルを編集して必要な環境変数を設定する
```

### 開発サーバーの起動

1. バックエンドサーバーを起動する
```bash
cd src/backend
npm run dev
```

2. フロントエンドサーバーを起動する（別のターミナルで）
```bash
cd src/frontend
npm run dev
```

## ビルドと本番環境へのデプロイ

1. フロントエンドをビルドする
```bash
cd src/frontend
npm run build
```

2. バックエンドをビルドする
```bash
cd src/backend
npm run build
```

## ライセンス

MIT