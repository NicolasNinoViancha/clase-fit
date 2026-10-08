# Proposal

## Why

The schedule already shows a `Reserve` button on every class with room, but
pressing it does nothing: `useHomeViewModel` wires it to a `@toDo` no-op. A
member can see which classes have spots left and cannot take one, so the
schedule is read-only and the gym has no record of who is attending.

HU-02 closes that gap: reserving a class must consume a spot, be attributed to
the member who reserved it, and tell the member whether it worked — while
refusing the three business rules RN-01 to RN-03 with a message that says which
rule was hit.

## What Changes

**Feature:** `src/home/` — existing. It is the only feature that owns gym
classes, and it already has `domain`, `infrastructure`, `ui/di`, `ui/stores`
and the `home` screen in place, so this change extends a wired slice instead of
creating one.

- A member can reserve a class with room. On success the class's taken spots go
  up by one, the member is recorded as a holder of that spot, and the schedule
  reflects the new availability.
- The member is told the outcome of every attempt through a banner below the
  schedule: a confirmation on success, and the message of the rule that
  refused it on failure.
- Three business rules refuse a reservation, each with its own message:
  - **RN-01** — a class with no spots left cannot be reserved.
  - **RN-02** — the same class cannot be reserved twice by the same member.
  - **RN-03** — a member can hold at most two reservations on the same class
    day.
- A refused reservation changes nothing: no spot is consumed and nothing is
  recorded.
- `GymClasses.Entity` gains `bookedUserIds: string[]`, the ids of the members
  holding a spot in that class. It is what RN-02 and RN-03 are evaluated
  against.
- A new write endpoint `POST /gymClasses/book` takes the class id and the user
  id and answers with a boolean. On `true` it has incremented the taken spots
  and appended the user id; on `false` nothing changed.
- The `home` feature gains its first write path: a `Write` repository contract,
  a `BookGymClassUseCase` with its zod validator, a payload (Entity → DTO), a
  write repository implementation, and a `write` section in
  `homeServiceModule`.
- The design system gains a banner component and a `success` color token, both
  under `src/shared/`, because neither exists today and the outcome notice
  needs them.

Not a breaking change: every new field and endpoint is additive, and the
existing read path keeps its behavior.

## Capabilities

### New Capabilities

- `class-booking`: reserving a spot in a scheduled class — what a successful
  reservation does to the class and to the member, which business rules refuse
  one, and what the member is told in each case.

### Modified Capabilities

None. `class-schedule` keeps every requirement it has: its
*A full class cannot be reserved* requirement already describes the disabled
action on a full class, and this change neither changes what the schedule
displays nor how it is ordered, filtered or stored. The reservation's effect on
the displayed availability is a requirement of `class-booking`, because it is
the observable consequence of reserving, not a new rule about browsing.

## Impact

**Affected code — `src/home/`**

- `domain/entities/GymClasses.entity.ts` — `bookedUserIds` on `Entity`, plus
  the enum of booking refusal reasons the UI maps to copy.
- `domain/repositories/home.repository.models.ts` — a `Write` contract and the
  booking url.
- `domain/useCases/bookGymClass.useCase.ts` + its
  `useCases/validators/bookGymClass.validator.ts` — new; the validator
  directory does not exist yet.
- `infrastructure/` — a request DTO, a `payloads/` directory (new in the
  project) and `repositories/home.write.repository.ts`; the existing
  `GymClasses.adapter.ts` maps the new field.
- `ui/di/home.service.module.ts` — a `write` section alongside `queries`.
- `ui/screens/home/` — a `bookGymClass.hook.ts` mutation, banner state and the
  refusal-to-copy mapping in the viewModel, the card passing its class id to
  `onReserve`, and the banner rendered below the schedule.

**Affected code — `src/shared/` and `src/core/`**

- `src/shared/components/themed-banner.tsx` — new design-system component.
- `src/shared/constants/theme.ts` — a `success` color for light and dark.
- `src/core/httpClient/fake/` — reorganised by feature and then by resource:
  `home/gymClasses/` serves the new field and answers the `POST`,
  `auth/users/` takes over the pre-existing endpoint, and `fake.responses.ts`
  registers the new url. `docs/architecture.md` §7 documents the layout.

**Not affected**

`src/app/` needs no edit — the route already re-exports the screen. No store
shape changes and no new persistence key: the reservation is server state,
refetched through `react-query`, not state the device owns.

**Dependencies**

None added. `zod`, `@tanstack/react-query` and `axios` are already installed.

## Out of scope

- **Cancelling a reservation.** No un-book endpoint, use case or action.
- **A "Reserved" marker on the card.** RN-02 is enforced when the member
  presses `Reserve` and answered with a message; the card does not change its
  appearance for a class the member already holds. The button stays enabled
  except when the class is full, which is existing behavior.
- **Disabling `Reserve` once the daily limit is reached.** RN-03 is reported on
  press, not predicted in the card.
- **A list of the member's own reservations**, and any screen other than
  `home`.
- **Real authentication.** The member id comes from the session store, which is
  still seeded by the hardcoded demo credentials in
  `src/auth/ui/screens/login/login.constants.ts`. Moving that into an `auth`
  use case stays the `@toDo` it is today and is not part of this change.
- **A durable backend.** The reservation is held in the in-memory fake
  transport, so it is lost on app reload. Persisting reservations across
  restarts is the real API's job.
- **A toast or notification system.** The outcome notice is the banner the
  request asked for; no `Toast` context store is introduced.
- **i18n.** Copy stays hardcoded in English, consistent with the rest of the
  screen.
