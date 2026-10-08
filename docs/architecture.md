# Architecture — clase-fit

Feature-sliced Clean Architecture on top of Expo Router. Every feature has three
layers (`domain` → `infrastructure` → `ui`), plus two cross-cutting modules
(`core`, `shared`) and the navigation layer (`app`).

## 1. `src/` layout

```txt
src/
├── core/        # cross-feature entities, library config, custom SDK clients
├── shared/      # UI shared across features (design system, hooks, utils, theme)
├── app/         # navigators and screen instances ONLY (expo-router)
└── <feature>/   # one folder per feature
    ├── domain/
    ├── infrastructure/
    └── ui/
```

### `src/core/`

Everything shared that relates to **data models and configuration**:

- Entities shared across features.
- Library configuration and custom SDK clients: media picker, video, Firebase,
  Supabase, Zustand, i18n, etc.
- `core/httpClient/` — the project's single HTTP client (see §7).
- `core/config/` — library configuration (`query.client.ts`) and the build-time
  environment variables (`env.constants.ts`, see §7.1).

Contains no UI.

### `src/shared/`

Everything shared on the **UI side**, used by more than one feature:

- `components/` — design system.
- `hooks/` — reusable UI hooks.
- `utils/` — UI-side utilities.
- `models/` — UI models.
- `constants/` — theme configuration.

### `src/app/`

Holds navigator definitions and screen instances. Keep it as thin as possible
and follow the expo-router standard.

- **Not allowed**: business logic or UI implementation.
- Only the component instance, imported from
  `@/<feature>/ui/screens/<nameScreen>`.
- `_layout.tsx` files define the navigators.

```tsx
// src/app/(app)/classes.tsx
export { default } from "@/classes/ui/screens/classList";
```

## 2. Dependency rule

```txt
domain          →  (nothing)
infrastructure  →  domain
ui              →  domain, infrastructure
```

- `domain` **must not depend on any other layer**.
- `infrastructure` depends on `domain` only.
- `ui` depends on `domain` and `infrastructure`.
- Prefer `interface` over `type` wherever possible.

### Barrels

A **barrel** is an `index.ts` that re-exports more than one file. Barrels are
not allowed, with exactly three exceptions:

1. A screen's `index.ts` — the entry point consumed by `src/app/`.
2. The `index.ts` of an SDK or library implementation under `src/core/` (for
   example `core/httpClient/index.ts`, `core/mobileStorage/index.ts`,
   `core/zustand/index.ts`).
3. A store's `index.ts` under `stores/<NameStore>/` (see §6).

Everywhere else, import from the concrete file. Do not add an `index.ts` to
`entities/`, `useCases/`, `repositories/`, `adapters/`, `DTOs/`, `components/`,
`hooks/` or `utils/`.

An `index.ts` that re-exports a single file is not a barrel, but it is still
indirection — only add one where the three exceptions above apply.

## 3. `<feature>/domain`

Domain models, repository contracts, and use cases.

### `domain/entities/<NameEntity>.entity.ts`

Domain models implemented with a **TS namespace**. The main model is always
named `Entity`.

```ts
// <feature>/domain/entities/NameEntity.entity.ts
export namespace NameEntity {
  export interface SomethingModel {}
  interface OtherModel {}
  export interface Entity {} // main model
}
```

### `domain/repositories/<feature>.repository.models.ts`

Repository contracts following **CQRS**: `Query` for reads, `Write` for writes.

```ts
// <feature>/domain/repositories/<feature>.repository.models.ts
export namespace <Feature>Repository {
  export interface SomethingModel {}
  interface OtherModel {}
  export interface Query {} // main model for query actions
  export interface Write {} // main model for write actions
}
```

### `domain/useCases/<nameUseCase>.useCase.ts`

One use case per file. Repositories arrive through **constructor injection**,
and the class exposes a single `execute`.

```ts
// <feature>/domain/useCases/<nameUseCase>.useCase.ts
export class <NameUseCase>UseCase {
  constructor(private readonly _repository: <Model>) {}

  async execute(params): Promise<Entity> {
    try {
      // ...validate params   (through the validator)
      // ...validate business logic
      // ...execute action
      // ...return entity
    } catch (error) {
      // ...implement handle error
    }
  }
}
```

### `domain/useCases/validators/<nameUseCase>.validator.ts`

Parameter validation with **zod**, exposed as a static class method.

```ts
const Schema = z.object({
  <prop>: z.<typeFile>,
});

export class <NameUseCase>Validator {
  static validate(params) {
    return Schema.parse(params);
  }
}
```

