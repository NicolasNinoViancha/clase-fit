# Respuestas de reflexión

## 1. ¿Qué experiencia previa tenías usando OpenSpec o SDD?

Ninguna. Era mi primer contacto con OpenSpec y con spec-driven development en
general. Me preparé leyendo la documentación oficial de OpenSpec y arranqué
directo sobre el challenge, aprendiendo el ciclo `propose → apply → archive` al
usarlo en vez de antes de usarlo.

## 2. ¿Cómo cambia el rol del desarrollador React Native?

**Antes:** el ciclo arrancaba en el editor. Se leía la HU lo suficiente para
empezar a escribir componentes, y las decisiones técnicas se tomaban mientras se
tipeaba.

**Después:** el desarrollador no piensa en qué código escribir hasta haber
entendido la HU en profundidad. El trabajo se corre hacia adelante —especificar
en detalle las tareas a completar, pensar técnicamente cómo ejecutarlas a nivel
general, revisar el plan resultante— y la ejecución queda al final.

El peso del rol se desplaza de escribir a especificar y revisar.

## 3. ¿Cómo debería trabajar un equipo que usa esta metodología?

**El esfuerzo del equipo se concentra en la especificación de los planes**, que
es donde se toman las decisiones y donde conviene gastar la discusión.

**El entorno de IA del proyecto se estructura, se versiona y se comparte como
cualquier otra dependencia:** modelo a usar, agentes, skills, hooks, frameworks,
MCPs. Un skill que vive solo en la máquina de una persona produce patrones que
nadie acordó.

**`architecture.md` es la fuente de verdad** de los patrones usados y de los
acuerdos que el equipo tomó para implementar el código del proyecto. Es lo que
evita tanto las alucinaciones del modelo como las divergencias que introduce una
configuración local no compartida.

**CI/CD con fases de revisión explícitas, partiendo de que siempre debe dudarse
de lo que se sube.** El código generado entra al pipeline con la misma
desconfianza que cualquier otro.

## 4. ¿Qué ventajas y desventajas ves?

**Ventaja.** El desarrollo de las funcionalidades se dispara cuando el dev tiene
la experiencia y el criterio suficientes: el plan ya resolvió las decisiones, así
que implementar se vuelve mecánico.

**Desventajas.**

- Exige un nivel de seniority mayor. El mismo criterio que acelera la
  implementación es el que, si falta, no está para frenar lo que el modelo asume.
- Tiempo adicional de configuración del entorno: las herramientas de IA y las
  especificaciones no son gratis.
- Es fácil aumentar de manera exponencial la deuda técnica si no se tiene
  suficiente criterio de revisión y se prefiere una salida en volumen antes que
  en calidad. Esa deuda se paga en algún punto.

## 5. ¿Cuándo usarías y cuándo no usarías este método?

**Lo usaría** para la implementación de nuevas features, refactors y
migraciones: trabajos cuyo volumen de archivos generados o modificados es mayor,
donde el plan paga su costo.

**No lo usaría** cuando el cambio es bastante pequeño y puede resolverse
fácilmente mediante un prompt, ni para la corrección de un fix que exige
investigación: ahí todavía no hay qué especificar, porque primero hay que
diagnosticar.
