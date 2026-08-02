# 模擬店スプレッドシートAPI

サイトはGoogle Apps ScriptのWebアプリを経由して「模擬店データ」シートを読み書きする。

## シート列

`ID / 店名 / クラス・団体 / メニュー / 価格 / カテゴリ / ジャンル / 説明文 / 画像ＵＲＬ / 配置マップ / 場所名 / X座標 / Y座標 / 更新日時`

カテゴリ、ジャンル、配置マップは日本語で保存する。画像ＵＲＬには、一般公開したGoogle Drive画像の閲覧URLを入力できる。

## 導入

1. 対象スプレッドシートを開く。
2. `拡張機能` → `Apps Script`を開く。
3. `Code.gs`をこのフォルダの内容へ置き換える。
4. Apps Scriptの`プロジェクトの設定` → `スクリプト プロパティ`を開く。
5. `STALLS_WRITE_TOKEN`へ十分に長い任意文字列を設定する。
6. 必要なら`STALLS_SPREADSHEET_ID`へ対象スプレッドシートIDを設定する。未設定時はコード内の既定IDを使う。
7. スプレッドシートを再読み込みし、`文化祭サイト管理` → `模擬店シートを初期設定`を実行する。
8. Apps Scriptの`デプロイ` → `新しいデプロイ` → `ウェブアプリ`を選ぶ。
9. 実行ユーザーを自分、アクセスできるユーザーを全員にしてデプロイする。
10. 発行された`/exec` URLをサイトの`VITE_STALLS_GAS_URL`へ設定する。

## スクリプトプロパティの設定例

Apps Scriptの`プロジェクトの設定` → `スクリプト プロパティ` → `スクリプト プロパティを追加`から、次の2件を登録する。

| プロパティ | 値の例 |
|---|---|
| `STALLS_WRITE_TOKEN` | `tsuruto-festival-2026-admin-X7p9K2m4Q8v6` |
| `STALLS_SPREADSHEET_ID` | `1PJ7D12GpgpU-nofwlrBiCWimxmaw5-4JE8AED-bIiMs` |

`STALLS_WRITE_TOKEN`の例は説明用なので、そのまま使用せず、英大文字・英小文字・数字・記号を混ぜた32文字以上の別の文字列を設定する。

例:

```text
STALLS_WRITE_TOKEN
Tsuruto2026_MapAdmin_8xQ4-nP7_Km92Vz5
```

スプレッドシートURLが次の場合:

```text
https://docs.google.com/spreadsheets/d/1PJ7D12GpgpU-nofwlrBiCWimxmaw5-4JE8AED-bIiMs/edit#gid=0
```

`/d/`と`/edit`の間がスプレッドシートIDになる。

```text
1PJ7D12GpgpU-nofwlrBiCWimxmaw5-4JE8AED-bIiMs
```

現在のスプレッドシートを使用する場合、`STALLS_SPREADSHEET_ID`は上記の値でよい。`Code.gs`にも同じIDが既定値として入っているため、このプロパティだけは省略できる。

## サイト設定

プロジェクト直下に`.env.local`を作成する。

```env
VITE_STALLS_GAS_URL=https://script.google.com/macros/s/デプロイID/exec
VITE_STALLS_WRITE_TOKEN=Apps Scriptに設定したものと同じ文字列
```

具体例:

```env
VITE_STALLS_GAS_URL=https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/exec
VITE_STALLS_WRITE_TOKEN=Tsuruto2026_MapAdmin_8xQ4-nP7_Km92Vz5
```

Apps Script側の`STALLS_WRITE_TOKEN`と、サイト側の`VITE_STALLS_WRITE_TOKEN`は一字一句同じにする。前後に空白を入れない。

設定後に開発サーバーを再起動する。本番のGitHub Pagesでは、リポジトリの`Settings` → `Secrets and variables` → `Actions`で次を設定する。

- Variables: `STALLS_GAS_URL`
- Secrets: `STALLS_WRITE_TOKEN`

## 動作

- サイト起動時: Webアプリの`GET`から全模擬店を取得する。
- DEV保存時: Webアプリの`POST`で全模擬店をシートへ保存する。
- 通信失敗時: 同梱データまたは最後にブラウザへ保存されたデータを表示する。
- GET結果: Apps Script側で最大60秒キャッシュする。DEV保存時にはキャッシュを削除する。

## 注意

- Drive画像は「リンクを知っている全員が閲覧可」にする。
- `VITE_`環境変数はブラウザから確認できるため、書き込みトークンは強固な認証ではない。一般公開期間中に管理機能を厳密に保護する場合は、Googleログインなどの認証を追加する。