## 4. `<feature>/infrastructure`

Repository implementations, backend models (DTOs), adapters (DTO → Entity), and
payloads (Entity → DTO).

### `infrastructure/DTOs/<NameDto>.dto.ts`

Models of the objects and responses returned by our endpoints, as a TS
namespace. The main model is always named `Dto`.

```ts
// <feature>/infrastructure/DTOs/NameDto.dto.ts
export namespace <NameDto>Dto {
  export interface SomethingModel {}
  interface OtherModel {}
  export interface Dto {} // main model
}
```

### `infrastructure/adapters/<Name>.adapter.ts`

Classes that transform and validate a DTO into a domain model. Static methods.

```ts
// <feature>/infrastructure/adapters/Name.adapter.ts
export class <NameEntity>Adapter {
  static toDomain(dto: <modelDto>): <modelEntity> {
    return {
      // mapper props
    };
  }
}
```

**Payloads** do the reverse trip (Entity → DTO) and live in
`infrastructure/payloads/`.

### `infrastructure/repositories/<feature>.<action>.repository.ts`

Implements the contract declared in `domain/repositories`. `<action>` is `query`
for reads and `write` for writes. **Always returns a domain entity**, never a
DTO.

```ts
// <feature>/infrastructure/repositories/<feature>.<action>.repository.ts
export class <Feature><Action>Repository implements <ModelRepository>.<Action> {
  constructor(private readonly _httpClient: <httpClientModel>) {}

  async <nameAction>(
    params: <ModelRepository>.<nameAction>Params,
  ): Promise<Entity> {
    try {
      const response = await this._httpClient.<actionRestApi>();
      return <NameEntity>Adapter.toDomain(response);
    } catch {
      // handle error
    }
  }
}
```

Every repository receives the `httpClient` from `core/httpClient` through its
constructor.

## 5. `<feature>/ui`

Screens, components, hooks, utils, models, stores.

### `ui/di/`

Dependency injection between `domain` and `infrastructure`: builds the
repository instances, injects them into the use cases, and exposes those.

```ts
export const <feature>ServiceModule = {
  queries: QueryServiceInstance,
  write: WriteServiceInstance,
} as const;
```

### `ui/screens/<nameScreen>/`

```txt
index.ts                                  # exports the component; consumed by src/app/
<nameScreen>.screen.tsx                   # overall screen template; consumes the viewModel
<nameScreen>.models.ts                    # screen-level models (TS namespace)
hooks/<nameScreen>.viewModel.hook.ts      # screen logic; exposes methods and state
hooks/<action>.hook.ts                    # consumes the di service via react-query
components/<nameComponent>.component.tsx  # one component of the screen layout
```

- A screen never calls use cases directly; it consumes its `viewModel`.
- `<action>.hook.ts` files are the only place that touches `react-query` and the
  `<feature>ServiceModule`.

### Promoting shared implementations

If an implementation is used by **more than one screen**, move it up to the
feature level: `<feature>/ui/<type>/`. Example: `myHook.hook.ts` used by
`screen_1` and `screen_2` belongs in `<feature>/ui/hooks/myHook.hook.ts`.

If it is used by **more than one feature**, move it up to `src/shared/`.

## 6. State management

Two flavors — pick by what the state is for:

- **Context API store** — state scoped to a provider subtree (session, toast,
  modals).
- **Zustand store** — app-wide state, optionally persisted to MMKV.

Both live in `<feature>/ui/stores/` or, when more than one feature consumes
them, in `src/shared/stores/`. One folder per store, named in PascalCase.

### 6.1 Context API stores

```txt
<feature|shared>/stores/<NameStore>/
├── index.ts                    # exports the provider and the context
├── <NameStore>.provider.tsx    # default export — holds the state
├── <NameStore>.context.ts      # default export — createContext
├── <nameStore>.models.ts       # namespace <Name>ContextModels
└── <nameStore>.constants.ts    # <NAME>_INITIAL_STATE and other constants
```

Naming: the folder and the `.provider` / `.context` files are PascalCase;
`.models` and `.constants` are camelCase. Any file containing JSX is `.tsx`.

```ts
// index.ts
export { default as ToastProvider } from "./Toast.provider";
export { default as ToastContext } from "./Toast.context";
```

