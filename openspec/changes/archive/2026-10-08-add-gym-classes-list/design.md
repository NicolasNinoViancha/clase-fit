# Design

## Context

See `proposal.md` — Why. Requirements live in
`specs/class-schedule/spec.md`.

Constraints that shape the approach:

- `src/home/` has a `ui` layer only. No feature in the project has a `domain`
  or an `infrastructure` layer, no `ui/di` module exists, and no feature owns a
  store. This change creates all of them for `home`, so it becomes the
  reference implementation for the next feature.
- `docs/architecture.md` is binding. Its §8 end-to-end flow is the exact path
  this change wires, and its §6.3 is the shape every store file follows.
- `react-query` is already mounted in `src/app/_layout.tsx` with the client
  from `src/core/config/query.client.ts` (`staleTime` 60s, `retry` 1). Those
  defaults are reused, not changed, and no second `QueryClient` is created.
- `src/shared/stores/Session/` is the canonical persisted zustand store and is
  copied field for field: `persist` + `zustandPersistentStorage` from
  `@/core/zustand`, a key from `MobileStorageModels.PERSISTENT_STORES`, and
  `partialize` so actions are never written.
- The real API does not exist. `IS_DEV_MODE` selects `HttpClientFake`, so the
  endpoint is served from `src/core/httpClient/fake/`.
- The payload is Spanish-keyed and partial-by-nature
  (`nombre`, `diaOffset`, `hora`, `cupoTotal`, `ocupados`), and carries no
  resolved date: only a `diaOffset` and an `hora` string.

## Goals / Non-Goals

**Goals:**

- Wire one full vertical slice through `domain → infrastructure → ui` for a
  read, with nothing skipped and no shortcut import.
- Keep the DTO's Spanish keys and optional properties confined to
  `infrastructure`. No layer above the adapter sees a Spanish key or an
  `undefined`.
- Keep `domain` and `infrastructure` free of any decision about what the screen
  shows: the use case delivers the retrieved classes as entities and nothing
  more.
- Make the stored schedule a first-paint and failure fallback without it ever
  being able to show classes against the wrong dates.

**Non-Goals:**

- Only one use case. `GetListGymClassesUseCase` is the whole domain surface of
  this change; no second use case, and no `validators/` directory.
- No `payloads/` directory and no `Write` repository: this slice is read-only.
- No `SectionList`/`FlatList` virtualization. The payload is ten records and
  the request asked for a `ScrollView`.
- No persistence of the request lifecycle. Only the class list and the moment
  it was retrieved are written; `isPending` and `isError` stay in memory.

## File tree

**Create**

```txt
src/home/
├── domain/
│   ├── entities/
│   │   └── GymClasses.entity.ts
│   ├── repositories/
│   │   └── home.repository.models.ts
│   └── useCases/
│       └── getListGymClasses.useCase.ts
├── infrastructure/
│   ├── DTOs/
│   │   └── GymClasses.dto.ts
│   ├── adapters/
│   │   └── GymClasses.adapter.ts
│   └── repositories/
│       └── home.query.repository.ts
└── ui/
    ├── di/
    │   └── home.service.module.ts
    ├── hooks/
    │   └── useGymClasses.hook.ts
    ├── stores/
    │   └── GymClasses/
    │       ├── index.ts
    │       ├── gymClasses.store.ts
    │       ├── gymClasses.models.ts
    │       └── gymClasses.constants.ts
    └── screens/home/
        ├── home.constants.ts
        ├── home.utils.ts
        ├── hooks/
        │   └── getListGymClasses.hook.ts
        └── components/
            ├── homeHeader.component.tsx
            ├── scheduleSection.component.tsx
            ├── gymClassCard.component.tsx
            ├── scheduleLoading.component.tsx
            ├── scheduleError.component.tsx
            └── sectionEmpty.component.tsx

src/core/httpClient/fake/
└── fake.gymClasses.ts
```

**Modify**

