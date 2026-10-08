# Design

## Context

See `proposal.md` — Why. Requirements live in `specs/class-booking/spec.md`.

Constraints that shape the approach:

- `src/home/` already has the full slice from `add-gym-classes-list`:
  `domain/{entities,repositories,useCases}`, `infrastructure/{DTOs,adapters,repositories}`,
  `ui/{di,hooks,stores,screens}`. What is missing is everything on the write
  side: no `Write` contract, no `payloads/` directory, no
  `useCases/validators/` directory, and `homeServiceModule` exposes `queries`
  only. This change adds the project's first write path, so it sets the
  precedent the way the read path did.
- `docs/architecture.md` is binding. §3–§5 give the templates, §8 the
  end-to-end flow, §9 the review checklist.
- `react-query` is mounted in `src/app/_layout.tsx` from
  `src/core/config/query.client.ts` (`staleTime` 60s, `retry` 1). The booking
  is a mutation against that same client; no second `QueryClient`, no change to
  those defaults.
- The real API does not exist. `IS_DEV_MODE` selects `HttpClientFake`, whose
  registry in `src/core/httpClient/fake/fake.responses.ts` is keyed by the
  **exact** request url, so a path-parameter route is not expressible there.
- The DTO served by `/gymClasses` is Spanish-keyed and partial-by-nature
  (`nombre`, `diaOffset`, `hora`, `cupoTotal`, `ocupados`), validated and
  mapped in `GymClassesAdapter`.
- `src/home/ui/stores/GymClasses/` holds the **complete, unfiltered** class
  list in MMKV: `useGetListGymClasses.hook.ts`'s `queryFn` calls
  `setGymClasses(gymClasses)` with exactly what the use case returned, before
  `select` narrows anything. That store is the input RN-01 to RN-03 read
  (Decision 4), and it is deliberately not the narrowed array the screen
  renders.
- `onReserve` exists in `useHomeViewModel` as a `@toDo` no-op. Fulfilling it is
  this change, so the `@toDo` is removed rather than reworded.
- The signed-in member's id comes from `useSession((state) => state.session.user)`,
  seeded today by `DEMO_SESSION` in `src/auth/ui/screens/login/login.constants.ts`
  (`id: "1"`). That is a real, stable id, so the booking needs no change to
  `auth` — moving the hardcoded sign-in stays its own `@toDo`.

## Goals / Non-Goals

**Goals:**

- Put every business rule in `domain`, in one use case, so RN-01 to RN-03 are
  enforced in a single place and each refusal carries an identity the UI can
  map to copy without parsing prose.
- Keep the DTO's Spanish keys and the boolean transport confined to
  `infrastructure`.
- Check the three rules without a second network round trip: the class list the
  app already holds is the input, passed into the use case by its caller.
- Reuse the existing design system and add exactly one component to it.

**Non-Goals:**

- No new store and no new persistence key. The reservation is applied to the
  existing `GymClasses` store (Decision 8); no second store is introduced.
- No optimistic update. The store is written *after* the endpoint confirms, so
  there is never a count to roll back (Decision 8).
- No `Toast` context store. §6.1 of `docs/architecture.md` describes one, and
  this change deliberately does not build it (Decision 9).
- No change to how the schedule is filtered, ordered, grouped or stored.

## File tree

**Create**

```txt
src/home/
├── domain/
│   └── useCases/
│       ├── bookGymClass.useCase.ts
│       └── validators/
│           └── bookGymClass.validator.ts
├── infrastructure/
│   ├── DTOs/
│   │   └── BookGymClass.dto.ts
│   ├── payloads/
│   │   └── bookGymClass.payload.ts
│   └── repositories/
│       └── home.write.repository.ts
└── ui/screens/home/
    └── hooks/
        ├── useBookGymClass.hook.ts
        └── useBanner.hook.ts

src/shared/components/
└── themed-banner.tsx

src/core/httpClient/fake/home/gymClasses/
├── gymClasses.data.ts          # FAKE_GYM_CLASSES, shared by both handlers
├── fake.listGymClasses.ts      # GET /gymClasses
└── fake.bookGymClass.ts        # POST /gymClasses/book

src/core/httpClient/fake/auth/users/
├── users.data.ts
└── fake.users.ts               # moved, unchanged behaviour
```

