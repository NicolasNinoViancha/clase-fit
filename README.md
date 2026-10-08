# clase-fit

Mobile app for booking gym classes. A member signs in, browses the schedule for
the next three days, and reserves a spot in a class that still has room.

Built with Expo SDK 57 + React Native 0.86 + Expo Router, in TypeScript strict
mode, on a feature-sliced Clean Architecture. The backend does not exist yet: a
simulated HTTP transport serves every endpoint, selected by an environment
variable, so the whole data path — DTOs, validation, adapters, repositories —
runs exactly as it will against the real API.

---

## Demo

A recorded walkthrough of the app running on a development build:

[▶ **assets/videos/app_test.mov**](assets/videos/app_test.mov) · 18 MB

<video src="https://raw.githubusercontent.com/NicolasNinoViancha/clase-fit/main/assets/videos/app_test.mov" controls width="320"></video>

> The link opens GitHub's video player. Inline playback depends on the browser —
> `.mov` is a QuickTime container, so Safari handles it best.

---

## Table of contents

- [Demo](#demo)
- [Stack](#stack)
- [Getting started](#getting-started)
- [Commands](#commands)
- [Architecture](#architecture)
- [Established rules](#established-rules)
- [How data flows](#how-data-flows)
- [Implementation details](#implementation-details)
- [Spec-driven workflow](#spec-driven-workflow)
- [State of the migration](#state-of-the-migration)

---

## Stack

| Concern         | Choice                                                       |
| --------------- | ------------------------------------------------------------ |
| Runtime         | Expo SDK `~57.0.27`, React Native `0.86.3`, React `19.2.3`   |
| Language        | TypeScript `~6.0.3`, `strict: true`                          |
| Navigation      | `expo-router` `~57.0.25` (typed routes)                      |
| HTTP            | `axios` `1.10.0` behind a custom client                      |
| Server state    | `@tanstack/react-query` `5.104.1`                            |
| Client state    | `zustand` `5.0.7`                                            |
| Persistence     | `react-native-mmkv` `4.3.2` (+ `react-native-nitro-modules`) |
| Validation      | `zod` `4.6.5`                                                |
| Package manager | npm                                                          |
| Import alias    | `@/*` → `./src/*`                                            |

---

## Getting started

### 1. Install

```bash
npm install
```

### 2. Environment

`.env` is gitignored. Copy the template and fill it in:

```bash
cp .env.template .env
```

| Variable                  | Purpose                                                     |
| ------------------------- | ----------------------------------------------------------- |
| `EXPO_PUBLIC_API_URL`     | Base url every request is prefixed with. No trailing slash. |
| `EXPO_PUBLIC_IS_DEV_MODE` | `"true"` swaps the real client for the simulated transport. |

Set `EXPO_PUBLIC_IS_DEV_MODE=true` to run the app with no backend.

Only the `EXPO_PUBLIC_` prefix reaches the app, those values ship in plain text
inside the bundle, and editing a `.env` file needs a full reload — a hot reload
keeps the value already resolved. `src/core/config/env.constants.ts` is the only
file that reads `process.env`.

### 3. A development build is required

`react-native-mmkv` and `react-native-nitro-modules` are native modules, so
**Expo Go cannot run this app**:

```bash
npx expo run:ios      # or
npx expo run:android
```

`ios/` and `android/` are generated (Continuous Native Generation) — never edit
them by hand. Configure native behavior in `app.json` and config plugins.

### 4. Sign in

While authentication is still mocked, the demo credentials live in
`src/auth/ui/screens/login/login.constants.ts`:

```txt
admin@clasefit.com / clasefit123
```

---

## Commands

```bash
npx expo start              # dev server
npx expo run:ios|android    # build and launch a development build
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install <pkg>      # ALWAYS use this instead of npm install
npx expo install --fix      # fix incompatible package versions
```

Run `npx expo lint` and `npx tsc --noEmit` before considering any task done.

> **Adding packages:** always `npx expo install <pkg>`, never `npm install <pkg>`
> — it resolves the version compatible with the installed SDK.

---

## Architecture

Feature-sliced Clean Architecture on top of Expo Router. Every feature owns
three layers, plus two cross-cutting modules and the navigation layer.

`docs/architecture.md` is the binding reference and holds the code template for
every layer. What follows is the summary.

```txt
src/
├── core/        # cross-feature entities, library config, SDK clients — no UI
├── shared/      # UI shared across features (design system, hooks, theme)
├── app/         # navigators + screen re-exports ONLY — no logic, no UI
└── <feature>/
    ├── domain/          # entities, repository contracts, use cases, validators
    ├── infrastructure/  # DTOs, adapters, payloads, repository implementations
    └── ui/              # di, screens, components, hooks, stores
```

### The dependency rule

```txt
domain          →  (nothing)
infrastructure  →  domain
ui              →  domain, infrastructure
```

Never the reverse. `domain` is the only layer that compiles on its own, and it
is where the business rules live.

### The implemented tree

```txt
src/
├── app/                                    # expo-router
│   ├── _layout.tsx                         # QueryClientProvider + root stack
│   ├── index.tsx                           # session-based redirect
│   ├── (auth)/_layout.tsx · login.tsx
│   └── (app)/_layout.tsx  · home.tsx
│
├── core/
│   ├── config/
│   │   ├── env.constants.ts                # the only reader of process.env
│   │   └── query.client.ts                 # the single QueryClient
│   ├── entities/Session.entity.ts
│   ├── httpClient/
│   │   ├── http.client.factory.ts          # picks the transport from IS_DEV_MODE
│   │   ├── http.client.ts                  # axios implementation
│   │   ├── http.client.models.ts · http.client.error.ts
│   │   └── fake/                           # simulated transport
│   │       ├── http.client.fake.ts
│   │       ├── fake.responses.ts           # url → handler registry
│   │       ├── home/gymClasses/
│   │       │   ├── gymClasses.data.ts      # in-memory records
│   │       │   ├── fake.listGymClasses.ts  # GET  /gymClasses
│   │       │   └── fake.bookGymClass.ts    # POST /gymClasses/book
│   │       └── auth/users/
│   │           ├── users.data.ts
│   │           └── fake.users.ts           # GET  /users
│   ├── mobileStorage/                      # MMKV singleton + typed keys
│   └── zustand/                            # zustandPersistentStorage middleware
│
├── shared/
│   ├── components/                         # design system (themed-*)
│   ├── constants/theme.ts                  # colors, spacing, fonts
│   ├── hooks/useSession.hook.ts
│   └── stores/Session/                     # persisted zustand store
│
├── home/                                   # fully migrated — the reference
│   ├── domain/
│   │   ├── entities/GymClasses.entity.ts
│   │   ├── repositories/home.repository.models.ts
│   │   └── useCases/
│   │       ├── getListGymClasses.useCase.ts
│   │       ├── bookGymClass.useCase.ts     # RN-01 to RN-03 live here
│   │       └── validators/bookGymClass.validator.ts
│   ├── infrastructure/
│   │   ├── DTOs/GymClasses.dto.ts · BookGymClass.dto.ts
│   │   ├── adapters/GymClasses.adapter.ts  # DTO → Entity, with zod
│   │   ├── payloads/bookGymClass.payload.ts# Entity → DTO
│   │   └── repositories/
│   │       ├── home.query.repository.ts
│   │       └── home.write.repository.ts
│   └── ui/
│       ├── di/home.service.module.ts       # wires repositories into use cases
│       ├── hooks/useGymClasses.hook.ts
│       ├── stores/GymClasses/              # persisted, the screen's render source
│       └── screens/home/
│           ├── home.screen.tsx · home.models.ts
│           ├── home.constants.ts · home.utils.ts
│           ├── hooks/                      # useHomeViewModel, useGetListGymClasses,
│           │                               # useBookGymClass, useBanner
│           └── components/                 # card, section, header, states
│
└── auth/                                   # ui layer only — not migrated yet
    └── ui/screens/login/
```

---

## Established rules

These are non-negotiable. `docs/architecture.md` §9 is the review checklist.

### Layers

- `domain` imports nothing from `infrastructure`, `ui`, `shared` or `app`.
- `infrastructure` imports nothing from `ui`.
- `src/core/` holds no UI, and **never imports a feature**.
- `src/app/` contains navigators and one-line screen re-exports — no logic, no
  UI, no non-route files:

  ```tsx
  // src/app/(app)/home.tsx
  export { default } from "@/home/ui/screens/home";
  ```

### Types

- Entities and DTOs are exposed as TS **namespaces**. The main model is always
  named `Entity` (domain) or `Dto` (backend).
- Prefer `interface` over `type`.

### Domain

- Repository contracts follow **CQRS**: `Query` for reads, `Write` for writes.
- One use case per file, repositories injected through the constructor, a single
  `execute` method.
- Parameter validation with zod through a static
  `<NameUseCase>Validator.validate`.

### Infrastructure

- Repositories receive `core/httpClient` through the constructor and **always
  return domain entities, never DTOs**.
- Conversion is one-directional per folder: `adapters/` does DTO → Entity,
  `payloads/` does Entity → DTO.

### UI

- A screen never calls a use case — it consumes its `viewModel`.
- `react-query` and the `<feature>ServiceModule` are touched **only** inside
  `ui/screens/*/hooks/use<Action>.hook.ts` or `ui/hooks/`.
- **Every hook file name starts with `use`**, matching the hook it exports:
  `useHomeViewModel.hook.ts`, `useBookGymClass.hook.ts`.
- Used by more than one screen → move up to `<feature>/ui/<type>/`. Used by more
  than one feature → move up to `src/shared/`. Promote on a real second
  consumer, not in anticipation of one.

### State

- Stores live in `<feature>/ui/stores/<NameStore>/`, or `src/shared/stores/` when
  more than one feature consumes them.
- Zustand store models export `State` and `Store`; `Action` stays internal to
  the namespace and is declared with methods.
- Persisted stores use `zustandPersistentStorage` from `@/core/zustand`. Never a
  second storage adapter.
- Storage keys are string enums in `MobileStorageModels` — `STORAGE_KEYS` for
  individual values, `PERSISTENT_STORES` for store keys. **Never a raw string.**
- A store is consumed through `use<NameStore>.hook.ts`, with selectors at the
  call site, one field per call.
- A context store is always created with a `null` default, and its hook throws
  `use<X> must be used inside <X>Provider` when the provider is missing.

### Barrels

An `index.ts` that re-exports more than one file is a barrel. Allowed in exactly
three places:

1. a screen's `index.ts`,
2. the `index.ts` of an SDK/library module under `src/core/`,
3. a store's `index.ts`.

Everywhere else, import the concrete file.

### Simulated transport

- One folder per feature, then per resource: `fake/<feature>/<resource>/`.
- One file per endpoint, `fake.<action>.ts`, exporting `<action>Response`. Two
  endpoints never share a file.
- Records live in `<resource>.data.ts`, never inside a handler.
- A fake response returns the **DTO shape**, never an entity, so the adapters
  run exactly as in production.
- Every handler validates method, params and body and throws `HttpClientError`
  on invalid input, so a consumer cannot tell the transports apart.

### Comments

Only the `@toDo` / `@doc` / `@warn` better-comments tags, always in English.
Rationale belongs in `docs/architecture.md` and the OpenSpec design documents,
not in comments that restate the code.

---

## How data flows

### End to end

```txt
src/app/(app)/home.tsx
  └── home/ui/screens/home/home.screen.tsx
        └── hooks/useHomeViewModel.hook.ts            # screen logic, no data access
              ├── hooks/useGetListGymClasses.hook.ts  # react-query
              └── hooks/useBookGymClass.hook.ts       # react-query
                    └── ui/di/home.service.module.ts
                          └── domain/useCases/*.useCase.ts
                                ├── validators/*.validator.ts   (zod)
                                └── domain/repositories (contract)
                                      └── infrastructure/repositories/*
                                            ├── core/httpClient
                                            ├── adapters  → Entity
                                            └── payloads  → Dto
```

### The HTTP client

`core/httpClient` is the project's single client. Neither implementation
self-instantiates: `http.client.factory.ts` picks one from `IS_DEV_MODE` and
exports the instance, so swapping the transport never reaches a repository.

|             | Real (`HttpClient`)         | Simulated (`HttpClientFake`)                 |
| ----------- | --------------------------- | -------------------------------------------- |
| Transport   | axios, 5s timeout           | an in-memory registry                        |
| Base url    | prefixed with `ENV_API_URL` | —                                            |
| Lookup      | the network                 | `fake.responses.ts[url]`, **exact match**    |
| Latency     | real                        | a deliberate 600ms, so loading states behave |
| Unknown url | 404 from the server         | throws — it never resolves silently          |

Both satisfy `HttpClientModels.HttpClient`, and consumers type against the
interface.

Because the registry matches the url exactly, a path-parameter route is not
expressible: `POST /gymClasses/book` carries the ids in its body rather than
being `/gymClasses/:id/book`.

### Endpoints

| Method | Url                | Body / params            | Returns              |
| ------ | ------------------ | ------------------------ | -------------------- |
| `GET`  | `/gymClasses`      | —                        | the class list (DTO) |
| `POST` | `/gymClasses/book` | `{ claseId, usuarioId }` | `boolean`            |
| `GET`  | `/users`           | optional `id`            | user(s) (DTO)        |

`POST /gymClasses/book` answers `true` after incrementing the taken spots and
appending the user id; `false` when the class is unknown, is full, or already
holds that user. The boolean is the whole contract — it carries no reason.

### Crossing the boundary

The payload is Spanish-keyed and partial by nature. The adapter is the only
place that knows it:

```txt
{ nombre, instructor, diaOffset, hora, duracionMin, cupoTotal, ocupados, usuariosReservados }
                                   │
                      GymClassesAdapter (zod)
                                   ↓
{ name, instructor, dayOffset, hour, duration, totalCapacity, occupied, isFull, bookedUserIds }
```

- Every DTO property is optional; the zod schema requires each one. A record
  that fails validation is **dropped**, not fixed — one malformed row cannot
  blank the screen.
- `isFull` is **derived** here as `totalCapacity === occupied`; the backend does
  not send it.
- `usuariosReservados` defaults to `[]`, so a class nobody reserved is not
  discarded.
- No layer above the adapter sees a Spanish key or an `undefined`.
- `payloads/` makes the return trip for writes: `{ gymClassId, userId }` →
  `{ claseId, usuarioId }`.

### Who owns what state

| State                                                 | Owner                                             |
| ----------------------------------------------------- | ------------------------------------------------- |
| Request lifecycle (`isPending`, `isError`, `refetch`) | `react-query`                                     |
| The class list                                        | the `GymClasses` zustand store, persisted to MMKV |
| The session                                           | the `Session` zustand store, persisted to MMKV    |
| Screen state (banner, the id in flight)               | the screen's hooks                                |

**The store is the screen's single render source.** Every successful `queryFn`
writes its result to the store with `setGymClasses`, and
`useGetListGymClasses` renders the store — not the query's `data`.
`react-query` drives the fetching, not the rendering. One consequence worth
knowing: `selectUpcomingGymClasses` is applied in exactly one place, and a
local write to the store repaints the screen immediately.

A single `QueryClient` lives in `src/core/config/query.client.ts`
(`staleTime` 60s, `retry` 1) and is mounted once in `src/app/_layout.tsx`.
Change those defaults there, not per hook.

---

## Implementation details

### The schedule

- Covers **three days only** — today, tomorrow and the day after. A class
  carries a `diaOffset` (`0`, `1`, `2`) and an `hora` string, not an absolute
  instant, so its date is resolved against the device clock.
- Classes whose start time has already passed are excluded, and the list is
  ordered by day and then by start time.
- The three day sections always render, so a day with nothing left shows its own
  empty message instead of vanishing.
- A class with room shows `<available> of <total> spots`, where available is
  `totalCapacity - occupied`. **No count of available spots is stored anywhere.**
  A class at capacity is marked `Full` and its reserve action is disabled.
- The stored schedule is shown on reopen without waiting for a fetch — but only
  when it was retrieved on the **current calendar day**. Because `diaOffset` is
  relative to the day of retrieval, a list stored yesterday would otherwise
  render yesterday's classes under _Today_. That guard is why the store records
  `fetchedAt`.

### Booking: the business rules

All three live in `BookGymClassUseCase`, in the `domain` layer.

| ID        | Rule                                        | Message                                |
| --------- | ------------------------------------------- | -------------------------------------- |
| **RN-01** | A class with no spots left cannot be booked | `This class is full.`                  |
| **RN-02** | The same class cannot be booked twice       | `You already booked this class.`       |
| **RN-03** | At most 2 bookings per class day            | `You can only book 2 classes per day.` |

- **Precedence is fixed: RN-02 → RN-01 → RN-03.** A member who already holds a
  spot in a class that has since filled is told they already booked it, not that
  it is full.
- RN-03 counts the member's bookings among the classes of **the same day as the
  class being requested**, so two bookings today do not block tomorrow.
- The rules read the class list the app already holds — the use case receives it
  as a parameter and issues **no extra request**. One booking attempt is one
  `POST`.
- The list it reads is the store's **complete** list, not the narrowed one the
  screen renders: `selectUpcomingGymClasses` drops classes that already started,
  and a booking on one of those must still count toward the daily limit.
- The endpoint repeats the capacity and duplicate checks as its own integrity
  guard. That duplication is deliberate: it is what keeps a stale list from
  corrupting the records.

### Booking: reporting the outcome

The refusal reason is a **domain enum**, not a sentence:

```ts
GymClasses.BOOKING_ERROR = { ALREADY_BOOKED, NO_SPOTS, DAILY_LIMIT };
```

The use case throws the enum member as the `Error` message; the viewModel
catches it and maps it to copy through `resolveBookingMessage`. So `domain`
owns the rule's identity and `ui` owns its wording — the member-facing text can
be rewritten in `home.constants.ts` without touching a business rule, and a
typo in the mapping is a compile error rather than a silently generic notice.

Anything that is not a business rule — an unreachable endpoint, an unknown
class, a validator rejection, or a `false` from the endpoint — falls through to
`We could not book your spot. Please try again.`

The viewModel handles both halves:

```ts
try {
  const isBooked = await bookGymClass({ gymClassId, userId: user.id });
  setBanner(isBooked ? successBanner : genericFailureBanner);
} catch (error) {
  setBanner({ type: "error", message: resolveBookingMessage(error) });
}
```

### Booking: what a success changes

On `true`, the `GymClasses` store applies the booking locally to that one class:

```ts
occupied      → occupied + 1
isFull        → occupied === totalCapacity
bookedUserIds → [...bookedUserIds, userId]
```

`fetchedAt` is deliberately **not** touched — it records when the list was
_retrieved_, and the same-day guard depends on it. A local edit is not a
retrieval. A `false` applies nothing, because nothing changed.

The update is applied _after_ the endpoint confirms, so it is not optimistic and
there is never a count to roll back.

### Booking: the UI

- The outcome is a single `ThemedBanner` pinned **below the schedule**, outside
  the `ScrollView` — inside it, the notice would land under three days of
  classes, out of view for a member who just pressed `Reserve` at the top.
- It is styled as a success or an error, clears itself after 4s, and can be
  dismissed. Each attempt replaces the previous notice instead of stacking.
- Only the card being reserved is disabled. The mutation holds the id in flight
  and exposes `bookingGymClassId`, gated on `isPending`; each card disables its
  own button with `bookingGymClassId === gymClass.id`, so the other cards stay
  usable.

### Persistence

Two MMKV-backed stores, keyed by `MobileStorageModels.PERSISTENT_STORES`:

| Key           | Store        | What persists                |
| ------------- | ------------ | ---------------------------- |
| `SESSION`     | `Session`    | the authenticated user       |
| `GYM_CLASSES` | `GymClasses` | the class list + `fetchedAt` |

`partialize` keeps actions out of storage, and `fetchedAt` is epoch
milliseconds rather than a `Date`, because the persisted value goes through
JSON.

When a persisted shape changes, the app's storage is cleared as part of shipping
it, so old and new record shapes never coexist. No migration mechanism is
maintained.

### Known limitations

- **The booking does not survive a reload.** The simulated transport holds its
  records in module state, so a reload resets `ocupados` and
  `usuariosReservados`. Persisting bookings is the real API's job.
- **The device clock is the only source of truth** for which day a class falls
  on, because the payload ships `diaOffset` + `hora` instead of an absolute
  instant. The real API should send a timestamp — that would also make the
  same-day staleness guard unnecessary.
- **Every booking is attributed to the demo user** (`id: "1"`) until sign-in is
  real, so RN-02 and RN-03 cannot be demonstrated across two members on one
  device. The rules read `userId` from the session and have no knowledge of
  where it came from, so real authentication changes nothing in `domain`.
- **A `false` from the endpoint carries no reason**, so a race shows the generic
  message rather than the exact rule. The real API should answer with a reason
  code the use case can map onto a `BOOKING_ERROR`.
- **Dropping invalid records hides backend problems.** A field renamed by the
  API would silently shrink the list; the adapter is the single place this
  happens and is where logging belongs.

---

## Spec-driven workflow

Product behavior is specified with **OpenSpec** before it is built. Specs
describe **observable behavior only** — architecture conventions belong in
`docs/architecture.md`, never in a spec.

```txt
openspec/
├── config.yaml                 # project context + per-artifact rules
├── specs/                      # the current, authoritative behavior
│   ├── class-schedule/spec.md  # 16 requirements
│   └── class-booking/spec.md   # 17 requirements
└── changes/
    └── archive/                # completed changes, with their reasoning
```

A change carries four artifacts: `proposal.md` (why), `specs/` (what, as a
delta), `design.md` (how, with the alternatives considered) and `tasks.md`.

```bash
/opsx:propose "<description>"   # plan a change
/opsx:apply                     # implement it
/opsx:archive                   # sync the delta into specs/ and archive
```

The archived changes are worth reading: they record _why_ each decision was
taken, including the alternatives that were rejected.

### Commits

Conventional commits, with the project's own type list in
`.claude/skills/conventional-commits/` — it adds `improvement` and raises the
header limit to 200 characters.

## Author

<table>
  <tr>
    <td>
      <img src="https://github.com/NicolasNinoViancha.png" width="110" alt="" />
    </td>
    <td>
      <h3>Nicolás Niño Viancha</h3>
      <p>Mobile developer · React Native &amp; Expo</p>
      <p>
        <a href="https://github.com/NicolasNinoViancha">github.com/NicolasNinoViancha</a><br />
        <a href="mailto:nicolas.nino.work@gmail.com">nicolas.nino.work@gmail.com</a>
      </p>
      <p><em>clase-fit — technical challenge. Expo SDK 57 · feature-sliced Clean Architecture · spec-driven with OpenSpec.</em></p>
    </td>
  </tr>
</table>
