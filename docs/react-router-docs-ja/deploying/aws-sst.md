---
title: AWS での SST を使ったデプロイ
---

# SST を使った AWS へのデプロイ

## 1. セットアップ

- [AWS アカウントの作成](https://signin.aws.amazon.com/signup?request_type=register)
- [AWS 資格情報の構成](https://docs.sst.dev/advanced/iam-credentials#loading-from-a-file)
- [SST CLI のインストール](https://ion.sst.dev/docs/reference/cli)

以下のコマンドを実行して、AWS 資格情報を確認できます。

```shellscript
aws sts get-caller-identity
# {
#     "UserId": "[id]",
#     "Account": "[id]",
#     "Arn": "arn:aws:iam::[id]:user/[iam-user-name]"
# }
```

また、以下のコマンドを実行して、SST CLI がインストールされていることを確認できます。

```shellscript nonumber
which sst
# /usr/local/bin/sst
```

これで準備完了です！

## 2. テンプレートから新しいプロジェクトを作成する

次のコマンドは、`my-sst-app` というディレクトリに新しい SST プロジェクトを作成します。

```shellscript nonumber
npx degit @ryanflorence/templates/sst my-sst-app
```

## 3. アプリをデプロイする

新しいディレクトリに移動して、アプリをデプロイします。最初のデプロイでは、必要なリソースがプロビジョニングされるため、数分かかる場合があります。

```shellscript nonumber
sst deploy
```



