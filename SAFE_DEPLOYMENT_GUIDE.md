# 安全なデプロイフロー ガイド

## 🛡️ 概要

本番環境への誤った自動デプロイを防ぐため、以下の安全な開発フローを採用しています。

---

## 📊 新しい開発フロー

```
┌─────────────────────────────────────────────────────┐
│ 1. featureブランチで開発                             │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 2. Push → GitHub Actions でテスト実行               │
│    ✅ Frontend CI                                    │
│    ✅ Backend CI                                     │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 3. Pull Request 作成                                │
│    → PR Checks 実行 (すべてのテスト)                 │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 4. レビュー・確認                                    │
│    ✅ コードレビュー                                 │
│    ✅ テスト結果確認                                 │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 5. mainブランチにマージ                              │
│    ⚠️ 自動デプロイはされない                         │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 6. 手動でデプロイトリガー                            │
│    GitHub Actions → Run workflow                    │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 7. 本番環境 (us-east-1) にデプロイ                   │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 日常的な開発フロー

### 1. 新機能の開発を開始

```bash
# mainブランチから最新を取得
git checkout main
git pull origin main

# 新しいfeatureブランチを作成
git checkout -b feature/new-feature
```

### 2. コードを変更してpush

```bash
# 変更をコミット
git add .
git commit -m "Add new feature"

# pushする
git push origin feature/new-feature
```

→ **GitHub Actions が自動的にテスト実行**（デプロイはされない）

### 3. Pull Requestを作成

1. GitHubのリポジトリページを開く
2. **Pull requests** タブをクリック
3. **New pull request** をクリック
4. base: `main` ← compare: `feature/new-feature`
5. **Create pull request** をクリック

→ **PR Checks が自動実行**

### 4. テスト結果を確認

Pull Requestページで以下を確認：

```
✅ Pull Request Checks
   ├─ ✅ test-frontend
   ├─ ✅ test-backend
   ├─ ✅ validate-infrastructure
   └─ ✅ all-checks-passed
```

すべて緑色のチェックマークになればOK！

### 5. レビュー（任意）

- コードレビューを依頼
- 自分で確認

### 6. mainブランチにマージ

**Merge pull request** ボタンをクリック

⚠️ **重要**: この時点では**本番環境にはデプロイされません**

### 7. 本番環境にデプロイ（手動）

準備ができたら、手動でデプロイします：

#### 方法1: GitHub Actionsから実行

1. https://github.com/NIC-Yoshida/AAAAACoordeMe/actions を開く
2. 左サイドバーから **Full Deployment** を選択
3. **Run workflow** ボタンをクリック
4. Environment: **production** を選択
5. **Run workflow** をクリック

#### 方法2: Infrastructure Deployだけ実行

インフラだけ更新したい場合：

1. https://github.com/NIC-Yoshida/AAAAACoordeMe/actions を開く
2. 左サイドバーから **Infrastructure Deploy** を選択
3. **Run workflow** ボタンをクリック

---

## 🔒 ブランチ保護ルールの設定（オプションだが推奨）

mainブランチへの直接pushを防ぎ、必ずPull Requestを経由させる設定：

### 設定手順

1. リポジトリの **Settings** → **Branches** を開く

2. **Branch protection rules** セクションで **Add rule** をクリック

3. 以下を設定：

```
Branch name pattern: main

☑ Require a pull request before merging
  ☑ Require approvals: 1 (自分1人の場合は不要)
  
☑ Require status checks to pass before merging
  ☑ Require branches to be up to date before merging
  Status checks that are required:
    - test-frontend
    - test-backend
    - validate-infrastructure

☐ Require conversation resolution before merging (任意)

☐ Include administrators (自分も制限する場合)
```

4. **Create** をクリック

これで、mainブランチへの直接pushができなくなり、必ずPull Requestを経由する必要があります。

---

## 📋 ワークフロー一覧

| ワークフロー | トリガー | デプロイ | 用途 |
|------------|---------|---------|------|
| **Frontend CI** | push (すべてのブランチ) | ❌ なし | フロントエンドのテスト |
| **Backend CI** | push (すべてのブランチ) | ❌ なし | バックエンドのテスト |
| **Pull Request Checks** | Pull Request作成時 | ❌ なし | すべてのテスト+検証 |
| **Infrastructure Deploy** | **手動のみ** | ✅ あり | インフラのみデプロイ |
| **Full Deployment** | **手動のみ** | ✅ あり | すべてをデプロイ |

---

## 🎯 メリット

### 安全性
- ✅ 誤った自動デプロイを防止
- ✅ デプロイ前に確認できる
- ✅ テストが失敗したコードはマージできない

### 品質
- ✅ Pull Requestでコードレビュー
- ✅ すべてのテストが自動実行
- ✅ インフラの構文チェック

### 柔軟性
- ✅ 好きなタイミングでデプロイ
- ✅ 複数のコミットをまとめてデプロイ
- ✅ 緊急時はすぐにデプロイ可能

---

## 🔄 ロールバック（問題が発生した場合）

### 方法1: 前のコミットに戻す

```bash
# 前のコミットに戻る
git revert HEAD

# pushする
git push origin main

# 手動でデプロイ
```

### 方法2: 直接前のバージョンをデプロイ

1. GitHub Actions → Full Deployment
2. Run workflow
3. 以前のコミットを選択してデプロイ

---

## 📊 推奨するリリースサイクル

### パターン1: 慎重派

```
1週間開発 → PR作成 → レビュー → マージ
             ↓ 週末または月曜日
         手動デプロイ
```

### パターン2: アジャイル派

```
機能完成 → PR → マージ → すぐにデプロイ
(ただし本番稼働時間を避ける)
```

### パターン3: 計画派

```
複数機能を開発 → すべてマージ
              ↓ リリース日
          まとめてデプロイ
```

---

## ✅ チェックリスト

デプロイ前に確認：

- [ ] すべてのテストが成功している
- [ ] ローカルで動作確認済み
- [ ] Pull Requestがマージ済み
- [ ] デプロイ内容を理解している
- [ ] 問題発生時のロールバック方法を把握している
- [ ] 本番稼働時間外（または影響が少ない時間）

---

## 🆘 トラブルシューティング

### 問題: Pull Requestを作成したのにテストが実行されない

**原因**: PR Checks ワークフローが動作していない

**解決**: 
```bash
git add .github/workflows/pr-check.yml
git commit -m "Add PR checks workflow"
git push origin main
```

### 問題: mainブランチに直接pushしてしまった

**解決**: 
1. 慌てない（自動デプロイされない）
2. 問題があればrevertする
3. ブランチ保護ルールを設定

---

## 📚 参考資料

- GitHub Pull Requests: https://docs.github.com/en/pull-requests
- Branch Protection: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches
- GitHub Actions Manual Triggers: https://docs.github.com/en/actions/using-workflows/manually-running-a-workflow

---

このガイドに従うことで、安全かつ確実なデプロイが可能になります！🛡️🚀
