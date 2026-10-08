# Bitácora de uso de IA

## Herramientas que usé
- **Claude Code** (Opus 5) como agente principal: planeación, implementación y commits.
- **OpenSpec CLI** para el flujo spec-driven (`propose` → `apply` → `archive`).
- **Skills propias del proyecto** en `.claude/skills/` para fijar comportamiento del agente: `commit`, `conventional-commits`, `project-comments` y los wrappers de OpenSpec.
- **`docs/architecture.md`** como contexto de arquitectura inyectado en cada artefacto vía `openspec/config.yaml`.

## Prompts clave (3 a 5)
| # | Fase | Prompt | Qué obtuve |
|---|---|---|---|
| 1 | Planeación | `/opsx:propose` con la HU-02 completa: campo `bookedUserIds`, endpoint POST que retorna booleano, RN-01 a RN-03 validadas en el caso de uso y aviso por banner | Los 4 artefactos del change (`proposal`, `spec` con 17 requirements, `design` con 11 decisiones, `tasks` con 26 pasos) |
| 2 | Corrección de plan | "no uses los datos únicamente de la lista, no realices otro get adicional" | Rediseño: el use case recibe la lista por parámetro en vez de recuperarla; desapareció una desviación de arquitectura y se redujo a un solo request por reserva |
| 3 | Implementación | `/opsx:apply` | Las 26 tareas ejecutadas inside-out (`domain` → `infrastructure` → fake → `ui/di` → `ui/screens`), con `lint` y `tsc` en verde |
| 4 | Organización | "separa las implementaciones fake... agrúpalas en un subfolder del mismo nombre" y luego "sepáralos por feature, home y auth" | `fake/<feature>/<resource>/` con un archivo por endpoint y los registros en `<resource>.data.ts`, más la actualización de `docs/architecture.md` §7 |
| 5 | Cierre | "commitea los cambios" y `/opsx:archive` | 7 commits convencionales agrupados por intención, y el delta sincronizado a `openspec/specs/class-booking/` |

## Errores de la IA que detecté

En general, los errores detectados y resueltos fueron en su mayoría relacionados a
implementaciones que asumía la IA al momento de aplicar el plan a realizar: en algunos
casos de formato, en otros de organización y en otros de implementación a nivel de
código, resultado de una no especificación técnica muy detallada. Esto se solventó con
la creación de skills y el `architecture.md`, que servía de contexto en cada sección
para que el LLM tomara el camino deseado.

| # | Qué hizo mal | Cómo lo detecté | Cómo lo resolví |
|---|---|---|---|
| 1 | **Implementación.** El caso de uso hacía un `GET` adicional para validar las reglas, en vez de usar la lista que la app ya tenía | Al revisar el `design.md` antes de aplicar | Indiqué que recibiera la lista por parámetro. Bajó a un request por reserva y eliminó una desviación de la arquitectura |
| 2 | **Organización.** Metió dos handlers y su estado mutable en un solo archivo `fake.gymClasses.ts` | Al leer el resultado | Pedí un archivo por endpoint, agrupados por feature y recurso. Quedó documentado en `docs/architecture.md` §7 |
| 3 | **Formato.** Nombró los archivos de hook sin el prefijo `use` (`home.viewModel.hook.ts`) | Contraste con la convención de `use<NameStore>.hook.ts` | Renombré todos y corregí la propia doc, que era la que se contradecía entre §5 y §6.2 |
| 4 | **Formato.** Agregó comentarios `@doc`/`@warn` explicando lo que el código ya dice | Revisión del diff; ya había precedente en el commit `5a2c0fb` | Los eliminé. La justificación vive en `design.md`, no en comentarios |
| 5 | **Alcance.** Documentó en el diseño una abstracción futura (promover un hook a `shared` y volverlo genérico) que nadie pidió | Al leer el diseño | Regla explícita: el código vive en el lugar más angosto que lo usa; se promueve con un segundo consumidor real, no antes |
| 6 | **Redacción del spec.** Escribió "lowers the available spots by one", arrancando por el valor derivado en vez del campo que se guarda | Al contrastar con la entidad | Reescrito como dos requirements: `occupied` sube en uno y la capacidad no cambia; los disponibles se derivan |
| 7 | **Proceso.** El primer commit arrastró un renombre que `git mv` había dejado staged, fuera del grupo planeado | Revisé la salida de `git commit` | `reset --soft`, saqué el archivo del index y rehíce el commit. Nada estaba pusheado |

## Resultado de `openspec validate`
```
$ openspec validate --specs --strict
- Validating...
✓ spec/class-booking
✓ spec/class-schedule
Totals: 2 passed, 0 failed (2 items)

$ openspec list --specs
Specs:
  class-booking      requirements 17
  class-schedule     requirements 16

$ openspec list
No active changes found.
```