**Modify**

```txt
src/home/domain/entities/GymClasses.entity.ts            # bookedUserIds + BOOKING_ERROR
src/home/domain/repositories/home.repository.models.ts   # Write contract + BOOK_GYM_CLASS url
src/home/infrastructure/DTOs/GymClasses.dto.ts           # usuariosReservados
src/home/infrastructure/adapters/GymClasses.adapter.ts   # map + validate the new field
src/home/ui/di/home.service.module.ts                    # write section
src/home/ui/stores/GymClasses/gymClasses.models.ts       # bookGymClass action + its params
src/home/ui/stores/GymClasses/gymClasses.store.ts        # bookGymClass action
src/home/ui/screens/home/hooks/useGetListGymClasses.hook.ts  # the store becomes the render source
src/home/ui/screens/home/home.constants.ts               # booking copy + mutation key
src/home/ui/screens/home/home.models.ts                  # Banner + viewModel surface
src/home/ui/screens/home/home.utils.ts                   # resolveBookingMessage
src/home/ui/screens/home/hooks/useHomeViewModel.hook.ts    # onReserve, banner state, catch
src/home/ui/screens/home/home.screen.tsx                 # render the banner below the list
src/home/ui/screens/home/components/scheduleSection.component.tsx  # pass the class id up
src/home/ui/screens/home/components/gymClassCard.component.tsx     # pass the class id up
src/shared/constants/theme.ts                            # success color, light + dark
src/core/httpClient/fake/fake.responses.ts               # register "/gymClasses/book"
```

**Unchanged**

`src/app/` — the route already re-exports the screen. `src/home/ui/stores/`,
`src/home/ui/hooks/`, `src/core/mobileStorage/` and
`src/core/config/query.client.ts` are untouched.

## Artifacts by name

| File                                                       | Exposes                                                                              |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `domain/entities/GymClasses.entity.ts`                     | `namespace GymClasses` → `DAY_OFFSET`, **`BOOKING_ERROR`**, `Entity.bookedUserIds`    |
| `domain/repositories/home.repository.models.ts`            | `URLs.BOOK_GYM_CLASS`, **`ParamsWriteBookGymClass`**, **`ParamsBookGymClass`**, **`Write`** |
| `domain/useCases/bookGymClass.useCase.ts`                  | `class BookGymClassUseCase` → `execute(ParamsBookGymClass): Promise<boolean>`         |
| `domain/useCases/validators/bookGymClass.validator.ts`     | `class BookGymClassValidator` → static `validate`                                    |
| `infrastructure/DTOs/BookGymClass.dto.ts`                  | `namespace BookGymClassDTO` → `Dto`                                                  |
| `infrastructure/payloads/bookGymClass.payload.ts`          | `class BookGymClassPayload` → static `toDto`                                         |
| `infrastructure/repositories/home.write.repository.ts`     | `class HomeWriteRepository implements HomeRepositoryModels.Write`                     |
| `infrastructure/adapters/GymClasses.adapter.ts`            | unchanged surface; schema and `_toEntity` cover `usuariosReservados`                  |
| `ui/di/home.service.module.ts`                             | `homeServiceModule.write.bookGymClass`                                               |
| `ui/screens/home/hooks/useBookGymClass.hook.ts`            | `useBookGymClass` → `{ bookGymClass, isBooking, bookingGymClassId }`                 |
| `ui/stores/GymClasses/gymClasses.models.ts`                | `+ ParamsBookGymClass`, `+ Action.bookGymClass`                                      |
| `ui/stores/GymClasses/gymClasses.store.ts`                 | `+ bookGymClass` action — `occupied + 1`, `isFull`, `bookedUserIds`                  |
| `ui/screens/home/hooks/useBanner.hook.ts`                  | `useBanner` → `{ banner, setBanner }`                                                |
| `ui/screens/home/home.utils.ts`                            | `+ resolveBookingMessage(error)`                                                     |
| `shared/components/themed-banner.tsx`                      | `ThemedBanner`, `ThemedBannerProps`                                                  |

## Decisions

### 1. The refusal reason is a domain enum, not a prose string

`GymClasses` gains the vocabulary of a failed booking:

