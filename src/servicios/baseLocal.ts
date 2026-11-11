import * as SQLite from 'expo-sqlite';
import type { Deporte, Espacio, Reserva, Turno } from '@/tipos';

let conexion: Promise<SQLite.SQLiteDatabase> | null = null;

function abrirBase() {
  if (!conexion) {
    conexion = (async () => {
      const db = await SQLite.openDatabaseAsync('reservas.db');
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS espacios (id TEXT PRIMARY KEY NOT NULL, datos TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS deportes (id TEXT PRIMARY KEY NOT NULL, datos TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS reservas (id TEXT PRIMARY KEY NOT NULL, estado TEXT NOT NULL, datos TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS turnos (espacioId TEXT NOT NULL, fecha TEXT NOT NULL, datos TEXT NOT NULL, PRIMARY KEY (espacioId, fecha));
      `);
      return db;
    })();
  }
  return conexion;
}

export async function guardarEspacios(lista: Espacio[]): Promise<void> {
  const db = await abrirBase();
  await db.runAsync('DELETE FROM espacios');
  for (const espacio of lista) {
    await db.runAsync('INSERT OR REPLACE INTO espacios (id, datos) VALUES (?, ?)', espacio.id, JSON.stringify(espacio));
  }
}

export async function leerEspacios(): Promise<Espacio[]> {
  const db = await abrirBase();
  const filas = await db.getAllAsync<{ datos: string }>('SELECT datos FROM espacios');
  return filas.map((fila) => JSON.parse(fila.datos) as Espacio);
}

export async function guardarDeportes(lista: Deporte[]): Promise<void> {
  const db = await abrirBase();
  await db.runAsync('DELETE FROM deportes');
  for (const deporte of lista) {
    await db.runAsync('INSERT OR REPLACE INTO deportes (id, datos) VALUES (?, ?)', deporte.id, JSON.stringify(deporte));
  }
}

export async function leerDeportes(): Promise<Deporte[]> {
  const db = await abrirBase();
  const filas = await db.getAllAsync<{ datos: string }>('SELECT datos FROM deportes');
  return filas.map((fila) => JSON.parse(fila.datos) as Deporte);
}

export async function guardarReservas(lista: Reserva[]): Promise<void> {
  const db = await abrirBase();
  for (const reserva of lista) {
    await db.runAsync(
      'INSERT OR REPLACE INTO reservas (id, estado, datos) VALUES (?, ?, ?)',
      reserva.id,
      reserva.estado,
      JSON.stringify(reserva)
    );
  }
}

export async function leerReservas(proximas: boolean): Promise<Reserva[]> {
  const db = await abrirBase();
  const consulta = proximas
    ? "SELECT datos FROM reservas WHERE estado = 'confirmada'"
    : "SELECT datos FROM reservas WHERE estado <> 'confirmada'";
  const filas = await db.getAllAsync<{ datos: string }>(consulta);
  return filas.map((fila) => JSON.parse(fila.datos) as Reserva);
}


export async function guardarTurnos(espacioId: string, fecha: string, lista: Turno[]): Promise<void> {
  const db = await abrirBase();
  await db.runAsync(
    'INSERT OR REPLACE INTO turnos (espacioId, fecha, datos) VALUES (?, ?, ?)',
    espacioId,
    fecha,
    JSON.stringify(lista)
  );
}

export async function leerTurnos(espacioId: string, fecha: string): Promise<Turno[] | null> {
  const db = await abrirBase();
  const fila = await db.getFirstAsync<{ datos: string }>(
    'SELECT datos FROM turnos WHERE espacioId = ? AND fecha = ?',
    espacioId,
    fecha
  );
  return fila ? (JSON.parse(fila.datos) as Turno[]) : null;
}