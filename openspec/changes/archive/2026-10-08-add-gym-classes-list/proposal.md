# Proposal

## Why

A member opens the app and has no way to know what is on the schedule, so the
home screen currently shows only a greeting and a sign-out button. To decide
which class to attend, a member needs to see the upcoming classes with enough
detail to choose one: what it is, when it runs, who teaches it, and whether
there is still room.

This is also the change that establishes the first real `domain` and
`infrastructure` layers in the codebase. Until now every feature only had a
`ui` layer, so the schedule is built end to end through the architecture in
`docs/architecture.md` and becomes the reference implementation for the
features that follow.

## What Changes

- The **home** screen (existing feature, `src/home/`) gains the class schedule:
  the classes for today, tomorrow and the day after tomorrow, grouped into one
  section per day and ordered by date and time.
- Each class shows its name, the day, the start time, the instructor and the
  remaining capacity as `"<available> of <total> spots"`.
- A class whose start time has already passed is not listed.
- A class with no remaining capacity shows a `Full` badge instead of the spots
  count, and its `Reserve` action is rendered disabled.
- The retrieved schedule is **stored on the device** in a persisted zustand
  store owned by the home feature, so reopening the app paints the schedule
  from storage instead of an empty screen while it refreshes in the background.
- The screen gains explicit **loading**, **error** and **empty** states. Empty
  state is per section: a day with no remaining classes shows its own empty
  message rather than disappearing.
- Every string on the screen is written in **English**, including the strings
  that exist today in Spanish (`Hola, <name>`, `Cerrar sesión`, and the Stack
  title `Inicio` in `src/app/(app)/_layout.tsx`).
- New `GET /gymClasses` endpoint, with a fake response registered in
  `src/core/httpClient/fake/` so the screen works against `IS_DEV_MODE` before
  the real API exists.

### Assumptions recorded

- The source data carries `diaOffset` (`0` = today, `1` = tomorrow, `2` = day
  after tomorrow) and `hora`; the real date is computed by adding `diaOffset`
  to the device's current date. The three section labels are therefore
  **Today**, **Tomorrow** and **Day after tomorrow** — the request mentioned a
  "yesterday" section, which is treated as a slip, since `diaOffset` is never
  negative and the user story only covers the next three days.
- Because `diaOffset` is relative to the day the data was retrieved, a stored
  schedule is only meaningful on that same calendar day. A stored schedule from
  an earlier day is discarded rather than shown against the wrong dates, so the
  store also records when it was filled.
- A DTO is only valid when **every** property is present and of the expected
  type. An invalid record is rejected rather than defaulted.
- `isFull` is derived in the domain entity from `cupoTotal === ocupados`; it is
  not a backend field.
- The schedule is gym-wide data, not per-member data, so signing out does not
  clear it.
- Deciding which of the retrieved classes are still worth showing — the
  three-day window, the already-started cut-off and the ordering — is treated as
  presentation, not as a domain rule, and is applied where the screen reads the
  data. See `design.md` — Decision 2.

## Capabilities

### New Capabilities

- `class-schedule`: what a member sees when browsing the upcoming gym class
  schedule — which classes are listed, how they are grouped and ordered, what
  each one shows, how a previously retrieved schedule is reused, and how the
  screen behaves while loading, on failure, and when a day has nothing left.

### Modified Capabilities

<!-- None: this is the project's first spec. -->

## Impact

**Affected feature:** `src/home/` — existing, currently `ui` only. This change
adds its `domain` and `infrastructure` layers, its `ui/di` module and its first
store, none of which exist anywhere in the project yet.

- **New** — `src/home/domain/` (entity, repository contract, one use case),
  `src/home/infrastructure/` (DTO, adapter, query repository),
  `src/home/ui/di/`, `src/home/ui/stores/GymClasses/` (persisted zustand store)
  with its `src/home/ui/hooks/useGymClasses.hook.ts`, and the components the
  schedule is built from.
- **Modified** — `src/home/ui/screens/home/` (screen, models, viewModel) and
  `src/app/(app)/_layout.tsx` (Stack title translated).
- **Modified** — `src/core/mobileStorage/mobileStorage.models.ts`: a new
  `PERSISTENT_STORES.GYM_CLASSES` key for the store.
- **Modified** — `src/core/httpClient/fake/fake.responses.ts`, plus a new
  `fake.gymClasses.ts` answering `GET /gymClasses` with the DTO shape.
- **Dependencies** — none added. `axios`, `zod`, `@tanstack/react-query`,
  `zustand` and `react-native-mmkv` are already installed. The store writes
  through MMKV, which is a native module, so the app must be exercised on a
  development build — the same requirement the project already has.
- **No change** to `src/shared/stores/Session/`, `src/auth/`, the
  `QueryClient` defaults in `src/core/config/query.client.ts`, or
  `src/core/zustand/`.

## Out of Scope

- **Reserving a class.** The `Reserve` button is rendered and is disabled when
  a class is full, but pressing it does nothing: it carries a `@toDo` and no
  write repository, use case or endpoint is created. The reservation flow is
  its own user story.
- **Cancelling a reservation**, waitlists, and any "my reservations" view.
- **Class detail screen.** Tapping a class does not navigate anywhere.
- **Filtering or searching** by instructor, class name or time.
- **Days beyond the third.** No date picker, no calendar, no pagination.
- **Full offline support.** The stored schedule is a warm start and a read-only
  fallback for a failed refresh; no request queue, no write-behind, no network
  detection is added.
- **Pull-to-refresh and background refetch tuning.** The screen uses the
  `QueryClient` defaults already configured; those defaults are not touched.
- **The real API.** Only the fake transport answers `/gymClasses`.
- **Migrating the login feature.** `src/auth/ui/screens/login/login.constants.ts`
  keeps its hardcoded demo credentials and its `@toDo`; this change does not
  touch `src/auth/`.
- **Translating the rest of the app** or introducing i18n tooling. The Spanish
  strings being translated are only the ones on the home screen and its Stack
  title; strings are hardcoded in English, no locale library is added.