```ts
export namespace GymClasses {
  export enum BOOKING_ERROR {
    ALREADY_BOOKED = "ALREADY_BOOKED",
    NO_SPOTS = "NO_SPOTS",
    DAILY_LIMIT = "DAILY_LIMIT",
  }

  export interface Entity {
    // ...existing fields
    bookedUserIds: string[];
  }
}
```

The use case throws `new Error(GymClasses.BOOKING_ERROR.ALREADY_BOOKED)`, and
the viewModel's `catch` reads `error.message` and maps it to copy through
`resolveBookingMessage`. This is the "validate the message in the catch" the
request asked for, with the string pinned to an enum member instead of a
sentence: the member-facing wording can be rewritten in `home.constants.ts`
without touching `domain`, and a typo in the mapping is a compile error rather
than a silently generic banner.

`BOOKING_ERROR` lives on the entity, not on the use case, because it is part of
the domain vocabulary of a gym class and both the thrower (`domain`) and the
reader (`ui`) already import that namespace. It carries no member-facing text:
`domain` holds the rule's identity, `ui` holds its wording.

*Alternative considered:* a custom `BookingError extends Error` subclass with a
`code` field. Rejected — `instanceof` across the bundler's module boundaries is
the kind of thing that works until it does not, and `HttpClientError` already
needs `Object.setPrototypeOf` to survive it. A string enum compared by value has
no such failure mode.

*Alternative considered:* throwing the English sentence itself. Rejected — it
puts member-facing copy in `domain` and makes the UI's mapping a string match
on prose.

There is deliberately **no** `BOOKING_ERROR` member for "the class is not in the
records" or "the request failed". Those are not business rules; they fall
through to the generic message (Decision 7).

### 2. One use case holds all three rules, over the list it is handed

```ts
export class BookGymClassUseCase {
  constructor(private readonly _repository: HomeRepositoryModels.Write) {}

  async execute({
    gymClasses,
    ...params
  }: HomeRepositoryModels.ParamsBookGymClass): Promise<boolean> {
    try {
      const { gymClassId, userId } = BookGymClassValidator.validate(params);
      const gymClass = gymClasses.find(({ id }) => id === gymClassId);

      if (!gymClass) {
        throw new Error("The gym class is not in the schedule");
      }

      if (gymClass.bookedUserIds.includes(userId)) {
        throw new Error(GymClasses.BOOKING_ERROR.ALREADY_BOOKED);
      }

      if (gymClass.isFull) {
        throw new Error(GymClasses.BOOKING_ERROR.NO_SPOTS);
      }

      const bookedOnSameDay = gymClasses.filter(
        (candidate) =>
          candidate.dayOffset === gymClass.dayOffset &&
          candidate.bookedUserIds.includes(userId),
      );

      if (bookedOnSameDay.length >= MAX_BOOKINGS_PER_DAY) {
        throw new Error(GymClasses.BOOKING_ERROR.DAILY_LIMIT);
      }

      return await this._repository.bookGymClass({ gymClassId, userId });
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }
}
```

Three things this fixes:

- **The rules are in `domain`.** The read path put the three-day window and the
  started-class cut-off in `select` on the `ui` side, and
  `add-gym-classes-list` recorded that as an accepted trade-off. These rules go
  the other way: they decide whether a *write* is permitted, they are not
  presentation, and a second caller must not be able to skip them. There is
  nothing for the UI to re-derive, so there is no reason to lift them out.
- **The reserve order is fixed and documented.** RN-02 → RN-01 → RN-03, which
  the spec pins as a requirement. A member who already holds a spot in a class
  that has since filled is told they already booked it, not that it is full.
- **The data the rules read is an input, not something the use case fetches.**
  `gymClasses` arrives through `execute`, so the attempt costs exactly one
  request — the `POST`. See Decision 4.

`gymClasses` is destructured out of the params and **not** forwarded to the
repository: `bookGymClass({ gymClassId, userId })` is spelled out field by
field, so the class list can never end up in the request body. That is also why
the contract carries two param types (Decision 3).

`MAX_BOOKINGS_PER_DAY = 2` is a module-level constant in the use case file, not
in `ui`: it is the rule's threshold.

RN-03 counts over `candidate.dayOffset === gymClass.dayOffset` — the day of the
class being reserved, which is what "at most two per day" means when a member
can reserve across three days. Counting against today's classes instead would
leave tomorrow and the day after unlimited.