```ts
// toast.models.ts
import { PropsWithChildren } from "react";

export namespace ToastContextModels {
  export interface ParamsShowToast {
    type: ToastComponentModels.Type;
    title: string;
    duration?: number;
  }

  export type PropsContext = {
    showToast: (params: ParamsShowToast) => void;
  };

  export type PropsProvider = PropsWithChildren;

  export interface State extends ParamsShowToast {
    isVisible?: boolean;
  }
}
```

Required members: `PropsContext` (what the context exposes), `PropsProvider`
(always `PropsWithChildren`), `State` (what the provider holds).

```ts
// toast.constants.ts
export const TOAST_INITIAL_STATE: ToastContextModels.State = {
  isVisible: false,
  type: ToastComponentModels.Type.INFO,
  title: "",
  duration: 3000,
};
```

```ts
// Toast.context.ts
import { createContext } from "react";
import { ToastContextModels } from "./toast.models";

const ToastContext = createContext<ToastContextModels.PropsContext | null>(
  null,
);

export default ToastContext;
```

**The `null` default is mandatory.** It is what lets the hook detect a consumer
mounted outside its provider. Never seed a context with a stub object — that
turns a missing provider into a silent no-op instead of an error.

```tsx
// Toast.provider.tsx
const ToastProvider = ({ children }: ToastContextModels.PropsProvider) => {
  const [toast, setToast] =
    useState<ToastContextModels.State>(TOAST_INITIAL_STATE);

  // ...

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
};

export default ToastProvider;
```

The provider is an arrow-function component with a default export, and its state
is always seeded from the `*_INITIAL_STATE` constant.

### 6.2 Consuming a store — `use<NameStore>.hook.ts`

A context store is **never** consumed with `use(Context)` at the call site. Every
store gets a hook at `<feature|shared>/hooks/use<NameStore>.hook.ts` that
validates the provider is present:

```ts
import { use } from "react";

import { ToastContext } from "@/shared/stores/Toast";
import type { ToastContextModels } from "@/shared/stores/Toast/toast.models";

export function useToast(): ToastContextModels.PropsContext {
  const context = use(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
```

- Screens, components and viewModels import the hook, never the context.
- The guard is required in every store hook.
- Error message format, exactly: `use<X> must be used inside <X>Provider`.

### 6.3 Zustand stores

```txt
<feature|shared>/stores/<NameStore>/
├── index.ts                  # exports the store
├── <nameStore>.store.ts      # zustand implementation
├── <nameStore>.models.ts     # namespace <Name>StoreModels
└── <nameStore>.constants.ts  # initial state and other constants
```

```ts
// theme.models.ts
export namespace ThemeStoreModels {
  export type State = {
    mode: UIThemeModels.Mode | null;
    colors: UIColors.Colors;
  };

  type Action = {
    setTheme(mode: UIThemeModels.Mode | null): void;
  };

  export type Store = State & Action;
}
```

- `State` is exported; `Action` is **not** exported (internal to the namespace).
- `Store = State & Action` is exported and is what `create` is typed with.
- Actions are declared as methods, not as properties holding functions.

For persistence, wrap the store with zustand's `persist` and pass
`zustandPersistentStorage` from `@/core/zustand`. The persistence key must come
from `MobileStorageModels.PERSISTENT_STORES` — never a raw string. Use
`partialize` so only state is written, never the actions.

`src/shared/stores/Session/` is the reference implementation.

**Consumption.** A zustand store needs no provider, so its
`<feature|shared>/hooks/use<NameStore>.hook.ts` only re-exports the store hook:

```ts
export { useSessionStore as useSession } from "@/shared/stores/Session";
```

Selection happens at the call site, one field per call:

```ts
const session = useSession((state) => state.session);
const clearSession = useSession((state) => state.clearSession);
```

Do not wrap the hook itself in `useShallow` — that would re-subscribe the whole
store for every consumer. Reach for `useShallow` only at a call site that really
needs several fields in one selector.

### 6.4 `core/mobileStorage` and `core/zustand`

- `core/mobileStorage` — the MMKV singleton (`MobileStorage`) and its typed
  keys. Two enums in `MobileStorageModels`: `STORAGE_KEYS` for individual
  values, `PERSISTENT_STORES` for zustand store keys. Every new key is added to
  the right enum; storage is never called with a raw string.

  Both enums **must be string enums**, because MMKV is keyed by `string` and a
  numeric enum does not typecheck against it:

  ```ts
  export enum STORAGE_KEYS {
    EXAMPLE = "EXAMPLE",
  }
  ```

  `STORAGE_KEYS` still holds only the `EXAMPLE` placeholder — replace it with
  real keys rather than adding alongside it. `PERSISTENT_STORES` already holds
  `SESSION`, used by `src/shared/stores/Session/`.
