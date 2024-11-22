---
title: 競合状態
---

# 競合状態

アプリケーション内のあらゆる競合状態を排除することは不可能ですが、React Routerはウェブユーザーインターフェースで発生する最も一般的な競合状態を自動的に処理します。


## ブラウザの動作

React Routerのネットワーク同時実行処理は、ドキュメントを処理する際のウェブブラウザの動作から大きく影響を受けています。

新しいドキュメントへのリンクをクリックし、新しいページの読み込みが完了する前に別のリンクをクリックすることを考えてみましょう。ブラウザは次の動作をします。

1. 最初の要求をキャンセルする
2. 新しいナビゲーションをすぐに処理する

同じ動作はフォーム送信にも適用されます。保留中のフォーム送信が新しい送信によって中断されると、最初の送信はキャンセルされ、新しい送信がすぐに処理されます。


## React Routerの動作

ブラウザと同様に、リンクとフォーム送信による中断されたナビゲーションは、進行中のデータ要求をキャンセルし、新しいイベントをすぐに処理します。

フェッチャは、ナビゲーションのようなシングルトンイベントではないため、少し微妙に異なります。フェッチャは他のフェッチャインスタンスを中断できませんが、自分自身を中断できます。動作は他のものと同じです。中断された要求をキャンセルし、新しい要求をすぐに処理します。

ただし、フェッチャは再検証に関して相互作用します。フェッチャのアクション要求がブラウザに戻った後、すべてのページデータの再検証が送信されます。これは、複数の再検証要求が同時に進行中になる可能性があることを意味します。React Routerはすべての「新しい」再検証レスポンスをコミットし、古い要求をキャンセルします。古い要求とは、_それより前に_開始された要求です。

このネットワークの管理により、ネットワーク競合状態によって発生する最も一般的なUIのバグを防ぎます。


ネットワークは予測不可能であり、サーバーはこれらのキャンセルされた要求を処理し続けるため、バックエンドでは依然として競合状態が発生し、データ整合性の問題が発生する可能性があります。これらのリスクは、プレーンHTMLの`<forms>`でデフォルトのブラウザ動作を使用する場合と同じリスクであり、低いと見なされ、React Routerの範囲外です。


## 実用的な利点

タイプヘッドコンボボックスを作成することを考えてみましょう。ユーザーが入力するたびに、サーバーに要求を送信します。新しい文字を入力するたびに、新しい要求を送信します。テキストフィールドにない値の結果をユーザーに表示しないことが重要です。

フェッチャを使用すると、これは自動的に管理されます。次の疑似コードを考えてみてください。

```tsx
// route("/city-search", "./search-cities.ts")
export async function loader({ request }) {
  const { searchParams } = new URL(request.url);
  return searchCities(searchParams.get("q"));
}
```

```tsx
export function CitySearchCombobox() {
  const fetcher = useFetcher();

  return (
    <fetcher.Form action="/city-search">
      <Combobox aria-label="Cities">
        <ComboboxInput
          name="q"
          onChange={(event) =>
            // submit the form onChange to get the list of cities
            fetcher.submit(event.target.form)
          }
        />

        {fetcher.data ? (
          <ComboboxPopover className="shadow-popup">
            {fetcher.data.length > 0 ? (
              <ComboboxList>
                {fetcher.data.map((city) => (
                  <ComboboxOption
                    key={city.id}
                    value={city.name}
                  />
                ))}
              </ComboboxList>
            ) : (
              <span>No results found</span>
            )}
          </ComboboxPopover>
        ) : null}
      </Combobox>
    </fetcher.Form>
  );
}
```

`fetcher.submit`への呼び出しは、そのフェッチャに関する保留中の要求を自動的にキャンセルします。これにより、異なる入力値の要求に関する結果がユーザーに表示されることがなくなります。

