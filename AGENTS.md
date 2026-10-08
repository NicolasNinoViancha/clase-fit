This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Architecture

**Read `docs/architecture.md` before writing or moving any file under `src/`.** It is binding and contains the code templates for every layer. Summary:

```txt
src/
├── core/        # cross-feature entities, library config, SDK clients — no UI
├── shared/      # UI shared across features (design system, hooks, utils, theme)
├── app/         # navigators + screen re-exports ONLY — no logic, no UI
└── <feature>/
    ├── domain/          # entities, repository contracts (CQRS), use cases, zod validators
    ├── infrastructure/  # DTOs, adapters, payloads, repository implementations
    └── ui/              # di, screens, components, hooks, stores
```

Dependency direction, never the reverse: `domain` → nothing, `infrastructure` → `domain`, `ui` → `domain` + `infrastructure`.

**State:** stores live in `<feature>/ui/stores/<NameStore>/` (or `src/shared/stores/` when shared). Zustand stores persist through `zustandPersistentStorage` from `@/core/zustand`, keyed by a `MobileStorageModels.PERSISTENT_STORES` enum member; selectors stay at the call site. A context store is created with a `null` default and consumed only through `hooks/use<NameStore>.hook.ts`, which throws when the provider is missing. See §6 of `docs/architecture.md`.

**Barrels** (an `index.ts` re-exporting more than one file) are only allowed in three places: a screen's `index.ts`, an SDK/library `index.ts` under `src/core/`, and a store's `index.ts`.

**Comments:** only the `@toDo` / `@doc` / `@warn` better-comments tags, always in English. Invoke the `project-comments` skill before writing one.

The architecture is only partially in place. Migrated, and usable as reference: `src/core/*`, `src/shared/stores/Session/`, and the screens in `src/auth/ui/screens/login/` and `src/home/ui/screens/home/`. Still missing everywhere: the `domain` and `infrastructure` layers and `ui/di`. The demo credentials in `src/auth/ui/screens/login/login.constants.ts` are a `@toDo` — authenticating belongs in an `auth` use case, not in the viewModel.

`react-native-mmkv` and `react-native-nitro-modules` are native modules, so this app cannot run in Expo Go; use a development build.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/`, and `_layout.tsx` files define navigators. A route file only re-exports a screen: `export { default } from "@/<feature>/ui/screens/<nameScreen>";` — no logic, no UI, no non-route code in `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Spec-driven workflow (OpenSpec)

This project uses OpenSpec. Project-level constraints for OpenSpec artifacts live in `openspec/config.yaml` (`context` and `rules`); business rules live in `openspec/specs/<capability>/spec.md`.

- Plan a change: `/opsx:propose "<description>"` → review the generated artifacts → `/opsx:apply` → `/opsx:archive`.
- Architecture conventions belong in `docs/architecture.md`, not in a spec. Specs describe observable product behavior only.

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
