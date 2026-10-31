# Reservas Deportivas — base del proyecto

App para reservar canchas de la Dirección de Deportes de Villaguay (Desarrollo para Móviles, UNER).

Esta carpeta es el **punto de partida**: tiene la estructura, los tipos del PRD, datos inventados,
la conexión con la API y cuatro pantallas de ejemplo. Falta construir el resto entre las seis.

## 1. Cómo arrancar (una sola vez por compu)

1. Instalar [Node.js](https://nodejs.org) **22.13 o superior** (lo pide Expo SDK 58) y la app **Expo Go** en el celular.
2. En esta carpeta:
   ```bash
   npm install
   ```
3. Copiar `.env.example` como `.env`:
   ```bash
   copy .env.example .env
   ```
   En macOS/Linux: `cp .env.example .env`. Por ahora dejalo con `EXPO_PUBLIC_USAR_MOCKS=true`.
4. `npm start` y escanear el QR con Expo Go (celular y compu en la misma wifi).

> Las librerías de cámara, mapa, ubicación, notificaciones, SQLite, huella, audio, video y archivos
> **todavía no están instaladas**. Se agregan cuando cada persona empiece su parte, siempre con
> `npx expo install <paquete>` (nunca `npm install` a mano, porque instala versiones incompatibles).
> Ejemplo: `npx expo install expo-camera expo-sqlite`.

## 2. Datos inventados o API real

Se cambia en `.env`, sin tocar ninguna pantalla:

| Quiero | En `.env` |
|---|---|
| Usar datos inventados (`src/mocks`) | `EXPO_PUBLIC_USAR_MOCKS=true` |
| Usar la API real | `EXPO_PUBLIC_USAR_MOCKS=false` y `EXPO_PUBLIC_API_URL=http://<IP de la compu con la API>:3000` |

Después de cambiar `.env` hay que reiniciar con `npm start`.

Usuarios de la API de demo (contraseña de todos: `villaguay2026`):
`emiliano@mail.com` (jugador), `marcelo@villaguay.demo.ar` (encargado), `nahuel@villaguay.demo.ar` (administrador).

> `.env` está ignorado por git. El archivo que se versiona es `.env.example`.

## 3. Dónde va cada cosa

| Carpeta | Qué tiene |
|---|---|
| `src/tipos/` | Los tipos del PRD y de la API. **No se tocan.** Si algo no coincide con la API, se avisa a la cátedra. |
| `src/mocks/` | Datos inventados, con los casos feos (día de lluvia, grilla sin turnos libres, fija de los martes, error de red). |
| `src/servicios/` | **Lo único que habla con datos.** Las pantallas nunca importan un mock ni hacen `fetch`. |
| `src/app/` | Las pantallas (Expo Router: cada archivo es una pantalla). |
| `src/components/` | Piezas reutilizables. `EstadoPantalla` ya resuelve cargando / error / vacío. |
| `src/hooks/` | Hooks compartidos. `useCargar` carga datos de un servicio y devuelve los tres estados. |
| `src/tema/` | Colores claros y oscuros, y tamaños de letra grandes. |
| `src/utilidades/` | Fechas y otras funciones auxiliares. |

Para probar la app sin red: en `src/mocks/config.ts` poné `errorDeRed: true`.

## 4. Quién completa qué

| Parte | Dónde empieza |
|---|---|
| Base y entrega | `app.json`, `eas.json`, builds, ícono definitivo |
| Cuenta y sesión | `src/app/(tabs)/yo.tsx` (hoy es un botón provisorio), `src/servicios/auth.ts`, `sesion.ts` |
| Espacios y mapa | `src/app/(tabs)/index.tsx`, `src/app/espacio/[id].tsx` |
| Grilla y reservas | `src/app/espacio/[id].tsx`, `src/app/(tabs)/reservas.tsx`, `src/servicios/reservas.ts` |
| QR e ingreso | pantalla nueva dentro de `src/app/` |
| Offline y avisos | envolver `src/servicios/` con SQLite; notificaciones locales |

## 5. Reglas del grupo

- Una rama por persona, cambios chicos, y se junta en `main` seguido.
- Ninguna pantalla importa de `src/mocks`. Siempre por `src/servicios`.
- El token va en `expo-secure-store` (`src/servicios/sesion.ts`), nunca en `kv-store`.
- Los íconos son `@react-native-vector-icons/ionicons` (no `@expo/vector-icons`). Audio y video:
  `expo-audio` / `expo-video`. Archivos: la API nueva de `expo-file-system` (`File`, `Directory`, `Paths`).
- Antes de subir:
  ```bash
  npm run typecheck
  npm run lint
  ```
  Los dos tienen que pasar sin errores.

## 6. Antes del primer build (APK)

1. `npm i -g eas-cli`, `eas login` y `eas build:configure` (crea el proyecto en Expo y agrega el `projectId`).
2. El identificador `ar.edu.uner.reservasdeportivas` ya está en `app.json` (`ios.bundleIdentifier` y
   `android.package`). Se puede cambiar, pero **antes del primer build**.
3. `eas.json`: en el perfil `preview`, reemplazar la URL de la API por la pública (Render + Supabase).
   Una IP de compu no sirve en un APK instalado. El perfil `production` tiene el mismo placeholder.
4. Reemplazar el ícono provisorio (`assets/images/icon.png`: PNG cuadrado 1024×1024, sin transparencias)
   y el splash (`assets/images/splash-icon.png`).
5. Si agregan el mapa: instalar `expo-maps` y configurar la API key de Google Maps en `app.json`
   (`android.config.googleMaps.apiKey`). Sin eso, el mapa sale en blanco en el APK.
6. `eas build --platform android --profile preview`.
7. Instalar el APK en un teléfono real, con modo avión, sin la compu cerca.

> En Expo Go funcionan las notificaciones **locales**. Las push remotas en Android no funcionan en
> Expo Go desde SDK 53: para esas hace falta un development build.

## Qué se probó y qué no

Probado: `npm run typecheck` y `npm run lint` pasan, el proyecto bundlea para Android y web con
`npx expo export`, y los casos feos de la grilla dan lo esperado.
**No probado:** correr la app en un teléfono. Si algo falla al abrir en Expo Go, avisen el mensaje exacto.