*Alternative considered:* a `CheckBookingRulesUseCase` separate from a
`BookGymClassUseCase`. Rejected — §3 is one `execute` per use case and the rules
have no caller of their own; two use cases would let someone book without
checking.

*Alternative considered:* enforcing the rules in the repository or the endpoint
only. Rejected — a repository maps and transports, and the endpoint answers a
bare boolean with no room for a reason. The member would get "it failed" with no
message.

### 3. The contract carries two param types, and `Write` returns a boolean

```ts
export namespace HomeRepositoryModels {
  export enum URLs {
    LIST_GYM_CLASSES = "/gymClasses",
    BOOK_GYM_CLASS = "/gymClasses/book",
  }

  export interface ParamsWriteBookGymClass {
    gymClassId: string;
    userId: string;
  }

  export interface ParamsBookGymClass extends ParamsWriteBookGymClass {
    gymClasses: GymClasses.Entity[];
  }

  export interface Write {
    bookGymClass(params: ParamsWriteBookGymClass): Promise<boolean>;
  }
}
```

Two types rather than one, because the use case's input and the endpoint's input
are genuinely different: the rules need the class list, the request body needs
two ids and must not carry ten class records. `ParamsBookGymClass` extends the
narrower one, so the two cannot drift apart, and the repository's signature
makes it a compile error to hand the transport the list.

`BookGymClassUseCase` takes only `HomeRepositoryModels.Write`, matching §3's
single-`_repository` template exactly, and is filed under
`homeServiceModule.write`.

**One deviation from `docs/architecture.md`, stated explicitly:** §4 says a
repository "always returns a domain entity, never a DTO".
`Write.bookGymClass` returns `Promise<boolean>`. The endpoint's answer is a
boolean by specification, there is no entity in it, and the rule's purpose —
keeping backend shapes from leaking upward — is satisfied: a boolean is not a
DTO, and `claseId`/`usuarioId` never escape `infrastructure`. Inventing an
entity to wrap one bit would add a type nothing reads.

### 4. The rules read the list the app already holds — no second request

`execute` receives `gymClasses` from its caller instead of retrieving them, so
an attempt is one `POST` and nothing else.

**The caller passes the store's complete list, not the one on screen.**
`useBookGymClass.hook.ts` reads `useGymClasses((state) => state.gymClasses)` —
what `useGetListGymClasses.hook.ts`'s `queryFn` wrote, which is the use case's
full return value before `select` touched it. It deliberately does **not** pass
`useGetListGymClasses().gymClasses`, which has been through
`selectUpcomingGymClasses` and therefore drops every class that has already
started. RN-03 counted over the narrowed array would ignore a reservation on a
class that began an hour ago and let the member reach three on that day, so the
unfiltered list is what makes "at most two per day" true.

The store is a sound source because the query writes to it on every success and
the mutation invalidates the query on every granted reservation, so it tracks
the records as closely as the screen does. Reading it through the zustand
selector rather than `getState()` keeps the project's call-site-selector
convention, and `useMutation` uses the `mutationFn` from the most recent
render, so the list the tap sees is the list the last render saw.

The trade-off is explicit: the rules are now evaluated against data that is as
fresh as the last fetch rather than as fresh as this instant. The endpoint's own
guards are the backstop for the window in between (Decision 6), and what the
member loses in that window is message precision — a generic failure instead of
the exact rule — never a double booking or a lost spot.

*Alternative considered:* calling `getListGymClasses()` inside `execute`.
Rejected — it doubles the round trips per attempt (≈1.2s against the fake's
600ms latency, before the invalidating refetch) to re-fetch a list the app is
already holding and displaying.

*Alternative considered:* passing the narrowed on-screen array. Rejected for the
RN-03 reason above.

The validator covers `gymClassId` and `userId` only; `gymClasses` is taken as
given, because its entries are domain entities that `GymClassesAdapter`'s zod
schema already validated field by field on the way in, and re-parsing them in
`domain` would duplicate that schema.

### 5. The new DTO field keeps the payload's Spanish keys

`GymClassesDTO.Dto` gains `usuariosReservados?: string[]`, and the adapter maps
it to `bookedUserIds`. The booking request body is
`BookGymClassDTO.Dto = { claseId: string; usuarioId: string }`.

