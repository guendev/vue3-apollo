# RFC 0001 — Runtime client config cho `@vue3-apollo/nuxt`

- Trạng thái: Draft (chờ review)
- Phạm vi: `packages/nuxt`
- Mục tiêu: Thiết kế lại cơ chế cấu hình client để hỗ trợ "setup phức tạp" như một tính năng hạng nhất, thay cho workaround `client.setLink` hiện tại.

---

## 1. Bối cảnh & vấn đề

### 1.1. Kiến trúc hiện tại
Module hiện đẩy toàn bộ options vào `runtimeConfig.public.apollo` (`module.ts:25`), rồi một plugin runtime lặp qua từng client và dựng sẵn chuỗi link cố định trong `createApolloClient.ts`:

```
[authLink, errorLink, retryLink, combinedLink(http | ws split)]
```

Người dùng muốn tùy biến phải viết plugin riêng và gọi `client.setLink(...)` (xem `packages/docs/advance/nuxt-custom-integration.md`).

### 1.2. Nguyên nhân gốc — ràng buộc serialization
`runtimeConfig.public` **bắt buộc JSON-serializable** để nhúng vào client bundle. Hệ quả:

- **`inMemoryCacheOptions.typePolicies` chứa function (`merge` / `read` / `keyFields` / `keyArgs`) bị mất khi serialize sang client.** Trên server (SSR) function còn sống do cùng JS context; sang client hydration thì biến mất → cache normalization lệch giữa SSR và CSR. Đây là bug âm thầm, khó debug.
- Không truyền được: custom `ApolloLink`, instance `InMemoryCache`, custom `fetch`, scalar serializer, `localState` resolvers...

→ "Setup phức tạp" **không chỉ** là link chain, mà là *mọi giá trị non-serializable*. Mọi giải pháp thêm hook chỉ vá ngọn.

### 1.3. Vấn đề của workaround `client.setLink`
- **Thay thế** toàn bộ chuỗi link → mất `authLink`, `errorLink` (hook `apollo:error` ngừng fire), WS subscription split.
- Chạy **sau** khi client đã tạo và đã gắn hook SSR (`app:rendered`) → nhạy cảm thứ tự.
- `nuxtApp.$apolloClients` **không có type** (không có augmentation `interface NuxtApp`).
- Lệ thuộc thứ tự theo tên file (`10.apollo-custom.ts`).

## 2. Mục tiêu / Phi mục tiêu

### Mục tiêu
1. Cho phép cấu hình **mọi** phần non-serializable: links, cache, typePolicies-functions, localState.
2. **Compose** (chèn/sửa) trên default thay vì **replace** — giữ nguyên auth / error-hook / ws-split / SSR.
3. Type-safe đầy đủ (`$apolloClients`, builder context).
4. Giữ **zero-config** cho project đơn giản; giữ env override (`NUXT_PUBLIC_...`) cho endpoint.
5. Một mô hình duy nhất cho mọi độ phức tạp; bỏ workaround plugin.
6. Tiện thể sửa các bug đã phát hiện (error link forward vô hạn, authType null, devtools prod).

### Phi mục tiêu
- Không đổi API của `@vue3-apollo/core`.
- Không bắt buộc migrate ngay: tầng `nuxt.config.apollo` cũ vẫn chạy (xem §7).

## 3. Kiến trúc đề xuất — hai tầng

**Tầng 1 — `nuxt.config.ts` chỉ giữ scalar đơn giản** (serializable, override qua env):

```ts
export default defineNuxtConfig({
  modules: ['@vue3-apollo/nuxt'],
  apollo: {
    clients: {
      default: {
        httpEndpoint: 'https://api.example.com/graphql',
        wsEndpoint: 'wss://api.example.com/graphql',
        // optional: trỏ tới file builder cho phần phức tạp
        configFile: '~/apollo/default'
      }
    },
    auth: { tokenName: 'auth-token' }
  }
})
```

**Tầng 2 — file builder do user viết** (resolve thành runtime code, KHÔNG serialize):

```ts
// app/apollo/default.ts
import { defineApolloClient } from '@vue3-apollo/nuxt'
import { ApolloLink, InMemoryCache } from '@apollo/client'
import { relayStylePagination } from '@apollo/client/utilities'

export default defineApolloClient((ctx) => {
  const { createAuthLink, createErrorLink, createHttpLink } = ctx

  return {
    cache: new InMemoryCache({
      typePolicies: {
        Query: { fields: { feed: relayStylePagination() } } // function sống nguyên vẹn
      }
    }),
    link: ApolloLink.from([
      createAuthLink(),
      createErrorLink(),       // vẫn broadcast hook apollo:error
      new MyTracingLink(),     // link tùy biến
      createHttpLink()
    ])
  }
})
```

