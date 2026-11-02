# Reservas Deportivas

App para reservar canchas de la Dirección de Deportes de Villaguay (Desarrollo para Móviles, UNER).

Ya tiene la identidad visual, la sesión con roles (jugador, encargado y administrador), la zona del
personal (agenda, reservas del día y escaneo de QR), los componentes compartidos y la conexión con
la API real. Falta completar las partes del resto del grupo.

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
> **ya están instaladas**. Si hace falta agregar otra, usá siempre `npx expo install <paquete>`
> (nunca `npm install` a mano, porque instala versiones incompatibles).

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
| `src/components/` | Piezas reutilizables: `Boton`, `Tarjeta`, `Etiqueta`, `CampoTexto`, `SelectorFecha` y `EstadoPantalla`. |
| `src/contextos/` | `SesionContexto`: quién entró, su rol y las acciones de ingreso, registro y salida. |
| `src/hooks/` | Hooks compartidos. `useCargar` carga datos de un servicio y devuelve los tres estados. |
| `src/tema/` | Colores claros y oscuros, y tamaños de letra grandes. |
| `src/utilidades/` | Fechas y otras funciones auxiliares. |

Para probar la app sin red: en `src/mocks/config.ts` poné `errorDeRed: true`.

## 4. Pantallas por rol

| Rol | Pestañas | Puede |
|---|---|---|
| Sin cuenta | Espacios, Reservas, Yo | Mirar espacios y grilla. Para reservar se le ofrece ingresar o crear cuenta. |
| `jugador` | Espacios, Reservas, Yo | Reservar, ver sus turnos, mostrar el QR y cancelar. |
| `encargado` / `administrador` | Agenda, Del día, Escanear, Yo | Ver la agenda, los datos de contacto, marcar ausentes y registrar ingresos. |

El layout raíz redirige si alguien intenta abrir una zona que no le corresponde. La API también
valida los permisos y responde `403`.

| Parte | Dónde está |
|---|---|
| Identidad y build | `app.json`, `app.config.ts`, `eas.json`, `assets/images/` |
| Cuenta y sesión | `src/app/(auth)/`, `src/app/(tabs)/yo.tsx`, `src/contextos/SesionContexto.tsx` |
| Espacios y mapa | `src/app/(tabs)/index.tsx`, `src/app/espacio/[id].tsx` |
| Grilla y reservas | `src/app/espacio/[id].tsx`, `src/app/(tabs)/reservas.tsx`, `src/servicios/reservas.ts` |
| Personal y QR | `src/app/(tabs)/agenda.tsx`, `reservas-dia.tsx`, `escanear.tsx`, `src/servicios/personal.ts` |
| Offline y avisos | pendiente: SQLite y notificaciones locales |

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

1. `npx eas-cli@latest login` y `npx eas-cli@latest build:configure` (crea el proyecto en Expo y agrega el `projectId`).
2. El identificador `ar.edu.uner.reservasdeportivas` ya está en `app.json` (`ios.bundleIdentifier` y
   `android.package`). Se puede cambiar, pero **antes del primer build**.
3. `eas.json`: en el perfil `preview`, reemplazar la URL de la API por la pública (Render + Supabase).
   Una IP de compu no sirve en un APK instalado. El perfil `production` tiene el mismo placeholder.
4. El ícono (`assets/images/icon.png`) y el splash (`assets/images/splash-icon.png`) ya son los de la
   marca. Se pueden reemplazar manteniendo el PNG cuadrado 1024×1024 sin transparencias.
5. Para el mapa de Android: cargar `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` en el entorno del build. La clave
   se configura en Google Cloud con el package `ar.edu.uner.reservasdeportivas` y la huella SHA-1 del
   keystore. `app.config.ts` la escribe en `android.config.googleMaps.apiKey`. Sin clave, el mapa sale
   en blanco en el APK.
6. `npx eas-cli@latest build --platform android --profile preview`.
7. Instalar el APK en un teléfono real, con modo avión, sin la compu cerca.

> En Expo Go funcionan las notificaciones **locales**. Las push remotas en Android no funcionan en
> Expo Go desde SDK 53: para esas hace falta un development build.

## Qué se probó y qué no

Probado: `npm run typecheck`, `npx expo-doctor` (20/20), el bundle de Android con `npx expo export`,
y contra la API real el ingreso, `/yo`, la agenda, las reservas del día y los datos de contacto.
`npm run lint` pasa en los archivos nuevos; falla sólo en `src/app/espacio/[id].tsx` por un
`Date.now()` durante el render (código de la compañera, no se tocó).

**No probado:** correr la app en un teléfono, el build de EAS (falta cuenta y `projectId`) y el mapa
de Android (falta la clave de Google Maps).