```txt
src/home/ui/screens/home/home.screen.tsx              # header + scrollable sections
src/home/ui/screens/home/home.models.ts               # section and viewModel models
src/home/ui/screens/home/hooks/home.viewModel.hook.ts # grouping, retry, reserve
src/core/mobileStorage/mobileStorage.models.ts         # PERSISTENT_STORES.GYM_CLASSES
src/core/httpClient/fake/fake.responses.ts             # register "/gymClasses"
src/app/(app)/_layout.tsx                              # Stack title "Inicio" -> "Home"
```

**Unchanged**

`src/home/ui/screens/home/index.ts` and `src/app/(app)/home.tsx` already
re-export correctly — the route needs no edit.

## Artifacts by name

| File                                                    | Exposes                                                                             |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `domain/entities/GymClasses.entity.ts`                  | `namespace GymClasses` → `DAY_OFFSET` enum, `Entity`                                |
| `domain/repositories/home.repository.models.ts`         | `namespace HomeRepositoryModels` → `URLs` enum, `Query`                             |
| `domain/useCases/getListGymClasses.useCase.ts`          | `class GetListGymClassesUseCase` → `execute()`                                      |
| `infrastructure/DTOs/GymClasses.dto.ts`                 | `namespace GymClassesDTO` → `Dto`                                                   |
| `infrastructure/adapters/GymClasses.adapter.ts`         | `class GymClassesAdapter` → `toDomain`, `toDomainList` (+ module-private zod schema) |
| `infrastructure/repositories/home.query.repository.ts`  | `class HomeQueryRepository implements HomeRepositoryModels.Query`                    |
| `ui/di/home.service.module.ts`                          | `homeServiceModule` → `{ queries }`                                                 |
| `ui/stores/GymClasses/gymClasses.models.ts`             | `namespace GymClassesStoreModels` → `State`, `Store`                                |
| `ui/stores/GymClasses/gymClasses.store.ts`              | `useGymClassesStore`                                                                |
| `ui/hooks/useGymClasses.hook.ts`                        | `useGymClasses` (re-export of the store hook)                                       |
| `ui/screens/home/home.utils.ts`                         | `selectUpcomingGymClasses`, `resolveStartsAt`, `getSectionDate`                     |

## Decisions

### 1. The domain layer is one use case that fetches and nothing else

```ts
export class GetListGymClassesUseCase {
  constructor(private readonly _repository: HomeRepositoryModels.Query) {}

  async execute(): Promise<GymClasses.Entity[]> {
    try {
      return await this._repository.getListGymClasses();
    } catch (error) {
      // rethrow as a guaranteed Error
    }
  }
}
```

`execute()` takes no parameters, applies no rule and reorders nothing. It
returns the entities as the repository produced them, in the order the endpoint
returned them, and its only behaviour of its own is guaranteeing the caller
sees an `Error` instance on failure.

No second use case and no `validators/` directory are created.

**Deviation from the `docs/architecture.md` §9 checklist, stated explicitly:**
"every use case has a matching zod validator" does not apply to this change.
That item exists to parse a use case's *parameters*, and the only use case here
takes none. zod is still used, one layer down, in the adapter (Decision 3),
which is where external data actually enters the app.

### 2. Visibility and ordering are applied in `select`, not in `domain`

The three-day window, the already-started cut-off and the sort by day and start
time are applied in the `select` of `useQuery`, in
`ui/screens/home/hooks/getListGymClasses.hook.ts`, through a pure helper
`selectUpcomingGymClasses` in `ui/screens/home/home.utils.ts`:

```ts
useQuery({
  queryKey: [HOME_QUERY_KEYS.LIST_GYM_CLASSES],
  queryFn: () => homeServiceModule.queries.getListGymClasses.execute(),
  select: selectUpcomingGymClasses,
});
```

The same helper is applied by hand to the stored list (Decision 5), so the
fetched and the stored schedule are narrowed identically.

This is a deliberate placement: deciding which of the retrieved classes are
worth putting in front of the member is treated as presentation, so it stays in
the layer that renders them, and `domain` keeps no opinion about the screen.