The entity field is `bookedUserIds`, exactly as the request specified. The DTO
is the other side of the boundary and every one of its existing keys is Spanish
(`nombre`, `cupoTotal`, `ocupados`); a single English key among them would make
the adapter's translation partial and leave the next reader guessing which side
of the boundary each name belongs to. Keeping the DTO monolingual is what makes
`GymClassesAdapter` worth having.

*Alternative considered:* naming the DTO field `bookedUserIds` too. Rejected for
the consistency reason above — but it is a one-line change in the adapter and
the fake if the real API turns out to use the English name.

In the adapter's zod schema the field is
`z.array(z.string()).default([])`, not required. A class nobody has reserved is
valid data, and an API that omits an empty array must not have the whole record
dropped by the `safeParse` in `toDomainList`. The default is also what
guarantees `bookedUserIds` is an array on every entity the adapter produces, so
`.includes` in the use case cannot meet `undefined`.

`bookGymClass.payload.ts` holds `BookGymClassPayload.toDto` (Entity-side params
→ DTO), creating the `infrastructure/payloads/` directory §4 describes and the
project has not needed until now.

### 6. The endpoint is a flat url, because the fake registry matches exactly

`HomeRepositoryModels.URLs.BOOK_GYM_CLASS = "/gymClasses/book"`, requested with
`HttpClientModels.METHOD.POST` and the payload in `data`.

`HttpClientFake` resolves a request with `this._responses[request.url]`, a plain
object lookup. `/gymClasses/C-01/book` would need a router the fake does not
have, and registering a literal per class id is not a thing. The class id
therefore travels in the body with the user id, which is also what the request
asked for ("reciba como parámetros el id de la clase y el id del usuario").

**The fake is reorganised by feature and then by resource**, because this change
is what first gives a resource two endpoints. `fake.gymClasses.ts` would have
had to hold both handlers plus the records they share, so instead
`fake/home/gymClasses/` holds `fake.listGymClasses.ts`, `fake.bookGymClass.ts`
and `gymClasses.data.ts`, and the pre-existing `/users` endpoint moves to
`fake/auth/users/` — the feature that will consume it once sign-in stops being
hardcoded. A feature or resource with a single endpoint still gets its folder,
so adding the second one never means moving the first, and the layout now reads
the way `src/` does.

The folder names are the only place `fake/` names a feature: `src/core/` still
may not **import** from `src/<feature>/` (§2), so `fake.responses.ts` keeps
pinning each url as a literal. No `index.ts` is added — the registry imports
each concrete file, per the barrel rule in §2. `docs/architecture.md` §7 is
updated with the layout, since it documented one flat `fake.<endpoint>.ts` per
endpoint.

`FAKE_GYM_CLASSES` lives in `gymClasses.data.ts` rather than inside a handler
precisely because the write endpoint mutates it and the read endpoint serves
it — state two files reach has no business hiding in one of them, and its own
file is where the mutation is visible at a glance.

`fake.bookGymClass.ts` increments `ocupados` and pushes the user id onto
`usuariosReservados` on success, so the next `GET /gymClasses` reflects the
reservation — which is what makes the available count drop on screen. It
answers `false` when the class id is unknown, when the class is full, or when
the user id is already present, and throws `HttpClientError` for any method
other than `POST` or a body missing either id, matching how the `users`
handler validates.

The endpoint's guards deliberately duplicate RN-01 and RN-02, and they matter
more now that the rules read a list the app fetched earlier (Decision 4): they
are the backstop that makes a stale list unable to corrupt the records. They are
the backend's own integrity check and carry no reason — a `false`, not a
message. The use case's checks are what produce the member-facing wording. A
`false` the use case did not predict means the records moved since the list was
fetched, and is reported generically (Decision 7).

`fake.responses.ts` registers the literal `"/gymClasses/book"` rather than
importing the enum, because `src/core/` must not depend on a feature — the same
duplication the existing `"/gymClasses"` entry carries.

### 7. The viewModel handles the boolean and the throw as two separate paths

```ts
const onReserve = useCallback(
  async (gymClassId: string) => {
    try {
      const isBooked = await bookGymClass({ gymClassId, userId: user.id });

      setBanner(
        isBooked
          ? { type: "success", message: BOOKING_COPY.success }
          : { type: "error", message: BOOKING_COPY.failed },
      );
    } catch (error) {
      setBanner({ type: "error", message: resolveBookingMessage(error) });
    }
  },
  [bookGymClass, user.id],
);
```