- `core/zustand` — `zustandPersistentStorage`, the bridge between zustand
  `persist` and MMKV. Never write a second storage adapter.

`react-native-mmkv` and `react-native-nitro-modules` are native modules: they do
not run in Expo Go, so a development build is required.

## 7. `core/httpClient`

The project's single HTTP client. Depends on `axios` (`1.10.0`).

```txt
core/httpClient/
├── index.ts                   # exports the instance, both classes and the models
├── http.client.factory.ts     # builds the instance consumed by the whole app
├── http.client.ts             # axios implementation
├── http.client.models.ts
├── http.client.error.ts
└── fake/                      # simulated client, used while IS_DEV_MODE is on
    ├── http.client.fake.ts
    ├── fake.responses.ts      # endpoint → response function registry
    └── fake.<endpoint>.ts     # one file per faked endpoint
```

Neither class self-instantiates. `http.client.factory.ts` picks the transport
from `IS_DEV_MODE` and exports the single instance; `index.ts` re-exports it.
Consumers import `httpClient` and type against
`HttpClientModels.HttpClient`, so swapping the transport never reaches a
repository.

### `http.client.ts`

```ts
import axios, { AxiosInstance, AxiosResponse } from "axios";
import { ENV_API_URL } from "@/core/config/env.constants";
import { HttpClientModels } from "./http.client.models";
import { HttpClientError } from "./http.client.error";

export class HttpClient implements HttpClientModels.HttpClient {
  private _fetchInstance: AxiosInstance;
  private readonly _TIME_OUT = 5000;

  constructor() {
    const instanceAxios = axios.create({ timeout: this._TIME_OUT });
    instanceAxios.interceptors.response.use(
      this.responseHandler,
      this.responseError,
    );
    this._fetchInstance = instanceAxios;
  }

  private responseHandler(response: AxiosResponse<any, any>) {
    return response;
  }

  private async responseError(error: any) {
    throw new HttpClientError({ message: error?.message });
  }

  private _makeUrl(url: string): string {
    return `${ENV_API_URL}${url}`;
  }

  async request<TResponse = any, TResquest = HttpClientModels.ParamsRequest>({
    url,
    method,
    data,
    headers,
    signal,
    params,
    validateStatus,
  }: HttpClientModels.Request<TResquest>): Promise<TResponse> {
    const response = await this._fetchInstance.request({
      url: this._makeUrl(url),
      method,
      data,
      headers,
      signal,
      params,
      ...(validateStatus && { validateStatus }),
    });
    return response.data;
  }
}
```

### `http.client.models.ts`

```ts
export namespace HttpClientModels {
  export type ParamsRequest = {
    [key: string]: string | number;
  };

  export enum METHOD {
    POST = "post",
    GET = "get",
    PUT = "put",
    DELETE = "delete",
    PATCH = "patch",
  }

  export type Request<TRequest = ParamsRequest> = {
    url: string;
    method: METHOD;
    data?: TRequest;
    headers?: any;
    signal?: AbortSignal;
    params?: TRequest;
    validateStatus?: (status: number) => boolean;
  };

  export interface HttpClient {
    request<TResponse = any, TRequest = ParamsRequest>(
      data: Request<TRequest>,
    ): Promise<TResponse>;
  }

  export type FakeResponse<TRequest = any, TResponse = any> = (
    request: Request<TRequest>,
  ) => TResponse;
}
```

### `http.client.error.ts`

```ts
interface HttpClientErrorModels {
  message: string;
  details?: any;
}

export class HttpClientError extends Error {
  public readonly details?: any;

  constructor({ message, details }: HttpClientErrorModels) {
    super(message);
    this.name = "HttpClientError";
    this.details = details;
    Object.setPrototypeOf(this, HttpClientError.prototype);
  }
}
```

### `fake/`

`HttpClientFake` implements the same `HttpClientModels.HttpClient` contract, but
resolves a request through the function registered for its url in
`fake.responses.ts` instead of reaching the network. Rules:

- One file per endpoint, `fake.<endpoint>.ts`, exporting a
  `HttpClientModels.FakeResponse`. It **validates the request** (method, params,
  body) and throws `HttpClientError` on invalid input, so a consumer cannot tell
  the two transports apart.
- A fake response returns the **DTO shape**, never a domain entity: the adapters
  downstream must run exactly as they do in production.
- An url with no registered response throws — the fake never resolves silently.
- The latency in `_LATENCY` is deliberate: loading states must behave like they
  do against the real API.

