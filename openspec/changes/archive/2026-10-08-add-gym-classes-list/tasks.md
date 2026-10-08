# Tasks

## 1. Domain layer

- [x] 1.1 Create `src/home/domain/entities/GymClasses.entity.ts` with `namespace GymClasses` exposing the `DAY_OFFSET` enum (`TODAY = 0`, `TOMORROW = 1`, `DAY_AFTER_TOMORROW = 2`) and `Entity` (`id`, `name`, `instructor`, `dayOffset`, `hour`, `duration`, `totalCapacity`, `occupied`, `isFull`); verify `npx tsc --noEmit` passes and the file imports nothing from another layer.
- [x] 1.2 Create `src/home/domain/repositories/home.repository.models.ts` with `namespace HomeRepositoryModels` exposing `URLs.LIST_GYM_CLASSES = "/gymClasses"` and `interface Query { getListGymClasses(): Promise<GymClasses.Entity[]> }`; verify it imports only the entity and that `npx tsc --noEmit` passes.
- [x] 1.3 Create `src/home/domain/useCases/getListGymClasses.useCase.ts` with `GetListGymClassesUseCase`, the repository injected through the constructor and a single `execute()` that returns the repository's entities unchanged and rethrows a guaranteed `Error` on failure; verify it neither sorts, filters nor validates — it is the only use case in this change and there is no `validators/` directory.

## 2. Infrastructure layer

- [x] 2.1 Create `src/home/infrastructure/DTOs/GymClasses.dto.ts` with `namespace GymClassesDTO` exposing `Dto` with every property optional (`id`, `nombre`, `instructor`, `diaOffset`, `hora`, `duracionMin`, `cupoTotal`, `ocupados`); verify `npx tsc --noEmit` passes.
- [x] 2.2 Create `src/home/infrastructure/adapters/GymClasses.adapter.ts` with a module-private zod schema requiring all eight DTO properties (`hora` matching `HH:mm`, capacities non-negative integers) plus `GymClassesAdapter.toDomain` (one record, throws when invalid) and `toDomainList` (`safeParse` per record, keeps the ones that pass, throws on a non-array), deriving `isFull` from `cupoTotal === ocupados`; verify by passing a list holding one record with a missing `nombre` and asserting the valid records come back **in the order received**, with no sorting and nothing dropped for any reason other than failed validation.
- [x] 2.3 Create `src/home/infrastructure/repositories/home.query.repository.ts` with `HomeQueryRepository implements HomeRepositoryModels.Query`, the `httpClient` injected through the constructor, calling `GET HomeRepositoryModels.URLs.LIST_GYM_CLASSES` and returning `GymClassesAdapter.toDomainList(response)`; verify it returns entities and never a DTO, and that `npx tsc --noEmit` passes.

## 3. Fake endpoint

- [x] 3.1 Create `src/core/httpClient/fake/fake.gymClasses.ts` exporting a `HttpClientModels.FakeResponse` that throws `HttpClientError` for any method other than `GET` and otherwise returns the ten records in DTO shape (Spanish keys, no `isFull`, written order preserved), following `fake.users.ts`; verify the file exports the DTO shape and carries the `@warn` comment pinning the `"/gymClasses"` url.
- [x] 3.2 Modify `src/core/httpClient/fake/fake.responses.ts` to register `"/gymClasses"` against that response as a literal string (no feature import); verify the app fetches the schedule with `EXPO_PUBLIC_IS_DEV_MODE=true` and that an unregistered url still throws.

## 4. Store and storage key

- [x] 4.1 Modify `src/core/mobileStorage/mobileStorage.models.ts` to add `GYM_CLASSES = "GYM_CLASSES"` to the `PERSISTENT_STORES` string enum alongside `SESSION`; verify `npx tsc --noEmit` passes and `STORAGE_KEYS` is left untouched.
- [x] 4.2 Create `src/home/ui/stores/GymClasses/gymClasses.models.ts` with `namespace GymClassesStoreModels` exporting `State` (`gymClasses`, `fetchedAt: number | null`) and `Store` (`State & Action`), keeping `Action` internal with `setGymClasses` and `clearGymClasses` declared as methods; verify `npx tsc --noEmit` passes and `Action` is not exported.
- [x] 4.3 Create `src/home/ui/stores/GymClasses/gymClasses.constants.ts` with `GYM_CLASSES_INITIAL_STATE` (empty list, `fetchedAt: null`) and `GYM_CLASSES_STORE_KEY` read from `MobileStorageModels.PERSISTENT_STORES.GYM_CLASSES`; verify no raw string is passed as the key.
- [x] 4.4 Create `src/home/ui/stores/GymClasses/gymClasses.store.ts` with `useGymClassesStore` wrapped in `persist` using `zustandPersistentStorage` from `@/core/zustand`, seeded from `GYM_CLASSES_INITIAL_STATE`, `partialize`d to `{ gymClasses, fetchedAt }`, and `setGymClasses` storing the unfiltered list while stamping `fetchedAt` with `Date.now()`; verify on a development build that the list survives a full app restart and that `npx tsc --noEmit` passes.
- [x] 4.5 Create `src/home/ui/stores/GymClasses/index.ts` re-exporting `useGymClassesStore` only; verify it re-exports a single file, matching `src/shared/stores/Session/index.ts`.
- [x] 4.6 Create `src/home/ui/hooks/useGymClasses.hook.ts` re-exporting the store hook as `useGymClasses` with no wrapping and no `useShallow`; verify a call site can select one field at a time, as `src/shared/hooks/useSession.hook.ts` is used.

## 5. Dependency injection