The use case returns the endpoint's boolean rather than converting a `false`
into a throw, so the transport's contract survives all the way up, and the
viewModel covers both halves of "whether the operation succeeded or failed":
`false` is the generic failure, and a throw is a rule with a message.

`resolveBookingMessage` lives in `home.utils.ts` as a pure function over
`unknown`, keyed by `GymClasses.BOOKING_ERROR`, falling back to
`BOOKING_COPY.failed` for anything unrecognised — the unknown class id, a
transport error, a validator rejection. The copy itself is a `BOOKING_COPY`
block in `home.constants.ts` alongside `HOME_COPY`.

`useBookGymClass` in `hooks/useBookGymClass.hook.ts` is the only new file that
touches `react-query` and `homeServiceModule`. It reads the unfiltered class
list from the store (Decision 4) and is a `useMutation` whose `mutationFn`
calls `homeServiceModule.write.bookGymClass.execute({ ...params, gymClasses })`,
exposing `mutateAsync` as `bookGymClass` and `isPending` as `isBooking`. Its
mutation variables stay `{ gymClassId, userId }`, so the viewModel never names
the list and `onReserve` keeps the signature in Decision 11 — supplying the
rules' input is the hook's job, not the screen's.

`mutateAsync` rather than `mutate` is what lets the viewModel keep a real
`try/catch`; the hook sets no `onError`, so the rejection is the viewModel's to
handle.

**Only the card being reserved is disabled.** The hook holds the id of the class
in flight in `useState` — set in `onMutate` from the mutation's variables,
cleared in `onSettled` — and exposes `bookingGymClassId: isPending ? pendingGymClassId : null`.
Gating the id on `isPending` is what guarantees it reads `null` whenever no
attempt is running, whatever order the mutation callbacks fire in. The value
travels down to each card, which disables its own button with
`bookingGymClassId === gymClass.id`, so a double tap cannot submit twice while
the other nine cards stay usable. The viewModel no longer exposes a blanket
`isBooking`.

### 8. The displayed availability moves on invalidation, not optimistically

**The `GymClasses` store is the screen's single render source.** Every
successful `queryFn` already wrote its result there with `setGymClasses`, so
`useGetListGymClasses` reads the store and narrows it with
`selectUpcomingGymClasses`; it no longer renders `data ?? stored`. `react-query`
keeps `isPending`, `isError` and `refetch` — it drives the fetching, not the
rendering.

That is what makes the booking's local update visible. On a `true` the mutation
calls the store's `bookGymClass` action, which for that one class raises
`occupied` by one, recomputes `isFull` as `occupied === totalCapacity`, and
appends the member's id to `bookedUserIds`. The card repaints immediately, and
because the store is persisted, the correct counts survive the app being killed
before any refetch.

`fetchedAt` is deliberately **not** touched by that action: it records when the
list was *retrieved*, and the same-day guard in `useGetListGymClasses` depends on
it. A local edit is not a retrieval.

The mutation still invalidates `[HOME_QUERY_KEYS.LIST_GYM_CLASSES]` afterwards,
so the server stays the authority: the refetch overwrites the store through
`setGymClasses` and corrects the local arithmetic if the records moved. A `false`
skips the store update — nothing changed, so there is nothing to apply.

With a single render source, the old `data ?? stored` fallback and the query's
`select` both disappear, and `selectUpcomingGymClasses` is applied in exactly one
place instead of two.

The mutation inherits the client's `retry: 1`. That is left as-is: a retried
`POST` whose first attempt actually succeeded is answered `false` by the
endpoint's already-booked guard, so the worst case is a generic failure banner
over a reservation that went through, not a double booking.

### 9. The banner is a design-system component, not a screen component

`src/shared/components/themed-banner.tsx` follows the kebab-case naming of its
neighbours (`themed-button.tsx`, `themed-text.tsx`) and exports
`ThemedBanner` + `ThemedBannerProps`:

```ts
export type ThemedBannerProps = {
  type: "success" | "error";
  message: string;
  onDismiss: () => void;
};
```

