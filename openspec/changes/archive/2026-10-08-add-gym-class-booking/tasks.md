# Tasks

## 1. Domain — entity, contract, validator, use case

- [x] 1.1 In `src/home/domain/entities/GymClasses.entity.ts`, add
      `bookedUserIds: string[]` to `Entity` and a string enum
      `BOOKING_ERROR { ALREADY_BOOKED, NO_SPOTS, DAILY_LIMIT }` to the
      `GymClasses` namespace. Verify `npx tsc --noEmit` now fails only where the
      adapter does not yet produce the field, and nowhere else.
- [x] 1.2 In `src/home/domain/repositories/home.repository.models.ts`, add
      `URLs.BOOK_GYM_CLASS = "/gymClasses/book"`, an
      `interface ParamsWriteBookGymClass { gymClassId: string; userId: string }`,
      an `interface ParamsBookGymClass extends ParamsWriteBookGymClass { gymClasses: GymClasses.Entity[] }`,
      and an `interface Write { bookGymClass(params: ParamsWriteBookGymClass): Promise<boolean> }`,
      per design Decision 3. Verify `Query` is unchanged, that `Write` takes the
      narrower type so the class list cannot reach the transport, and that the
      file still imports only from `../entities/GymClasses.entity`.
- [x] 1.3 Create `src/home/domain/useCases/validators/bookGymClass.validator.ts`
      with a module-private zod object over `gymClassId` and `userId`
      (`z.string().min(1)` each) and `class BookGymClassValidator` exposing a
      static `validate` that returns the parsed params, following the §3
      template. Verify the inferred return type is assignable to
      `HomeRepositoryModels.ParamsWriteBookGymClass`, and that the schema does
      not cover `gymClasses` — those entries already passed
      `GymClassesAdapter`'s schema (design Decision 4).
- [x] 1.4 Create `src/home/domain/useCases/bookGymClass.useCase.ts` with
      `MAX_BOOKINGS_PER_DAY = 2` and `class BookGymClassUseCase` taking only
      `HomeRepositoryModels.Write` through the constructor, per design
      Decision 2: destructure `gymClasses` out of the params, validate the two
      ids, locate the class by id, then check RN-02
      (`bookedUserIds.includes(userId)`), RN-01 (`isFull`) and RN-03 (classes
      with the same `dayOffset` holding the user id,
      `>= MAX_BOOKINGS_PER_DAY`) **in that order**, each throwing its
      `GymClasses.BOOKING_ERROR` member as the `Error` message, and return the
      repository's boolean. Verify the three checks are in that order, that
      no request is issued other than the write, that `gymClasses` is never
      forwarded to `bookGymClass`, and that the file imports nothing from
      `infrastructure`, `ui` or `shared`.

## 2. Infrastructure — DTO, payload, adapter, write repository

- [x] 2.1 In `src/home/infrastructure/DTOs/GymClasses.dto.ts`, add
      `usuariosReservados?: string[]` to `GymClassesDTO.Dto`. Verify every
      property of `Dto` is still optional.
- [x] 2.2 In `src/home/infrastructure/adapters/GymClasses.adapter.ts`, add
      `usuariosReservados: z.array(z.string()).default([])` to the schema and map
      it to `bookedUserIds` in `_toEntity`, per design Decision 5. Verify a
      record without the field still parses and yields `bookedUserIds: []`, and
      that `npx tsc --noEmit` no longer reports the error from task 1.1.
- [x] 2.3 Create `src/home/infrastructure/DTOs/BookGymClass.dto.ts` exporting
      `namespace BookGymClassDTO` with `interface Dto { claseId: string; usuarioId: string }`.
      Verify the file imports nothing.
- [x] 2.4 Create `src/home/infrastructure/payloads/bookGymClass.payload.ts` with
      `class BookGymClassPayload` exposing a static `toDto` that maps
      `HomeRepositoryModels.ParamsWriteBookGymClass` to `BookGymClassDTO.Dto`,
      creating the `payloads/` directory §4 describes. Verify it takes the
      narrower param type, so a class list cannot be serialized into the body,
      and that no `index.ts` is added to the new directory.
- [x] 2.5 Create `src/home/infrastructure/repositories/home.write.repository.ts`
      with `class HomeWriteRepository implements HomeRepositoryModels.Write`,
      taking `HttpClientModels.HttpClient` through the constructor and issuing
      `POST HomeRepositoryModels.URLs.BOOK_GYM_CLASS` with
      `BookGymClassPayload.toDto(params)` as `data`, returning the boolean and
      rethrowing a `HttpClientError` the way `home.query.repository.ts` does.
      Verify it imports nothing from `ui`.

## 3. Fake transport — the booking endpoint

- [x] 3.1 Split the flat fake by feature and then by resource, per design
      Decision 6: `src/core/httpClient/fake/home/gymClasses/gymClasses.data.ts`
      holding `FakeGymClass` and `FAKE_GYM_CLASSES` with every record seeded
      `usuariosReservados: []`, `home/gymClasses/fake.listGymClasses.ts` holding the
      `GET` handler as `listGymClassesResponse`, and `auth/users/users.data.ts` +
      `auth/users/fake.users.ts` for the existing endpoint. Delete
      `fake.gymClasses.ts` and `fake.users.ts`, and add no `index.ts`. Verify
      `GET /gymClasses` still returns the ten records in DTO shape and the
      schedule renders unchanged.