Vì file builder là **code thật**, mọi function/link/cache sống nguyên vẹn ở cả server lẫn client.

## 4. Thiết kế API

### 4.1. `defineApolloClient`
```ts
export function defineApolloClient(
  setup: (ctx: ApolloClientContext) => ApolloClientSetup | Promise<ApolloClientSetup>
): typeof setup
```
Chỉ là identity helper để có type inference + nhận diện khi build.

### 4.2. Builder context (`ctx`)
Phơi bày các "viên gạch" mặc định để **compose**, kèm bản đã lắp sẵn cho case "chỉ chỉnh nhẹ":

```ts
interface ApolloClientContext {
  clientId: string
  nuxtApp: NuxtApp
  isServer: boolean

  /** Scalar config đã merge từ runtimeConfig (endpoint, auth, ...) — env-overridable */
  config: ApolloClientConfig

  // Factory cho từng link mặc định (đã gắn logic auth/error-hook/ws đúng)
  createHttpLink: (opts?: HttpLink.Options) => ApolloLink
  createAuthLink: () => ApolloLink
  createErrorLink: () => ApolloLink
  createWsLink: () => ApolloLink | undefined   // chỉ client-side, undefined nếu thiếu wsEndpoint/graphql-ws
  createRetryLink: (opts?: RetryLink.Options) => ApolloLink
  createCache: (opts?: InMemoryCacheConfig) => InMemoryCache

  // Bản lắp sẵn cho case tweak nhanh
  defaultLink: ApolloLink     // = [auth, error, retry, http|ws-split]
  defaultCache: InMemoryCache
}
```

### 4.3. Giá trị trả về
```ts
type ApolloClientSetup =
  // Phổ biến: override từng phần, module tự lắp phần còn lại + SSR plumbing
  | Partial<Pick<ApolloClient.Options, 'link' | 'cache' | 'defaultOptions' | 'localState' | ...>>
  // Escape hatch: trả về client tự dựng hoàn toàn (module bỏ qua auto-wire, chỉ giữ SSR nếu cache hỗ trợ)
  | ApolloClient
```

Khuyến nghị mặc định: trả **options object** để module vẫn quản nhất quán SSR (extract/restore cache) + devtools. Trả full `ApolloClient` là escape hatch cuối, có cảnh báo trong doc.

### 4.4. Truy cập Vue/Nuxt composables trong builder

Builder chạy bên trong `runtime/plugin.ts` (Nuxt context active), nên truy cập được các composable **cấp Nuxt app**: `useCookie`, `useRuntimeConfig`, `useRequestHeaders`, `useRequestEvent`, `useState`, `useRoute`... (code hiện tại đã dùng `useCookie` ngay trong plugin — `createApolloClient.ts:37`). **Không** truy cập được composable cấp component instance (cần `getCurrentInstance()`), vì chưa có component nào setup.

Cạm bẫy: sau lần `await` đầu tiên trong builder async, Nuxt context ngầm có thể mất ("Nuxt instance is unavailable"). Hai cách an toàn:
- Gọi composable **trước** mọi `await`; hoặc
- Bọc qua `ctx.nuxtApp.runWithContext(() => ...)` (lý do `nuxtApp` được expose trong `ctx`).

Lưu ý: không thể `inject(APOLLO_CLIENTS_KEY)` trong builder (registry được provide *sau* khi dựng xong client). Nhu cầu auth phổ biến đã có `ctx.createAuthLink()` xử lý cookie sẵn.

## 5. Cơ chế build-time (module)

1. Đọc `apollo.clients` từ `nuxt.config`. Với mỗi client:
   - Phần scalar (`httpEndpoint`, `wsEndpoint`, `auth`, ...) → `runtimeConfig.public.apollo` như hiện tại (giữ env override).
   - Nếu có `configFile` → resolve path (layer-aware).
   - (Tùy chọn sugar) Convention-scan `<srcDir>/apollo/<clientId>.{ts,js}` nếu không khai báo `configFile`.
2. `addTemplate` sinh module tổng hợp ánh xạ `clientId → factory`:
   ```js
   // #build/apollo/clients.mjs
   import default_factory from '/abs/app/apollo/default'
   export const factories = { default: default_factory }
   ```
3. `addTypeTemplate` sinh augmentation `interface NuxtApp { $apolloClients: Record<DiscoveredClientId, ApolloClient> }`.
4. Vẫn `addPlugin(runtime/plugin)` + `prepare:types`.

## 6. Cơ chế runtime (plugin)