It also removes the problem persistence would otherwise create. `select` runs
over whatever `data` currently is — a fresh response or the stored list — so the
cut-off is re-derived at read time instead of being frozen at fetch time, and a
schedule stored at 17:59 cannot still offer an 18:00 class at 19:30. A
fetch-time filter in the use case would have needed a second use case to
re-derive it on read.

`selectUpcomingGymClasses` is declared at module level, not inline, so its
identity is stable and `react-query` can memoize the derived list against it.

**Accepted trade-off:** these are product rules, written as requirements in
`specs/class-schedule/spec.md`, and they now live in `ui`. A second screen or
feature reading the same use case gets the unfiltered list and has to reapply
them. Keeping the rules in one named helper rather than inline in the hook is
what makes that reapplication a shared import later instead of a rewrite.

Grouping the selected list into the three sections stays in the viewModel, not
in `select`: `select` answers "which classes", the viewModel answers "how the
screen is laid out".

### 3. The adapter maps and validates, and does not reorder

`GymClassesAdapter` holds a module-private zod schema covering **every**
property of `GymClassesDTO.Dto` — each one optional in the DTO type and each one
required by the schema, with `hora` matched against an `HH:mm` pattern and the
capacity fields constrained to non-negative integers. This is the DTO
validation `docs/architecture.md` §4 assigns to adapters.

Two static methods:

- `toDomain(dto)` — maps one record to a `GymClasses.Entity`, throwing when the
  record does not satisfy the schema.
- `toDomainList(response)` — `safeParse`s each record and keeps the ones that
  pass. A non-array response throws.

The adapter does **not** sort, and does not drop a class for any reason other
than failing validation: a record that cannot be turned into a valid entity is
not data the rest of the app can consume (spec: *Invalid class records are
discarded*), whereas a class that has already started is perfectly valid data
that the UI chooses not to show. Dropping an unparseable record here also keeps
one malformed row from blanking the whole screen.

`isFull` is computed here as `totalCapacity === occupied`; it is derived, not a
backend field. Mapping is the adapter's job and `isFull` is a mapping of two
DTO fields onto one entity field, so it does not belong in `select`.

### 4. The repository contract follows CQRS, keeping the requested `URLs` enum

```ts
export namespace HomeRepositoryModels {
  export enum URLs {
    LIST_GYM_CLASSES = "/gymClasses",
  }

  export interface Query {
    getListGymClasses(): Promise<GymClasses.Entity[]>;
  }
}
```

The contract sketched in the request named its main interface `Repository`;
it is named `Query` here because §2 and the review checklist make CQRS
non-negotiable, and `ui/di` exposes it under `queries`. The `URLs` enum and the
`getListGymClasses` signature are kept exactly as sketched.

The namespace keeps the `*Models` suffix from the request, which also matches
the file name `home.repository.models.ts` and the suffix used across the
project (`HttpClientModels`, `MobileStorageModels`, `SessionStoreModels`).

`HomeQueryRepository` receives the `httpClient` through its constructor, issues
`GET HomeRepositoryModels.URLs.LIST_GYM_CLASSES`, and returns
`GymClassesAdapter.toDomainList(response)` — entities, never DTOs.
`home.service.module.ts` is where the two are tied together:

```ts
export const homeServiceModule = {
  queries: {
    getListGymClasses: new GetListGymClassesUseCase(
      new HomeQueryRepository(httpClient),
    ),
  },
} as const;
```

### 5. The store persists the retrieved list and backs the query

The store is written on success and read as the query's fallback:

```txt
getListGymClasses.hook.ts  →  queryFn  →  use case  →  setGymClasses(list)
                           →  data ?? storedUpcomingGymClasses
                           →  both narrowed by the same `select` helper
```

The stored list is narrowed with `selectUpcomingGymClasses` — the same helper
the query passes to `select` — and used whenever the query has no data of its
own: during the first load and, crucially, after a failure.

**`placeholderData` was the original choice here and is wrong.** It is only
served while a query is pending: the moment the query errors, `data` becomes
`undefined` and the placeholder is dropped, so the screen fell back to the
full-screen error with a perfectly good schedule sitting in storage — the exact
case the spec's *Retrieval fails over a stored schedule* describes. This was
caught on the simulator, not in review. The explicit `data ?? stored` fallback
has no such state: it holds through pending, success and error alike. A `@warn`
on the fallback records this so it is not "simplified" back.