- [x] 3.2 Create `src/core/httpClient/fake/home/gymClasses/fake.bookGymClass.ts`
      exporting `bookGymClassResponse`, which throws `HttpClientError` for any
      method other than `POST` or a body missing `claseId` or `usuarioId`,
      returns `false` when the class id is unknown, when
      `ocupados === cupoTotal`, or when the user id is already in
      `usuariosReservados`, and otherwise increments `ocupados`, pushes the user
      id and returns `true`. Verify two successive calls for the same class and
      user return `true` then `false`, and that `ocupados` moved by exactly one.
- [x] 3.3 In `src/core/httpClient/fake/fake.responses.ts`, register
      `"/gymClasses/book": bookGymClassResponse`, importing each concrete
      handler file. Verify the literal matches
      `HomeRepositoryModels.URLs.BOOK_GYM_CLASS`, that the file still imports
      nothing from `src/home/`, and update the `fake/` layout in
      `docs/architecture.md` §7, which documented one flat
      `fake.<endpoint>.ts` per endpoint.

## 4. Design system — banner and success token

- [x] 4.1 In `src/shared/constants/theme.ts`, add a `success` color to both
      `Colors.light` and `Colors.dark` next to `danger`. Verify
      `themeColor="success"` typechecks on `ThemedText`, which requires the key
      to exist in both halves of `ThemeColor`.
- [x] 4.2 Create `src/shared/components/themed-banner.tsx` exporting
      `ThemedBanner` and `ThemedBannerProps` (`type: "success" | "error"`,
      `message: string`, `onDismiss: () => void`), built from `ThemedView`,
      `ThemedText` and `Spacing` as a `backgroundElement` surface with a
      coloured left border and `success`/`danger` text plus a dismiss control,
      per design Decision 9. Verify it renders legibly in light and dark mode
      for both types and that `ScheduleError` is left untouched.

## 5. UI wiring — di and the mutation hook

- [x] 5.1 In `src/home/ui/di/home.service.module.ts`, instantiate
      `HomeWriteRepository` with `httpClient` and add a `write` section exposing
      `bookGymClass: new BookGymClassUseCase(homeWriteRepository)`. Verify
      `queries` and its repository instance are unchanged and the module is
      still `as const`.
- [x] 5.2 Create `src/home/ui/screens/home/hooks/useBookGymClass.hook.ts` with
      `useBookGymClass`: read the unfiltered list with
      `useGymClasses((state) => state.gymClasses)` and declare a `useMutation`
      over variables `{ gymClassId, userId }` whose `mutationFn` calls
      `homeServiceModule.write.bookGymClass.execute({ ...variables, gymClasses })`,
      with no `onError`, per design Decisions 4, 7 and 8. On a `true` result call
      the store's `bookGymClass` action and then invalidate
      `[HOME_QUERY_KEYS.LIST_GYM_CLASSES]`; on `false` do neither. Hold the id in
      flight in `useState`, set from `onMutate`'s variables and cleared in
      `onSettled`, and return
      `{ bookGymClass: mutateAsync, isBooking: isPending, bookingGymClassId: isPending ? pendingGymClassId : null }`.
      Verify it reads the store's list and **not**
      `useGetListGymClasses().gymClasses`, which `selectUpcomingGymClasses` has
      already narrowed, and that this and `useGetListGymClasses.hook.ts` are the
      only files in the feature importing `@tanstack/react-query` or
      `homeServiceModule`.
- [x] 5.3 In `src/home/ui/stores/GymClasses/gymClasses.models.ts` add
      `ParamsBookGymClass { gymClassId; userId }` and
      `bookGymClass(params): void` to the internal `Action`, and implement it in
      `gymClasses.store.ts`: for that one class raise `occupied` by one, set
      `isFull` to `occupied === totalCapacity`, and append the user id to
      `bookedUserIds`, leaving every other class and `fetchedAt` untouched.
      Verify `Action` stays unexported and the mapped list is a new array rather
      than a mutation in place.
- [x] 5.4 In `src/home/ui/screens/home/hooks/useGetListGymClasses.hook.ts`, make
      the store the single render source per design Decision 8: drop `data` and
      the query's `select`, and return `selectUpcomingGymClasses` applied to the
      store list behind the `isSameCalendarDay` guard. Verify `isPending`,
      `isError` and `refetch` are still taken from `useQuery` and that the
      `queryFn` still calls `setGymClasses`.

## 6. UI — screen, viewModel, components

- [x] 6.1 In `src/home/ui/screens/home/home.constants.ts`, add
      `BOOKING_BANNER_DURATION = 4000`, `HOME_MUTATION_KEYS.BOOK_GYM_CLASS` and a
      `BOOKING_COPY` block holding `success: "Done! Your spot is booked."`,
      `failed: "We could not book your spot. Please try again."`, and the three
      rule messages `"This class is full."`,
      `"You already booked this class."`,
      `"You can only book 2 classes per day."`. Verify the wording matches
      `specs/class-booking/spec.md` character for character.