```
plugin.ts
  ├─ đọc runtimeConfig.public.apollo (scalar)
  ├─ import factories từ #build/apollo/clients
  └─ với mỗi clientId (Promise.all — song song):
        1. dựng ctx (createHttpLink/createAuthLink/createErrorLink/createWsLink/createCache + defaults)
        2. nếu có factory → setup = await factory(ctx); else → dùng default options
        3. new ApolloClient({ ...defaults, ...setup, devtools, ssrMode })
        4. SSR: server → app:rendered extract payload.data['apollo:{id}']
                client → cache.restore(payload.data['apollo:{id}'])
        5. provide APOLLO_CLIENTS_KEY + $apolloClients
```

SSR cache plumbing tách khỏi việc dựng link/cache → hoạt động bất kể user trả cache tùy biến (miễn là một `InMemoryCache`).

## 7. Tương thích ngược & migration

- **Không breaking ở minor**: nếu không có `configFile`/file builder → hành vi y như hiện tại (dựng default chain từ scalar config).
- `inMemoryCacheOptions` / `httpLinkOptions` / `wsLinkOptions` trong `nuxt.config` **vẫn hỗ trợ** nhưng:
  - Thêm cảnh báo dev nếu `typePolicies` chứa function (rủi ro serialization) → gợi ý chuyển sang file builder.
  - Đánh dấu `@deprecated` trong JSDoc, dự kiến gỡ ở major kế tiếp.
- Doc `nuxt-custom-integration.md` viết lại theo `defineApolloClient`; mục `client.setLink` chuyển thành "escape hatch / không khuyến nghị".

## 8. Các bug được sửa kèm theo

1. **Error link forward vô hạn** (`createApolloClient.ts:91`): `createErrorLink` chỉ broadcast hook, **không** `return forward(operation)`; retry để `RetryLink` lo.
2. **`authType: null`** (`:49`): `createAuthLink` xử lý prefix rỗng → gửi token trần, không còn chuỗi `"null <token>"`. Cập nhật type `authType?: string | null`.
3. **Devtools prod** (`:176`): tập trung logic `enabled: config.devtools ?? import.meta.dev`, bỏ default `devtools: true` ở module để fallback theo dev mode hoạt động đúng.
4. **`$apolloClients` không type**: augmentation sinh tự động ở §5.3.
5. **`getAuthCredentials` return không nhất quán**: chuẩn hóa luôn trả `{}`.
6. **Type `NuxtPayload.apollo` thừa** (`types.ts`): bỏ, vì state thực lưu ở `payload.data['apollo:{id}']`.
7. **Tạo client tuần tự** (`plugin.ts`): chuyển `Promise.all`.

## 9. So sánh phương án

| Tiêu chí | `setLink` (hiện tại) | Hook `apollo:links` | **Config-file + builder** | Pure-plugin (DIY) |
|---|---|---|---|---|
| typePolicies functions | ❌ hỏng client | ❌ | ✅ | ✅ |
| Giữ built-in khi custom | ❌ | ✅ | ✅ | ➖ tự lo |
| Type-safe | ❌ | ➖ | ✅ | ✅ |
| Zero-config | ✅ | ✅ | ✅ | ❌ |
| Một mô hình duy nhất | ❌ | ➖ | ✅ | ✅ |
| Công sức implement | – | thấp | trung bình–cao | thấp (đẩy cho user) |

## 10. Câu hỏi mở

1. **Resolve file**: chọn `configFile` tường minh, hay convention-scan `<srcDir>/apollo/*`, hay cả hai? (Đề xuất: `configFile` chính + scan là sugar.)
2. Có cho phép builder **async** không? (Đề xuất: có — cần cho dynamic import như `graphql-ws`.)
3. Trả full `ApolloClient` từ builder: hỗ trợ hay cấm hẳn để giữ nhất quán SSR? (Đề xuất: hỗ trợ + cảnh báo.)
4. Có gỡ `inMemoryCacheOptions`/`httpLinkOptions` ở major kế tiếp không, hay giữ vĩnh viễn cho case đơn giản?

## 11. Kế hoạch triển khai (phân pha)

- **P0** — Refactor nội bộ: tách `createApolloClient` thành các factory link/cache độc lập (không đổi API). Sửa bug §8.1–8.7. Có thể ship ở patch/minor.
- **P1** — Thêm `defineApolloClient` + cơ chế template + `configFile`. Type augmentation `$apolloClients`. Ship ở minor (opt-in, non-breaking).
- **P2** — Cảnh báo deprecation cho `inMemoryCacheOptions`/`httpLinkOptions` + viết lại docs.
- **P3** (major) — Cân nhắc gỡ các option serialization-risky, kèm codemod/migration guide.