*Alternative considered:* `initialData`. Rejected — with the client's 60s
`staleTime` it would be treated as fresh and suppress the refresh the spec
requires.

*Alternative considered:* render from the store only, leaving the query as a
side-effectful fetcher. Rejected — the store would then need its own copy of
the narrowing, which is the duplication this design avoids by reusing one
helper on both paths.

Because the fallback carries the loading state too, `isLoading` is
`isPending && gymClasses.length === 0`: a spinner only when there is genuinely
nothing to show, never over a stored schedule.

### 6. Staleness by calendar day guards the stored list

The stored list is used **only when** `fetchedAt` falls on the current
calendar day; otherwise it is discarded and the screen shows the loading state
until the refresh lands. Because `dayOffset` is relative to the
day the data was retrieved, a list stored yesterday would otherwise render
yesterday's classes under `Today` (spec: *A stored schedule from an earlier day
is not shown*).

The guard sits in the hook, next to the fallback it protects, and is the
reason the store records `fetchedAt` at all.

*Alternative considered:* clear the store on app start when the date changed.
Rejected — it destroys the fallback before knowing whether the refresh will
succeed, and it puts the rule in a lifecycle hook far from the code that reads
the value.

### 7. The store follows §6.3 exactly, and persists only what must survive

```txt
src/home/ui/stores/GymClasses/
├── index.ts                  # export { useGymClassesStore } from "./gymClasses.store";
├── gymClasses.store.ts       # create(persist(...)) with zustandPersistentStorage
├── gymClasses.models.ts      # namespace GymClassesStoreModels
└── gymClasses.constants.ts   # GYM_CLASSES_INITIAL_STATE, GYM_CLASSES_STORE_KEY
```

```ts
export namespace GymClassesStoreModels {
  export type State = {
    gymClasses: GymClasses.Entity[];
    fetchedAt: number | null;
  };

  type Action = {
    setGymClasses(gymClasses: GymClasses.Entity[]): void;
    clearGymClasses(): void;
  };

  export type Store = State & Action;
}
```

- `State` and `Store` are exported, `Action` stays internal, actions are
  declared as methods — §6.3.
- `setGymClasses` stamps `fetchedAt` with `Date.now()` itself, so a list can
  never be stored without the timestamp that decides whether it is still usable.
- `fetchedAt` is epoch milliseconds, not a `Date`: the persisted value goes
  through JSON, and a `Date` would come back as a string.
- `partialize: ({ gymClasses, fetchedAt }) => ({ gymClasses, fetchedAt })`.
- The key is a new `MobileStorageModels.PERSISTENT_STORES.GYM_CLASSES` member,
  added alongside `SESSION`. No raw string reaches storage.
- The unfiltered list is what gets stored, matching what the use case returns.
  Storing the selected list would bake a moment in time into storage.
- The store lives at `src/home/ui/stores/` and not in `src/shared/stores/`
  because only `home` consumes it; §5 promotes it if a second feature ever does.
- Consumed only through `src/home/ui/hooks/useGymClasses.hook.ts`, which
  re-exports the store hook so selectors stay at the call site
  (`useGymClasses((state) => state.gymClasses)`), mirroring
  `src/shared/hooks/useSession.hook.ts`.
- `clearGymClasses` is exposed for completeness but is not called by this
  change: the schedule is gym-wide data, not per-member, so signing out leaves
  it in place.

### 8. The sections are built from the domain's day enum, the labels from the UI

`GymClasses.DAY_OFFSET` (`TODAY = 0`, `TOMORROW = 1`, `DAY_AFTER_TOMORROW = 2`)
is the single source of truth for which days exist; both
`selectUpcomingGymClasses` and the viewModel's bucketing read it, and it is the
one piece of the three-day rule that stays in `domain`, because it describes the
shape of the data and not what the screen does with it.

