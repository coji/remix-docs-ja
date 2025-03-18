---
title: createCookieSessionStorage
---

# createCookieSessionStorage

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.createCookieSessionStorage.html)

セッションデータをすべてセッションクッキー自体に直接保存する SessionStorage オブジェクトを作成して返します。

これには、データベースやその他のバックエンドサービスが不要になるという利点があり、一部のロードバランシングシナリオを簡素化するのに役立ちます。ただし、シリアル化されたセッションデータがブラウザの最大クッキーサイズを超えてはならないという制限もあります。トレードオフです！