- [x] 6.2 In `src/home/ui/screens/home/home.utils.ts`, add a pure
      `resolveBookingMessage(error: unknown): string` that maps each
      `GymClasses.BOOKING_ERROR` member to its `BOOKING_COPY` message and falls
      back to `BOOKING_COPY.failed` for anything else. Verify an unrecognised
      `Error`, a non-`Error` throw and each enum member each return the expected
      string.
- [x] 6.3 In `src/home/ui/screens/home/home.models.ts`, add
      `interface Banner { type: ThemedBannerProps["type"]; message: string }`
      and extend `ViewModel` with `banner: Banner | null`, `isBooking: boolean`,
      `onDismissBanner: () => void`, `onReserve: (gymClassId: string) => void`
      and `bookingGymClassId: string | null` in place of `isBooking`.
      Verify `tsc` now flags the screen and the card, which the next tasks fix.
- [x] 6.4 Create `src/home/ui/screens/home/hooks/useBanner.hook.ts` holding the
      banner's `useState` and a `useEffect` keyed on the banner's identity that
      clears it after `BOOKING_BANNER_DURATION` and clears its timer on unmount
      and on replacement, exposing `{ banner, setBanner }` and nothing else, per
      design Decision 10. Verify the viewModel ends up with no timer and no
      effect of its own.
- [x] 6.4b In `src/home/ui/screens/home/hooks/useHomeViewModel.hook.ts`, delete
      the `@toDo` no-op `onReserve` and replace it with the `try/catch` from
      design Decision 7: read `user.id` from the session, call `bookGymClass`,
      set a success banner on `true`, the generic failure banner on `false`, and
      `resolveBookingMessage(error)` in the `catch`; take `banner`/`setBanner`
      from `useBanner`, and expose `onDismissBanner` as `setBanner(null)`.
      Verify each attempt produces a fresh banner object so two identical
      consecutive refusals restart the timer.
- [x] 6.5 In `src/home/ui/screens/home/components/gymClassCard.component.tsx`,
      call `onReserve(gymClass.id)` and accept `bookingGymClassId`, deriving
      `isBooking` as `bookingGymClassId === gymClass.id` and rendering
      `disabled={gymClass.isFull || isBooking}`. Verify only the card being
      reserved is disabled, that the card still does not read `bookedUserIds`,
      and that the `Full` badge is unchanged.
- [x] 6.6 In `src/home/ui/screens/home/components/scheduleSection.component.tsx`,
      widen `onReserve` to `(gymClassId: string) => void` and pass
      `bookingGymClassId` through to every card. Verify the component adds no
      logic of its own.
- [x] 6.7 In `src/home/ui/screens/home/home.screen.tsx`, render `ThemedBanner`
      after the `ScrollView` and inside the `SafeAreaView` when `banner` is not
      `null`, wired to `onDismissBanner`, and pass `bookingGymClassId` down to
      the sections, per design Decision 10. Verify the banner stays visible when the
      list is scrolled and that the loading and error states are unchanged.

## 7. Hook file naming

- [x] 7.0 Rename every hook file so it starts with `use`, matching the hook it
      exports: `bookGymClass.hook.ts` → `useBookGymClass.hook.ts`,
      `getListGymClasses.hook.ts` → `useGetListGymClasses.hook.ts`,
      `home.viewModel.hook.ts` → `useHomeViewModel.hook.ts`, and the
      pre-existing `src/auth/ui/screens/login/hooks/login.viewModel.hook.ts` →
      `useLoginViewModel.hook.ts`. Update both screen imports, and record the
      rule in `docs/architecture.md` §5 and §9, `AGENTS.md` and
      `openspec/config.yaml`, which documented
      `<nameScreen>.viewModel.hook.ts` and `<action>.hook.ts`. Verify no
      `*.hook.ts` file is left without the prefix.

## 8. Verification

- [x] 8.1 On a development build (`npx expo run:ios` or
      `npx expo run:android` — MMKV rules out Expo Go), clear the app's storage
      first so no record predating `bookedUserIds` is left in the
      `GYM_CLASSES` entry, sign in again, then walk the five outcomes
      against `specs/class-booking/spec.md`: a granted reservation raises the
      class's taken spots by one, so the card shows one spot fewer out of the
      same total, and shows the success banner; reserving the same class
      again shows `You already booked this class.`; a third class on the same
      day shows `You can only book 2 classes per day.`; a class on another day
      is still reservable after that refusal; and reserving the last spot of a
      class marks it `Full`.
- [x] 8.2 Review the change against the `docs/architecture.md` §9 checklist, and
      confirm the single deviation from design Decision 3
      (`Write.bookGymClass` returning a boolean) is the only one. Verify
      reserving issues exactly one request plus the invalidating refetch, and
      that no `index.ts` was added to `payloads/`, `validators/`, `DTOs/`,
      `useCases/` or `components/`.
- [x] 8.3 Run `npx expo lint` and `npx tsc --noEmit` and report the output; both
      must pass with no new warnings.
