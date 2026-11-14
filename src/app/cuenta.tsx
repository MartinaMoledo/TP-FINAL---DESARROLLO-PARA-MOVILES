// "Tu cuenta" del personal: la misma pantalla que "Yo" del jugador (datos y cerrar sesión),
// pero fuera de las pestañas. Se abre desde el círculo con la inicial, arriba a la izquierda.
// No puede ser una pestaña oculta: en esta versión de Expo Router, navegar a una pestaña
// con `href: null` te devuelve a la primera pestaña visible.
export { default } from './(tabs)/yo';
