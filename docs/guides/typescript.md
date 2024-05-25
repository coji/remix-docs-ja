---
title: TypeScript
toc: false
---

# TypeScript

Remix は、JavaScript と TypeScript の両方をシームレスにサポートしています。ファイルを `.ts` または `.tsx` 拡張子で名前付けると、TypeScript として扱われます (`.tsx` は [JSX を含む TypeScript ファイル][with-jsx] 用です)。ただし、必須ではありません。TypeScript を使用したくない場合は、すべてのファイルを `.js` ファイルとして記述できます。

Remix CLI は型チェックを実行しません。代わりに、TypeScript の `tsc` CLI を自分で使用します。一般的な解決策は、`package.json` に `typecheck` スクリプトを追加することです。

```json filename=package.json lines=[10]
{
  "name": "remix-app",
  "private": true,
  "sideEffects": false,
  "scripts": {
    "build": "remix vite:build",
    "dev": "remix vite:dev",
    "lint": "eslint --ignore-path .gitignore .",
    "start": "remix-serve ./build/index.js",
    "typecheck": "tsc"
  },
  "dependencies": {
    "@remix-run/node": "latest",
    "@remix-run/react": "latest",
    "@remix-run/serve": "latest",
    "isbot": "^4.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@remix-run/dev": "latest",
    "@types/react": "^18.2.20",
    "@types/react-dom": "^18.2.7",
    "eslint": "^8.23.1",
    "typescript": "^5.1.6",
    "vite": "^5.1.4"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

次に、そのスクリプトをテストと並んで継続的インテグレーションの一部として実行できます。

Remix には、TypeScript の型定義も組み込まれています。たとえば、スターターテンプレートは、Remix と Vite に必要な型を含む `tsconfig.json` ファイルを作成します。

```json filename=tsconfig.json lines=[12]
{
  "include": [
    "**/*.ts",
    "**/*.tsx",
    "**/.server/**/*.ts",
    "**/.server/**/*.tsx",
    "**/.client/**/*.ts",
    "**/.client/**/*.tsx"
  ],
  "compilerOptions": {
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "types": ["@remix-run/node", "vite/client"],
    "isolatedModules": true,
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "target": "ES2022",
    "strict": true,
    "allowJs": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "~/*": ["./app/*"]
    },

    // Vite がビルド処理を行い、tsc は行いません。
    "noEmit": true
  }
}
```

<docs-info> `types` 配列で参照される型は、アプリを実行している環境によって異なります。たとえば、Cloudflare では異なるグローバルが使用できます。</docs-info>

[with-jsx]: https://www.typescriptlang.org/docs/handbook/jsx.html
