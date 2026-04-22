# OrthoRef — 整形外科専攻医向けリファレンスアプリ

## ファイル構成
```
orthoref/
├── index.html     ← メインアプリ（全機能入り）
├── manifest.json  ← PWAマニフェスト
├── sw.js          ← サービスワーカー（オフライン対応）
└── README.md
```

## iPhoneのホーム画面に追加する手順（無料・App Store不要）

### 方法1: GitHub Pages（推奨・完全無料）
1. GitHubアカウントを作成（無料）
2. 新しいリポジトリを作成（例: `orthoref`）
3. orthoref/内の全ファイルをアップロード
4. Settings → Pages → Source: main branch → Save
5. `https://あなたのユーザー名.github.io/orthoref/` が公開される
6. iPhoneのSafariでそのURLを開く
7. 下の「共有」ボタン → 「ホーム画面に追加」
8. 完了。アプリアイコンとして起動可能

### 方法2: Vercel（より高速・カスタムドメイン対応）
1. vercel.com でアカウント作成
2. New Project → ファイルをドラッグ&ドロップ
3. Deploy ボタンを押すだけ
4. 発行されたURLをSafariで開いてホーム画面に追加

### 方法3: Netlify（Vercelと同等）
1. netlify.com でアカウント作成
2. Sites → Drag & Drop でフォルダをアップロード
3. 即座にURLが発行される

## オフライン動作について
- 一度アクセスしてキャッシュされると、院内の電波が悪い場所でも動作します
- service worker（sw.js）がキャッシュを管理します

## アイコン画像について
- icon-192.png と icon-512.png を追加すると、ホーム画面アイコンが適用されます
- 無料ツール（Canva等）で骨のアイコン画像を作成し、それぞれのサイズで書き出してください
- アイコンなしでもアプリとして動作します

## 今後の追加予定コンテンツ
- Phase 2: AO骨折分類（日本語）
- Phase 3: 周術期管理（抗菌薬・DVT予防）
- Phase 4: 整形外科全域プラットフォーム