- [x] 5.1 Create `src/home/ui/di/home.service.module.ts` exporting `homeServiceModule = { queries: { getListGymClasses } } as const`, building `HomeQueryRepository` with the `httpClient` from `@/core/httpClient` and injecting it into `GetListGymClassesUseCase`; verify `npx tsc --noEmit` passes and that nothing outside `ui` imports this file.

## 6. Screen wiring

- [x] 6.1 Create `src/home/ui/screens/home/home.constants.ts` with `HOME_QUERY_KEYS.LIST_GYM_CLASSES`, the `GymClasses.DAY_OFFSET` → English label map (`Today`, `Tomorrow`, `Day after tomorrow`) and the screen's copy constants; verify every string is in English.
- [x] 6.2 Create `src/home/ui/screens/home/home.utils.ts` with `resolveStartsAt(dayOffset, hour)`, `getSectionDate(dayOffset)` (`Intl.DateTimeFormat`) and the module-level `selectUpcomingGymClasses(gymClasses)` that drops classes whose `dayOffset` is outside `GymClasses.DAY_OFFSET`, drops classes whose resolved start instant is at or before `now`, and sorts by `dayOffset` then `hour`; verify with a fixed list that an 18:00 class is dropped at 19:30 and kept at 17:30, that a 06:00 class sorts before an 18:00 one, and that the helper is a stable module-level reference.
- [x] 6.3 Create `src/home/ui/screens/home/hooks/getListGymClasses.hook.ts` as the only `react-query` consumer: `useQuery` with the key from `HOME_QUERY_KEYS`, a `queryFn` calling `homeServiceModule.queries.getListGymClasses.execute()` and writing the raw result through `setGymClasses`, `select: selectUpcomingGymClasses`, and `data ?? storedUpcomingGymClasses` as the read path, where the stored list is narrowed by the same helper and only used when `fetchedAt` is on the current calendar day (never `placeholderData`, which is dropped on error); verify no other file imports `@tanstack/react-query` or `homeServiceModule`, that a stored list from an earlier day is discarded, and that a failed request leaves the stored list untouched and still on screen.
- [x] 6.4 Modify `src/home/ui/screens/home/home.models.ts` to add the section model (`dayOffset`, `label`, `date`, `gymClasses`) and extend `ViewModel` with `sections`, `isLoading`, `isError`, `hasGymClasses`, `onRetry` and `onReserve`; verify `npx tsc --noEmit` passes.
- [x] 6.5 Modify `src/home/ui/screens/home/hooks/home.viewModel.hook.ts` to bucket the selected list into the three sections (emitted even when empty) using the label map and `getSectionDate`, keep the session selectors one per call, and expose `onRetry` (the query's `refetch`) and `onReserve` (no-op with a single `@toDo`); verify the three sections are always present and that the viewModel applies no filtering or sorting of its own.
- [x] 6.6 Create `src/home/ui/screens/home/components/gymClassCard.component.tsx` rendering name, day label, start time, duration, instructor, and either `"<available> of <total> spots"` or a `Full` badge, with `ThemedButton` `Reserve` passed `disabled={isFull}`; verify a class with 18 of 20 taken shows `2 of 20 spots` with an enabled button, and a 12 of 12 class shows `Full` with a disabled button.
- [x] 6.7 Create `src/home/ui/screens/home/components/sectionEmpty.component.tsx` rendering the English "no classes" message for a day; verify it renders inside a section that has no classes left.
- [x] 6.8 Create `src/home/ui/screens/home/components/scheduleSection.component.tsx` rendering the day label with its formatted date and then either the cards or `sectionEmpty`; verify a day whose classes have all started still renders with its empty message.
- [x] 6.9 Create `src/home/ui/screens/home/components/scheduleLoading.component.tsx` with an `ActivityIndicator` and English copy; verify it shows on a first load with nothing stored and not over a stored schedule.
- [x] 6.10 Create `src/home/ui/screens/home/components/scheduleError.component.tsx` with English copy, a `Retry` button and a `variant` prop (`"screen"` | `"banner"`); verify the screen variant replaces the sections with nothing stored and the banner variant renders above a stored schedule.
- [x] 6.11 Create `src/home/ui/screens/home/components/homeHeader.component.tsx` with the greeting and the `Sign out` button, both in English; verify it renders `Hi, <name>` and signs the member out.
- [x] 6.12 Modify `src/home/ui/screens/home/home.screen.tsx` to render the header plus a `ScrollView` of the three sections, picking loading / screen-error / banner-error / sections per the design's state table, and consuming only the viewModel; verify all four states render correctly and no logic sits in the screen.

## 7. Navigation copy

- [x] 7.1 Modify `src/app/(app)/_layout.tsx` to set the `home` Stack title to `Home`; verify the header reads `Home` and that `src/app/` still holds no logic or UI beyond the navigator.

## 8. Integration verification

- [x] 8.1 Run the app on a development build against the fake transport and walk the spec scenarios end to end: the three sections ordered and sorted, a started class absent, a full class showing `Full` with a disabled `Reserve`, a day with nothing left showing its empty message, the loading state on a cold start, the stored schedule painting instantly after a restart, and a forced failure showing the banner over a stored schedule and the screen error without one; verify each one matches `specs/class-schedule/spec.md`.
- [x] 8.2 Walk the `docs/architecture.md` §9 review checklist against every file this change touched; verify `domain` imports nothing from `infrastructure`/`ui`, the repository returns entities, the use case holds no filtering or ordering, no disallowed barrel was added, and the persistence key comes from the enum.
- [x] 8.3 Run `npx expo lint` and `npx tsc --noEmit` and report the output; verify both pass with no new warnings.

## Workflow follow-up

- Archive the change with `/opsx:archive` once the implementation is reviewed and accepted.
