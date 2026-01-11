---
title: ネットワーク同時実行管理
---

# ネットワーク同時実行管理

[MODES: framework, data]

<br/>
<br/>

ウェブアプリケーションを構築する際、ネットワークリクエストの管理は骨の折れる作業になることがあります。最新のデータを保証し、同時実行されるリクエストを処理するという課題は、アプリケーションにおいて中断や競合状態に対処するための複雑なロジックにつながりがちです。React Router は、ウェブブラウザの直感的な動作を反映・拡張することで、ネットワーク管理を自動化し、このプロセスを簡素化します。

React Router が同時実行をどのように処理するかを理解する上で、`form` の送信後、React Router が `loader` から新しいデータをフェッチすることを覚えておくことが重要です。これは revalidation と呼ばれます。

## ブラウザの動作との自然な整合性

React Router のネットワーク同時実行処理は、ドキュメントを処理する際のウェブブラウザのデフォルトの動作に強く影響を受けています。

### リンクナビゲーション

**ブラウザの動作**: ブラウザでリンクをクリックし、ページの遷移が完了する前に別のリンクをクリックした場合、ブラウザは最新の `action` を優先します。最初のリクエストをキャンセルし、最後にクリックされたリンクのみに焦点を当てます。

**React Router の動作**: React Router は、クライアントサイドのナビゲーションも同様に管理します。React Router アプリケーション内でリンクがクリックされると、ターゲット URL に紐付けられた各 `loader` に対してフェッチリクエストを開始します。別のナビゲーションが最初のナビゲーションを中断した場合、React Router は以前のフェッチリクエストをキャンセルし、最新のリクエストのみが続行されるようにします。

### フォーム送信

**ブラウザの動作**: ブラウザでフォームの送信を開始し、すぐに別のフォームを再度送信した場合、ブラウザは最初の送信を無視し、最新の送信のみを処理します。

**React Router の動作**: React Router は、フォームを扱う際にこの動作を模倣します。フォームが送信され、最初の送信が完了する前に別の送信が発生した場合、React Router は元々のフェッチリクエストをキャンセルします。その後、最新の送信が完了するのを待ってから、再度ページの revalidation をトリガーします。

## 同時実行される送信と再検証 (Revalidation)

標準的なブラウザはナビゲーションとフォーム送信に対して一度に一つのリクエストに制限されていますが、React Router はこの動作を向上させます。ナビゲーションとは異なり、[`useFetcher`][use_fetcher] を使用すると、複数のリクエストを同時に実行できます。

React Router は、サーバー `action` への複数のフォーム送信と、同時実行される revalidation リクエストを効率的に処理するように設計されています。新しいデータが利用可能になり次第、状態が迅速に更新されることを保証します。しかし、React Router は、他の `action` が競合状態を引き起こす場合に、古いデータがコミットされるのを避けることで、潜在的な落とし穴からも保護します。

たとえば、3つのフォーム送信が進行中で、そのうち1つが完了した場合、React Router は他の2つを待つことなく、すぐにそのデータで UI を更新し、UI が応答性が高く動的であり続けるようにします。残りの送信が完了するにつれて、React Router は UI の更新を続け、最新のデータが表示されるようにします。

この凡例を使用します。

- `|`: 送信開始
- ✓: Action 完了、データ revalidation 開始
- ✅: Revalidation されたデータが UI にコミットされる
- ❌: リクエストキャンセル

このシナリオを次の図で視覚化できます。

```text
submission 1: |----✓-----✅
submission 2:    |-----✓-----✅
submission 3:             |-----✓-----✅
```

しかし、後の送信の revalidation が前の送信よりも早く完了した場合、React Router は前のデータを破棄し、UI には最新の情報のみが反映されるようにします。

```text
submission 1: |----✓---------❌
submission 2:    |-----✓-----✅
submission 3:             |-----✓-----✅
```

送信 (2) からの revalidation が送信 (1) よりも遅く開始され、早く着地したため、送信 (1) からのリクエストはキャンセルされ、送信 (2) からのデータのみが UI にコミットされます。これは後にリクエストされたものであり、(1) と (2) の両方からの更新された値を含む可能性が高いためです。

## 古いデータの可能性

ユーザーがこれを経験することはめったにありませんが、一貫性のないインフラストラクチャでは、ごく稀な状況でユーザーが古いデータを見る可能性がまだあります。React Router は古いデータのリクエストをキャンセルしますが、それらは最終的にはサーバーに到達します。ブラウザでリクエストをキャンセルしても、そのリクエストのブラウザリソースが解放されるだけであり、サーバーに到達するのを「追いかけて」止めることはできません。非常に稀な状況では、キャンセルされたリクエストが、割り込み `action` の revalidation が完了した後にデータを変更する可能性があります。次の図を考慮してください。

```text
     👇 interruption with new submission (新しい送信による割り込み)
|----❌----------------------✓
       |-------✓-----✅
                             👆
                  initial request reaches the server (最初の要求がサーバーに到達する)
                  after the interrupting submission (割り込み送信後)
                  has completed revalidation (revalidationが完了した)
```

ユーザーは現在、サーバー上のデータとは異なるデータを見ています。この問題は非常に稀であると同時に、デフォルトのブラウザの動作にも存在することに注意してください。最初の要求が、2番目の送信と revalidation の両方よりも遅れてサーバーに到達する可能性は、いかなるネットワークおよびサーバーインフラストラクチャにおいても予期しないものです。これがあなたのインフラストラクチャに関する懸念事項である場合は、フォーム送信にタイムスタンプを送信し、古い送信を無視するサーバーロジックを記述することができます。

## 例

コンボボックスのような UI コンポーネントでは、キーボードの各入力がネットワークリクエストをトリガーする可能性があります。このような高速で連続的なリクエストを管理するのは厄介であり、特に表示される結果が最新のクエリと一致することを保証する場合にはそうです。しかし、React Router を使用すると、この課題は自動的に処理され、開発者がネットワークを細かく管理することなく、ユーザーが正しい結果を見られるようになります。

```tsx filename=app/pages/city-search.tsx
export async function loader({ request }) {
  const { searchParams } = new URL(request.url);
  const cities = await searchCities(searchParams.get("q"));
  return cities;
}

export function CitySearchCombobox() {
  const fetcher = useFetcher<typeof loader>();

  return (
    <fetcher.Form action="/city-search">
      <Combobox aria-label="Cities">
        <ComboboxInput
          name="q"
          onChange={(event) =>
            // submit the form onChange to get the list of cities (都市のリストを取得するために onChange でフォームを送信)
            fetcher.submit(event.target.form)
          }
        />

        {/* render with the loader's data (loaderのデータでレンダリング) */}
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

アプリケーションが必要とするのは、データをクエリする方法とレンダリングする方法だけです。ネットワークは React Router が処理します。

## まとめ

React Router は、ネットワークリクエストを管理するための直感的でブラウザベースのアプローチを開発者に提供します。ブラウザの動作を反映し、必要に応じてそれを強化することで、同時実行、revalidation、および潜在的な競合状態の複雑さを簡素化します。シンプルなウェブページを構築する場合でも、洗練されたウェブアプリケーションを構築する場合でも、React Router はユーザーインタラクションがスムーズで信頼性が高く、常に最新であることを保証します。

[use_fetcher]: ../api/hooks/useFetcher