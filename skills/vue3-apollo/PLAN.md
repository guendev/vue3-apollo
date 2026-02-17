# Plan Chi Tiet Skill `vue3-apollo`

## 1) Muc tieu

Xay dung skill `vue3-apollo` de ho tro nguoi dung thu vien `@vue3-apollo/core` va `@vue3-apollo/nuxt` trong cac tinh huong:

1. Setup nhanh cho Vue 3/Nuxt 4 voi Apollo Client v4.
2. Su dung composables (`useQuery`, `useMutation`, `useSubscription`, `useFragment`, `useApolloClient`).
3. Cau hinh multi-client, SSR, auth qua cookie, WebSocket subscriptions.
4. Giai quyet cac case migration tu `@vue/apollo-composable`.
5. TypeScript + GraphQL Codegen.
6. Tracking loading/toan cuc theo owner (`useApolloTracking*`, `use*Loading`).

## 1.1 Persona chinh (chot cho Phase A)

Skill nay duoc viet cho AI agents doc va thuc thi, khong phai tai lieu huong dan cho con nguoi. Vi vay:

1. Uu tien cau lenh ro rang, mang tinh thao tac (imperative).
2. Uu tien decision tree/checklist over mo ta dai.
3. Moi pattern phai co "when to use" + "when not to use".
4. Examples phuc vu viec agent copy/adapt nhanh, khong viet theo van phong marketing.

## 2) Pham vi va nguon su that (source of truth)

### 2.1 Nguon tai lieu uu tien

1. `packages/docs`
2. `packages/core/src`
3. `packages/nuxt/src`
4. Mau cau truc skill: `apollo-client`

### 2.2 Mapping nhanh docs -> source

1. Core composables docs:
`packages/docs/composables/useApolloClient.md`, `packages/docs/composables/useQuery.md`, `packages/docs/composables/useMutation.md`, `packages/docs/composables/useSubscription.md`, `packages/docs/composables/useFragment.md`
2. Nuxt docs:
`packages/docs/nuxt/index.md`, `packages/docs/nuxt/composables/useAsyncQuery.md`, `packages/docs/advance/nuxt-custom-integration.md`
3. Advanced docs:
`packages/docs/advance/typescript.md`, `packages/docs/advance/tracking.md`, `packages/docs/migration.md`
4. Core implementation:
`packages/core/src/composables/*`, `packages/core/src/plugins/apolloPlugin.ts`, `packages/core/src/helpers/*`
5. Nuxt implementation:
`packages/nuxt/src/module.ts`, `packages/nuxt/src/runtime/*`, `packages/nuxt/src/type.ts`

## 3) Kien truc skill de xay dung (tam chot)

```
skills/vue3-apollo/
- SKILL.md
- agents/openai.yaml
- references/overview-and-decision-tree.md
- references/setup-core-vue3.md
- references/setup-nuxt4.md
- references/composables-use-query.md
- references/composables-use-mutation.md
- references/composables-use-subscription.md
- references/composables-use-fragment.md
- references/composables-use-apollo-client.md
- references/tracking-and-loading.md
- references/typescript-and-codegen.md
- references/migration-from-vue-apollo-composable.md
- references/nuxt-custom-integration.md
- references/troubleshooting.md
- references/testing-checklist.md
- assets/component-samples/QueryListExample.vue
- assets/component-samples/MutationFormExample.vue
- assets/component-samples/SubscriptionFeedExample.vue
- assets/component-samples/FragmentCardExample.vue
- assets/component-samples/NuxtAsyncQueryPage.vue
```

Ghi chu:
1. `assets/component-samples/` la de tai su dung snippet/component mau nhu ban yeu cau.
2. `references/` chua pattern + nhieu case + anti-pattern.
3. `SKILL.md` giu gon, dieu huong den reference files (progressive disclosure).
4. Muc nay duoc xem la baseline co dinh trong giai doan hien tai; chi dieu chinh khi co quyet dinh moi tu ban.

## 4) Noi dung chi tiet tung reference (co case cu the)