`home.constants.ts` maps each member to its English label (`Today`, `Tomorrow`,
`Day after tomorrow`). The viewModel always emits all three sections, even empty
ones, which is what lets a day with nothing left render its own empty message
instead of vanishing (spec: *A day with no remaining classes shows an empty
message*).

`home.utils.ts` holds both pieces of date math: `resolveStartsAt(dayOffset,
hour)`, used by the cut-off in `selectUpcomingGymClasses`, and
`getSectionDate(dayOffset)`, which formats the calendar date shown beside each
section label via `Intl.DateTimeFormat`. Both are presentation-side now, so they
sit in one file rather than straddling two layers.

### 9. The screen's four render states

`hooks/getListGymClasses.hook.ts` is the only file that touches `react-query`
and `homeServiceModule`. The viewModel turns its flags into the render
decision:

| Condition                                      | Rendered                                                       |
| ---------------------------------------------- | -------------------------------------------------------------- |
| `isLoading` (pending with nothing to show)     | `scheduleLoading.component.tsx` instead of sections            |
| `isError` and nothing to show                  | `scheduleError.component.tsx`, `variant="screen"`              |
| `isError` with a stored schedule showing       | sections, with `scheduleError` as `variant="banner"` above them |
| otherwise                                      | the three `scheduleSection.component.tsx`                      |

A day-stale stored list is never used as a fallback (Decision 6), so the member
sees the spinner, not yesterday's classes. A failed refresh over a usable stored
list keeps the list on screen with a retry affordance rather than replacing it
with an error (spec: *Retrieval fails over a stored schedule*) — the one
`scheduleError` component covers both placements through its `variant` prop.

Each `scheduleSection` renders its `gymClassCard.component.tsx` list or
`sectionEmpty.component.tsx`. No `refetchInterval` and no pull-to-refresh: the
client's 60s `staleTime` and refetch-on-mount are inherited as-is. `onRetry` is
the query's `refetch`.

A failed request never writes to the store, so a failure can neither blank nor
corrupt the stored schedule.

### 10. The card renders a disabled `Reserve`, with no reserve plumbing

`gymClassCard.component.tsx` shows the class name, the day label, the start
time, the duration in minutes, the instructor, and then either
`"<available> of <total> spots"` or a `Full` badge when `isFull` is true. The
`Reserve` button uses the existing `ThemedButton` and is passed
`disabled={isFull}`.

`onReserve` is exposed by the viewModel as a no-op carrying a single `@toDo`
pointing at the reservation user story. No write repository, use case, payload
or endpoint is created — the button is the visual half of the spec requirement
*A full class cannot be reserved*, nothing more.

Duration is displayed although no requirement asks for it: the entity carries
it, and it is the one field that makes "which class do I go to" answerable
without a detail screen. It is presentation-only, so it is not promoted to a
requirement.

### 11. The fake registry stays decoupled from the feature

`fake.gymClasses.ts` answers `GET /gymClasses` with the ten records in **DTO
shape** — Spanish keys, no `isFull` — so the adapter runs exactly as it will
against the real API. It rejects any method other than `GET` with an
`HttpClientError`, matching `fake.users.ts`, and returns the records in the
order they are written, since ordering is not the transport's concern either.

`fake.responses.ts` registers it under the literal `"/gymClasses"` rather than
importing `HomeRepositoryModels.URLs`: `src/core/` must not depend on a
feature. The literal is pinned with a `@warn` comment on both sides so the pair
stays in sync.

### 12. Reusing the existing design system; no new shared component

The screen is built from `ThemedView`, `ThemedText` and `ThemedButton` with
`Colors`/`Spacing` from `src/shared/constants/theme.ts`. Nothing is added to
`src/shared/components/`: every new component is consumed by this screen only,
so per §5 it stays under the screen's `components/` until a second screen needs
it.

### 13. Pre-existing Spanish copy is translated in this change

`home.screen.tsx` (`Hola, <name>` → `Hi, <name>`, `Cerrar sesión` →
`Sign out`) and the Stack title in `src/app/(app)/_layout.tsx`
(`Inicio` → `Home`) are translated here rather than left behind. Shipping an
English schedule under a Spanish header would make the screen's copy
self-inconsistent, and the spec requires the schedule screen to be in English.

