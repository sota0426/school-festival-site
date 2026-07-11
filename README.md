# 鶴東祭 2026 公式サイト

文化祭来場者向けの校内マップ、模擬店一覧、タイムテーブル、アクセス・企画情報を提供するReact/Vite製サイトです。

## ローカル起動

```bash
npm install
npm run dev
```

## 確認

```bash
npm run lint
npm run build
```

## GitHub Pagesへの公開

`main`ブランチへpushすると、`.github/workflows/deploy-pages.yml` が自動的にビルドと公開を行います。

初回のみGitHubリポジトリで次を設定してください。

1. `Settings`を開く
2. `Pages`を開く
3. `Build and deployment`の`Source`を`GitHub Actions`に変更
4. `main`へpushするか、`Actions`の`Deploy to GitHub Pages`から手動実行

公開URL:

```text
https://sota0426.github.io/school-festival-site/
```

リポジトリ名を変更した場合は、`vite.config.js`の`/school-festival-site/`も新しいリポジトリ名へ変更してください。

## Instagram設定

公式InstagramのURLは `src/config.js` の `instagramUrl` で設定します。