| Reference file | Muc tieu | Nguon chinh | Vi du/case bat buoc |
|---|---|---|---|
| `overview-and-decision-tree.md` | Chon nhanh huong xu ly theo nhu cau user | docs + core + nuxt | 1 so do "Neu SSR -> Nuxt/useAsyncQuery", 1 so do "Neu imperative -> useApolloClient().query/mutate", 1 bang "symptom -> action" |
| `setup-core-vue3.md` | Setup cho Vue 3 thuan | getting-started + apolloPlugin + useApolloClient(s) | case single client, multi-client, case plugin missing (error handling) |
| `setup-nuxt4.md` | Setup module Nuxt 4 | nuxt/index + module.ts + runtime/plugin.ts + createApolloClient.ts | case basic HTTP, case them wsEndpoint, case auth cookie, case multi-client |
| `composables-use-query.md` | Quy trinh cho reactive query | useQuery doc + useQuery.ts | case variables reactive, case debounce/throttle, case enabled false, case SSR prefetch, case fetchMore/refetch |
| `composables-use-mutation.md` | Mutation va cache update | useMutation doc + useMutation.ts | case optimistic UI, case refetchQueries, case throws modes, case reset/onDone/onError |
| `composables-use-subscription.md` | Subscription runtime | useSubscription doc + useSubscription.ts + createApolloClient.ts | case restart khi variables doi, case enabled toggle, case ws missing `graphql-ws` |
| `composables-use-fragment.md` | Fragment cache read/watch | useFragment doc + useFragment.ts | case new overload, case legacy overload, case partial/complete typing, case SSR prefetch |
| `composables-use-apollo-client.md` | Imperative API va multi-client | useApolloClient.md + useApolloClient.ts + useApolloClients.ts | case query imperative, case mutate imperative, case clientId not found |
| `tracking-and-loading.md` | Tracking loading theo owner/global | tracking.md + helpers/* | case loading global, case loading theo component uid, case custom id chia se |
| `typescript-and-codegen.md` | TypedDocumentNode + codegen | typescript.md | case manual typing, case client preset, case mapping voi composables |
| `migration-from-vue-apollo-composable.md` | Lo trinh migration | migration.md | case import migration, case `useAsyncQuery` object options, case bo `useLazyAsyncQuery`, case fetchPolicy thay `cache` |
| `nuxt-custom-integration.md` | Runtime plugin customization | advance/nuxt-custom-integration.md + createApolloClient.ts + type.ts | case auth link, case retry/error hook `apollo:error`, case cache policy runtime |
| `troubleshooting.md` | Chan doan loi pho bien | docs + source errors/warnings | case missing plugin provide, case missing client, case SSR mismatch, case subscription ko ket noi |
| `testing-checklist.md` | Checklist verify truoc merge | source behavior | case SSR, hydration, multi-client, error hooks, tracking counters |

## 5) Chuan chat luong noi dung cho moi reference

Moi file trong `references/` phai dat du:

1. It nhat 1 "When to use" ngan gon.
2. It nhat 3 case thuc te (happy path + edge case + failure case).
3. Co code sample copy-paste duoc.
4. Co phan "Pitfalls" (toi thieu 3 loi thuong gap).
5. Co "Cross-reference" sang file lien quan.
6. Neu co UI flow: link den component mau trong `assets/component-samples/`.

## 6) Ke hoach thuc hien theo phase (chua code ngay)

## Phase A - Alignment va scope freeze

1. Chot persona chinh: AI agents la nguoi doc truc tiep va tai su dung.
2. Chot muc do uu tien: Core truoc, Nuxt sau hay song song.
3. Chot danh sach references cuoi cung (giu nguyen hay rut gon).

Deliverable: scope da chot trong plan nay (version 1.0).

## Phase B - Skeleton skill

1. Khoi tao khung bang `init_skill.py` vao `skills/vue3-apollo`.
2. Tao `agents/openai.yaml` voi `display_name`, `short_description`, `default_prompt`.
3. Tao cac thu muc can thiet (`references`, `assets/component-samples`).

Deliverable: skeleton hop le, chua viet chi tiet noi dung.

## Phase C - Build references theo nhom

1. Nhom Setup:
`overview-and-decision-tree.md`, `setup-core-vue3.md`, `setup-nuxt4.md`
2. Nhom Core composables:
`composables-use-query.md`, `composables-use-mutation.md`, `composables-use-subscription.md`, `composables-use-fragment.md`, `composables-use-apollo-client.md`
3. Nhom Advanced:
`tracking-and-loading.md`, `typescript-and-codegen.md`, `migration-from-vue-apollo-composable.md`, `nuxt-custom-integration.md`
4. Nhom Quality:
`troubleshooting.md`, `testing-checklist.md`

Deliverable: references day du, moi file co case va examples.

## Phase D - Tao assets component mau

1. Tao 5 component mau trong `assets/component-samples/`.
2. Moi component co phien ban toi gian + ghi chu khi nao dung.
3. Dam bao dong bo API voi code hien tai (khong dung API gia).

Deliverable: bo component mau co the copy vao app de adapt nhanh.

## Phase E - Viet SKILL.md dieu huong

1. Frontmatter dung chuan (`name`, `description`) theo `skill-creator`.
2. Body gon, dieu huong sang references theo task.
3. Co quy tac chon nhanh "Vue core vs Nuxt" va "reactive vs imperative".

Deliverable: SKILL.md < 500 lines, de trigger dung ngu canh.

## Phase F - Validate va harden

1. Chay `quick_validate.py skills/vue3-apollo`.
2. Soat lai `openai.yaml` co stale khong.
3. Dry-run bang mot so prompts dai dien.
4. Chinh lai references neu prompt thuc te gap vung.

Deliverable: skill pass validate + pass dry-run checklist.

## 7) Acceptance criteria (Definition of Done)

1. Folder `skills/vue3-apollo` dung cau truc skill chuan.
2. `SKILL.md` trigger ro rang cho Vue3 Apollo contexts.
3. Moi reference co vi du cu the, nhieu case, co anti-pattern.
4. Co bo component mau cho query/mutation/subscription/fragment/nuxt async.
5. Noi dung bam sat source code hien tai, khong noi API khong ton tai.
6. Qua `quick_validate.py` khong loi.

## 8) Rui ro va cach giam thieu

1. Rui ro lech docs va implementation.
Giam thieu: uu tien source code (`packages/core/src`, `packages/nuxt/src`) khi co mau thuan.
2. Rui ro SKILL.md qua dai.
Giam thieu: day chi tiet xuong `references/`, SKILL.md chi giu workflow dieu huong.
3. Rui ro examples khong chay duoc.
Giam thieu: moi example map truc tiep den type/options trong source.
4. Rui ro overlap voi skill `apollo-client` (React).
Giam thieu: nhan manh Vue/Nuxt-specific patterns, khong lap lai React patterns.

## 9) Trang thai quyet dinh

1. References scope:
Tam chot theo day du danh sach o muc 3, va se lam tuan tu theo checklist file-by-file.
2. Component samples quality level:
Tam hoan quyet dinh "production-ready" vs "toy examples"; se quyet sau khi viet mau dau tien.
3. `nuxt-custom-integration`:
Da chot lam ngay trong v1.
4. Domain recipes (e-commerce/dashboard/chat):
Chua uu tien cho v1; xem lai sau khi hoan tat bo references cot loi.
5. Packaging context:
Da chot theo huong npm consumer repo (import public tu `@vue3-apollo/core` va `@vue3-apollo/nuxt`), khong viet examples dua tren import noi bo monorepo.

## 10) Trinh tu lam viec de thao luan tiep

1. Lam tuan tu theo `## 11) Checklist thuc thi theo tung file`.
2. Moi file xong se review/chot truoc khi sang file ke tiep.
3. Sau khi xong bo references + assets, cap nhat `SKILL.md` va chay validate.

## 11) Checklist thuc thi theo tung file

Checklist nay la nguon theo doi chinh cho cach lam "tung file mot":

- [x] `references/overview-and-decision-tree.md`
- [x] `references/setup-core-vue3.md`
- [ ] `references/setup-nuxt4.md`
- [ ] `references/composables-use-query.md`
- [ ] `references/composables-use-mutation.md`
- [ ] `references/composables-use-subscription.md`
- [ ] `references/composables-use-fragment.md`
- [ ] `references/composables-use-apollo-client.md`
- [ ] `references/tracking-and-loading.md`
- [ ] `references/typescript-and-codegen.md`
- [ ] `references/migration-from-vue-apollo-composable.md`
- [ ] `references/nuxt-custom-integration.md`
- [ ] `references/troubleshooting.md`
- [ ] `references/testing-checklist.md`
- [ ] `assets/component-samples/QueryListExample.vue`
- [ ] `assets/component-samples/MutationFormExample.vue`
- [ ] `assets/component-samples/SubscriptionFeedExample.vue`
- [ ] `assets/component-samples/FragmentCardExample.vue`
- [ ] `assets/component-samples/NuxtAsyncQueryPage.vue`
- [x] `SKILL.md`

Quy tac checklist:
1. Chi tick sau khi file da co noi dung dat muc 5 (chat luong reference).
2. Moi lan chi xu ly 1 file chinh de review nhanh va de chot.
3. Neu mot file keo theo phu thuoc, ghi ro phu thuoc trong commit/noi dung cap nhat.