§5 promotes to `src/shared/` what more than one feature uses, and strictly
speaking only `home` uses this today. It is placed in the design system anyway
because the request asked for it there, and because an outcome notice is a
design-system primitive by nature: the next write path in any feature needs the
same one, and `ScheduleError`'s `variant="banner"` is already a one-off
reimplementation of the same idea inside the screen. `ScheduleError` is left
alone — folding it into `ThemedBanner` would change the schedule's retry
affordance, which no requirement in this change touches.

It is built from `ThemedView`, `ThemedText` and `Spacing`: a
`backgroundElement` surface with a coloured left border and coloured text,
`success` or `danger`, plus a dismiss control. That needs one new token, so
`Colors.light.success` and `Colors.dark.success` are added to
`src/shared/constants/theme.ts` next to the existing `danger` pair. Because
`ThemeColor` is derived from `keyof Colors.light & keyof Colors.dark`, adding to
both halves is what makes `themeColor="success"` typecheck on `ThemedText`.

*Alternative considered:* building the `Toast` context store from §6.1.
Rejected — the request asked for a banner "for now", a provider plus context
plus hook plus guard is four files and a change to `src/app/_layout.tsx`, and a
toast and a banner are not the same affordance. When a second feature needs
notices from outside a screen, `ThemedBanner` is what that store would render.

### 10. The banner renders below the schedule and clears itself

The screen renders it after the `ScrollView`, inside the `SafeAreaView`:

```txt
HomeHeader
ScrollView  ← the three ScheduleSections
ThemedBanner  ← below the list, pinned, outside the scroll
```

"Below the list" is read as the bottom of the screen rather than the bottom of
the scrollable content. Inside the `ScrollView` the banner would land under
three days of classes, out of view for a member who just pressed `Reserve` on a
card near the top — a notice nobody sees is not a notice. Outside it, the banner
sits below the list and stays visible wherever the member has scrolled to.

The banner is a single `HomeScreenModels.Banner | null`, so a second attempt
replaces the first notice instead of stacking. Its state and its expiry live in
`hooks/useBanner.hook.ts`, which holds the `useState` and a `useEffect` keyed on
the banner's identity that clears it after `BOOKING_BANNER_DURATION = 4000`ms
and clears its timer on unmount and on replacement. The hook exposes `banner`
and `setBanner` and nothing else: the viewModel decides *what* the notice says,
the hook owns *how long* it lives, so the viewModel keeps no timer and no
cleanup of its own. `onDismissBanner` stays in the viewModel as
`setBanner(null)`, since dismissing is part of the screen's surface rather than
of the banner's lifecycle.

**Assumption, not specified in the request:** auto-dismiss plus a manual
dismiss. It is recorded as a requirement in the spec so it is a decision on the
record rather than an implementation detail.

Each attempt gets a fresh object identity even when the message repeats, so two
consecutive identical refusals restart the timer rather than letting the first
one's expiry swallow the second.

### 11. The card reports which class to reserve

`onReserve` currently takes no arguments, because nothing could be reserved.
`GymClassCard` now calls `onReserve(gymClass.id)` and
`ScheduleSection` passes the handler straight through unchanged in signature,
so the type change ripples through two components and the viewModel and stops
there.

`GymClassCard` also takes `isBooking` and renders
`disabled={gymClass.isFull || isBooking}`. It deliberately does **not** read
`bookedUserIds`: nothing in this change marks an already-reserved class, so the
`Full` badge stays the only state the card distinguishes.

## Risks / Trade-offs

- **A reservation does not survive an app reload.** `FAKE_GYM_CLASSES` is
  module state in the fake transport, so a reload resets `ocupados` and
  `usuariosReservados`, while the MMKV copy still holds the incremented counts
  until the first refetch overwrites them. → Inherent to having no backend, and
  the refetch on mount corrects the screen within one round trip. Called out so
  the real API is specified to persist reservations per member.
- **The rules are evaluated against the last fetched list, not against the
  records at that instant.** Another member can take the last spot, or the
  member's own reservations can change on another device, after the fetch that
  filled the store. → Deliberate (Decision 4). The endpoint's own guards refuse
  anything the stale list wrongly allowed, so the data cannot go wrong; what
  degrades is the message — a generic failure instead of the exact rule — and
  the invalidating refetch then shows the member the real state. A real API
  should answer with a reason code instead of a bare boolean, so the use case
  could map a server refusal onto the matching `BOOKING_ERROR`; that is a change
  to the endpoint contract, not to the rules.