Strings stay hardcoded in the components. No i18n library is introduced: there
is no second locale to serve, and `npx expo install` is the only sanctioned way
to add a dependency, which this change does not need.

## Risks / Trade-offs

- **Product rules live in `ui`.** The three-day window, the cut-off and the
  ordering are requirements in the spec but are enforced in `select`. A second
  consumer of `GetListGymClassesUseCase` receives the raw list and silently
  gets none of them. → Accepted as an explicit choice (Decision 2). Confined to
  one named helper, `selectUpcomingGymClasses`, so promoting it to
  `<feature>/ui/utils/` or into the domain later is a move, not a rewrite.
- **The cut-off is evaluated when `select` recomputes, not on a timer.** A class
  that starts while the screen is open stays visible until the next recompute or
  refetch. → Accepted for this story. Re-deriving on read already makes the
  window far narrower than a fetch-time filter would, and the rule lives in one
  helper, so adding a ticking re-evaluation later needs no spec change.
- **Device clock and timezone are the only source of truth**, and persistence
  widens the blast radius: a clock set back a day makes a stored list look
  current again. → Inherent to a payload that ships `diaOffset` + `hora`
  instead of an absolute instant. Called out so the real API is specified with
  an absolute timestamp, which would also make the day-staleness guard
  unnecessary.
- **The persisted entity shape becomes a compatibility surface.** A later change
  to `GymClasses.Entity` will read records written by this build, and the
  fallback path does not re-validate them. → Bounded: the stored list is only
  used until the refresh lands, and a shape change that breaks rendering is
  caught by the same-day guard within a day. If this proves fragile, parsing the
  stored list through the adapter's schema is the fix. No migration mechanism is
  added.
- **Storage is a native module.** MMKV does not run in Expo Go, so the store
  cannot be verified in it. → The project already requires a development build;
  the verification tasks say so explicitly.
- **Dropping invalid records hides backend problems.** A field renamed by the
  API would silently shrink the list instead of failing loudly. → The adapter is
  the single place this happens, and a day that empties out still renders its
  empty message rather than a blank screen; the real-API task should add logging
  there.
- **The `"/gymClasses"` literal is duplicated** between
  `HomeRepositoryModels.URLs` and the fake registry. → `@warn` comments on both
  sides; the fake throws loudly for an unregistered url, so a drift surfaces on
  first run rather than as an empty list.
- **A disabled `Reserve` button promises something the app cannot do yet.** →
  Explicitly chosen over hiding it, so the full/not-full distinction the spec
  requires is visible; the `@toDo` ties it to the reservation story.
- **Stored capacity counts go stale.** A member can see `2 of 20 spots` from
  storage when the class has since filled. → Bounded by the refresh on every
  mount; the reservation story is where a definitive capacity check belongs.
- **This change sets the precedent for every later feature.** A mistake in the
  layer boundaries gets copied. → Mitigated by keeping the slice minimal (one
  use case, one read, no payloads, no write path) and by the review checklist in
  `docs/architecture.md` §9 being part of the final task.

## Migration Plan

No deployment migration: no existing persisted data is touched. The change
*adds* a `PERSISTENT_STORES.GYM_CLASSES` key, so the first launch after the
change finds nothing under it, produces no fallback and falls through to the
loading state, which is the intended cold-start path.
`PERSISTENT_STORES.SESSION` and its stored value are untouched, so no member is
signed out.

The structural migration is the change itself, built inside-out so the tree is
never half-wired: `domain` → `infrastructure` → `ui/di` → `ui/stores` →
`ui/screens` → `src/app/`. The route re-export already exists, so the screen is
reachable as soon as its viewModel compiles, and `npx expo lint` +
`npx tsc --noEmit` gate the end.

Rollback is a single revert. The only residue is the MMKV entry under
`GYM_CLASSES`, which no reverted code reads; it is orphaned, not harmful, and
`clearGymClasses` or a storage clear removes it.
