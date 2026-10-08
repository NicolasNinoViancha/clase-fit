# Checklist de release · ClaseFit

## Listo en el proyecto
- [x] Nombre, `slug` y versión en `app.json` — `clase-fit` / `clase-fit` / `1.0.0`
- [x] `android.package` e `ios.bundleIdentifier` — `com.nicolasninoexpoalternova.clasefit` y `com.nicolasninoexpoalternova.clase-fit`
- [ ] `eas.json` con perfiles preview y production — **no existe**, hay que crearlo (`eas build:configure`)
- [ ] (Bonus) Build instalable · enlace: —

## Falta para Google Play
- [ ] Cuenta de Google Play Console (pago único de USD 25) y verificación de identidad
- [ ] `eas.json` + `eas build --profile production --platform android` (genera AAB)
- [ ] `android.versionCode` o `autoIncrement` en el perfil de producción
- [ ] Ficha de tienda: descripción, ícono 512×512, gráfico destacado 1024×500, capturas
- [ ] Política de privacidad publicada en una URL
- [ ] Formulario de Seguridad de los datos y clasificación de contenido
- [ ] Cuenta de servicio para `eas submit`

## Falta para App Store
- [ ] Cuenta Apple Developer (USD 99/año) y app registrada en App Store Connect
- [ ] `eas build --profile production --platform ios` + `ios.buildNumber` o `autoIncrement`
- [ ] Capturas por tamaño de pantalla y texto promocional
- [ ] Etiquetas de privacidad (App Privacy) y URL de política de privacidad
- [ ] TestFlight para la revisión interna previa
- [ ] Credenciales de `eas submit` (App Store Connect API key)

## Riesgos o bloqueos para publicar
- **La autenticación es falsa.** `login.constants.ts` tiene credenciales hardcodeadas; publicar así expone un acceso de demo. Bloqueante.
- **No hay backend.** Todo corre sobre el transporte simulado con `EXPO_PUBLIC_IS_DEV_MODE=true` y los datos viven en memoria: una reserva se pierde al recargar. Bloqueante.
- **EAS no recibe archivos `.env`** porque están gitignorados. `EXPO_PUBLIC_API_URL` e `EXPO_PUBLIC_IS_DEV_MODE` deben existir como variables de entorno de EAS, o la build resuelve `""` y `false` silenciosamente.
- **Sin pruebas automatizadas.** La verificación hoy es `expo lint`, `tsc --noEmit` y los escenarios de `openspec/specs/`.
- **Las fechas dependen del reloj del dispositivo**: el payload trae `diaOffset` + `hora` en vez de un instante absoluto.
- Los identificadores de iOS y Android difieren por el guion (`clase-fit` vs `clasefit`). Es obligatorio —Android no admite guiones— pero conviene dejarlo registrado.