- **A mixed persisted shape is not a risk here.** The store would otherwise be
  able to hand the rules records written before `bookedUserIds` existed, which
  the validator does not re-parse (Decision 4). The project clears the app's
  storage whenever the persisted shape is touched, so there is no build in which
  old and new records coexist, and no `version`/`migrate` is added to the
  `GymClasses` store.
- **RN-01 and RN-02 are enforced twice**, in the use case and in the fake
  endpoint. → Deliberate (Decision 6): the use case owns the member-facing
  reason, the endpoint owns its own integrity. The duplication is the normal
  client/server pair, and the real API will carry the server half anyway.
- **RN-03 is only reported on press.** A member at their daily limit sees an
  enabled `Reserve` on every class of that day. → Out of scope by the request's
  own shape (validate in the use case, alert in the catch). Because the rule
  lives in `domain`, a later change that disables the button needs new UI, not
  a new rule.
- **`retry: 1` can retry a `POST` that succeeded.** → Bounded by the endpoint's
  already-booked guard, which answers `false` instead of double booking. The
  cost is a misleading generic banner over a successful reservation, visible for
  4 seconds, and corrected by the refetch. Setting `retry: 0` on the mutation
  was considered and left out: it diverges from the client defaults the project
  keeps in one place, and the guard makes the retry harmless to the data.
- **Stored capacity counts and reservations go stale while the app is closed.**
  → Bounded by the refetch on every mount, and the card renders the stored copy
  only until that lands. The endpoint's guards are what keep a stale count from
  turning into a bad write.
- **The `"/gymClasses/book"` literal is duplicated** between
  `HomeRepositoryModels.URLs` and the fake registry. → The fake throws loudly
  for an unregistered url, so a drift fails on the first attempt rather than
  silently. This design is where the pairing is recorded; the code carries no
  comment about it.
- **`ThemedBanner` enters the design system with one consumer.** → Accepted
  (Decision 9). The risk is a shared component shaped by a single use; its
  surface is three props and no layout assumptions, so reshaping it for a second
  consumer is cheap.
- **A pinned banner takes vertical space from the list** on a small device while
  it is shown. → It is 4 seconds and the list is scrollable; the alternative is
  a notice the member can scroll past without seeing.
- **The member id is the demo session's.** Every reservation on a device is
  attributed to `id: "1"` until sign-in is real, so RN-02 and RN-03 cannot be
  demonstrated across two members on one device. → The rules read `userId` from
  the session and have no knowledge of where it came from, so real
  authentication changes nothing in `domain`. The hardcoded sign-in stays its
  existing `@toDo`.
- **This is the project's first write path**, so its shape gets copied. →
  Mitigated by holding to §3–§5 everywhere except the single deviation in
  Decision 3, stated with its reason, and by `docs/architecture.md` §9 being
  part of the final verification task.

## Migration Plan

No data migration, and no migration mechanism. The change is additive — no
persistence key is added or renamed, and `bookedUserIds` defaults to `[]` on
every record the adapter produces — and the stored shape it does touch is
handled by the project's convention of clearing the app's storage whenever the
persisted shape changes. So this change ships with the `GYM_CLASSES` entry
empty: the first launch finds nothing stored, produces no fallback and falls
through to the loading state, which is the intended cold-start path. Signing in
again is part of that reset.

The structural migration is built inside-out so the tree is never half-wired:
`domain` (entity, contract, validator, use case) → `infrastructure` (DTO,
payload, adapter, write repository) → `core/httpClient/fake` (the endpoint the
repository calls) → `ui/di` → `ui/screens` → `src/shared` for the banner and the
token. `src/app/` needs no step. `npx expo lint` and `npx tsc --noEmit` gate the
end, and the verification runs on a development build, since MMKV rules out
Expo Go.

The `@toDo` on `onReserve` in `useHomeViewModel.hook.ts` is deleted as part of the
change: this is the story it points at.

Rollback is a single revert, followed by the same storage clear on the way back,
so no record carrying a `bookedUserIds` the reverted entity does not declare is
left behind.