## 7.1 Environment variables

`src/core/config/env.constants.ts` is the **only** place that reads
`process.env`. Everything else imports the exported constants.

```ts
export const ENV_API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
export const IS_DEV_MODE = process.env.EXPO_PUBLIC_IS_DEV_MODE === "true";
```

`babel-preset-expo` rewrites every `process.env.EXPO_PUBLIC_*` read at bundle
time — in SDK 57 into the `expo/virtual/env` module, resolved from the `.env`
files — and that imposes the rules this file follows:

- **Only the `EXPO_PUBLIC_` prefix is exposed to the app.** A variable without it
  is left as a plain `process.env` read, available to the Expo CLI and the app
  config but `undefined` at runtime. Code inside `node_modules` is never
  rewritten.
- **Read them with dot notation.** The Expo docs require static
  `process.env.EXPO_PUBLIC_X`. The SDK 57 preset happens to also rewrite
  `process.env["EXPO_PUBLIC_X"]` and destructuring, but that is not guaranteed
  by the docs — do not rely on it.
- **Values are always strings**, so a boolean is parsed with `=== "true"`; a cast
  would make the string `"false"` truthy.
- **The values ship in plain text** inside the app — never a secret.
- Editing a `.env` file needs a full app reload; a hot reload keeps the value
  already resolved.

### Where each value lives

| File / source   | Committed      | Seen by EAS Build | Use                         |
| --------------- | -------------- | ----------------- | --------------------------- |
| `.env`          | **gitignored** | **no**            | the app's variables, local  |
| `.env.local`    | **gitignored** | **no**            | overrides `.env`            |
| EAS env vars    | —              | yes               | real per-environment values |
| `.env.template` | yes            | —                 | reference of every variable |

`.gitignore` ignores `.env*` and un-ignores `.env.template`, so **no value is
ever versioned**. Two consequences:

1. A fresh clone has no `.env`. Copying `.env.template` to `.env` and filling it
   in is part of the setup — without it `ENV_API_URL` falls back to `""` and
   every request goes out with a relative url.
2. **EAS Build receives no `.env` file at all**, because nothing gitignored is
   uploaded to the build job. Every variable a cloud build needs must exist as
   an EAS environment variable (`eas env:set`, referenced by `environment` in
   `eas.json`, pulled locally with `eas env:pull`). A variable that lives only
   in `.env` silently resolves to the `?? ""` fallback in a build.

Expo loads these with standard dotenv resolution, so `.env.local` overrides
`.env`.

`app.config.js` `extra` + `expo-constants` is the legacy approach and is no
longer recommended; read the variable directly instead.

## 8. End-to-end flow of one action

```txt
src/app/(app)/classes.tsx
  └── <feature>/ui/screens/classList/classList.screen.tsx
        └── hooks/classList.viewModel.hook.ts
              └── hooks/getClasses.hook.ts            (react-query)
                    └── ui/di → classesServiceModule.queries
                          └── domain/useCases/getClasses.useCase.ts
                                ├── validators/getClasses.validator.ts  (zod)
                                └── domain/repositories (contract)
                                      └── infrastructure/repositories/classes.query.repository.ts
                                            ├── core/httpClient
                                            └── infrastructure/adapters/Class.adapter.ts → Entity
```

## 9. Review checklist

- [ ] `domain` imports nothing from `infrastructure`, `ui`, `shared`, or `app`.
- [ ] `infrastructure` imports nothing from `ui`.
- [ ] Repositories return domain entities, never DTOs.
- [ ] Every use case has a matching zod validator.
- [ ] Repositories receive the `httpClient` through the constructor.
- [ ] `src/app/` only re-exports screens and defines navigators.
- [ ] No barrels — no `index.ts` re-exporting more than one file, except a
      screen's `index.ts` and an SDK/library `index.ts` under `src/core/`.
- [ ] Entities and DTOs exposed as namespaces, main model named `Entity`/`Dto`.
- [ ] `interface` instead of `type` wherever possible.
- [ ] `react-query` only inside `ui/screens/*/hooks/<action>.hook.ts` or
      `ui/hooks/`.
- [ ] Every context store defaults to `null` and is consumed only through
      `hooks/use<NameStore>.hook.ts`, which throws when the provider is missing.
- [ ] Zustand store models export `State` and `Store`; `Action` stays internal.
- [ ] Persistence keys come from `MobileStorageModels.PERSISTENT_STORES`, and
      individual keys from `STORAGE_KEYS` — never a raw string.
