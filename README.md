<<<<<<< HEAD
# Reservas Deportivas — base del proyecto

App para reservar canchas de la Dirección de Deportes de Villaguay (Desarrollo para Móviles, UNER).
Esta carpeta es el **punto de partida**: ya tiene la estructura, los tipos del PRD, datos inventados,
la conexión con la API y 4 pantallas de ejemplo. Falta construir el resto entre las seis.

## 1. Cómo arrancar (una sola vez por compu)

1. Instalar [Node.js](https://nodejs.org) (versión LTS) y la app **Expo Go** en el celular.
2. En esta carpeta, en la terminal:
   ```
   npm install
   npm run instalar-extras
   ```
   El segundo comando instala cámara, mapa, ubicación, notificaciones, base de datos, huella, etc.
   **No te lo saltees:** `app.json` ya los nombra y sin instalarlos `expo start` da error.
3. Copiá `.env.example` como `.env` (por ahora dejalo con `EXPO_PUBLIC_USAR_MOCKS=true`).
4. `npm start`, y escaneá el QR con Expo Go (celular y compu en la misma wifi).

## 2. Datos inventados o API real

Se cambia en `.env`, sin tocar ninguna pantalla:

| Quiero | En `.env` |
|---|---|
| Usar datos inventados (`src/mocks`) | `EXPO_PUBLIC_USAR_MOCKS=true` |
| Usar la API real | `EXPO_PUBLIC_USAR_MOCKS=false` y `EXPO_PUBLIC_API_URL=http://<IP de la compu con la API>:3000` |

Usuarios de la API de demo (contraseña de todos: `villaguay2026`):
`emiliano@mail.com` (jugador), `marcelo@villaguay.demo.ar` (encargado), `nahuel@villaguay.demo.ar` (administrador).

Después de cambiar `.env` hay que reiniciar con `npm start`.

## 3. Dónde va cada cosa

| Carpeta | Qué tiene |
|---|---|
| `src/tipos/` | Los tipos del PRD y de la API. **No se tocan.** Si algo no coincide con la API, se avisa a la cátedra. |
| `src/mocks/` | Datos inventados, con los casos feos (día de lluvia, grilla sin turnos libres, fija de los martes, error de red). |
| `src/servicios/` | **Lo único que habla con datos.** Las pantallas nunca importan un mock ni hacen `fetch`. |
| `src/app/` | Las pantallas (Expo Router: cada archivo es una pantalla). |
| `src/componentes/` | Piezas reutilizables. `EstadoPantalla` ya resuelve cargando / error / vacío. |
| `src/tema/` | Colores claros y oscuros, y tamaños de letra grandes. |

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
- Los íconos son `@react-native-vector-icons/ionicons` (no `@expo/vector-icons`). Audio y video: `expo-audio` / `expo-video`. Archivos: la API nueva de `expo-file-system` (`File`, `Directory`, `Paths`).
- Antes de subir: `npm run typecheck` tiene que pasar sin errores.

## 6. Antes del primer build (APK)

1. `npm i -g eas-cli`, `eas login`, `eas build:configure` (te pide crear el proyecto en Expo).
2. `app.json`: el identificador `ar.edu.uner.reservasdeportivas` se puede cambiar, pero **antes del primer build**.
3. `app.json`: reemplazar `REEMPLAZAR_CON_LA_API_KEY_DE_GOOGLE_MAPS` por una API key de Google Maps. Sin eso, el mapa sale en blanco en el APK (en Expo Go anda igual).
4. `eas.json`, perfil `preview`: reemplazar la URL de la API por la pública (Render + Supabase). Una IP de compu no sirve en un APK instalado.
5. Reemplazar el ícono provisorio (`assets/images/icon.png`: PNG cuadrado 1024×1024, sin transparencias) y el splash.
6. `eas build --platform android --profile preview`.
7. Instalar el APK en un teléfono real, con modo avión, sin la compu cerca.

## Qué se probó y qué no

Probado: el proyecto compila sin errores (`tsc`), la lógica de la grilla da lo esperado con los casos feos,
`npm run instalar-extras` instala todo y los plugins de `app.json` resuelven.
**No probado:** correr la app en un teléfono. Si algo falla al abrir en Expo Go, avisen el mensaje exacto.
=======
# TRABAJO-FINAL--Desarrollo-para-moviles
>>>>>>> 76c052d62139c2ba35a289250157c3928bade965
