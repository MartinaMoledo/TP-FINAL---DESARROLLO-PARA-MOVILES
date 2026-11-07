// Calendario del listado: un mes completo, como el de la referencia. Solo se pueden elegir
// los próximos 7 días (el PRD no deja mirar más lejos): esos días llevan borde, el elegido va
// relleno y el resto queda apagado. Los colores cambian según el modo (verde / naranja).
import Ionicons from '@react-native-vector-icons/ionicons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useMarca } from '@/tema/marca';
import { fuente } from '@/tema/tipografia';
import { hoyISO, sumarDias } from '@/utilidades/fechas';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const SEMANA = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

/** "2026-11-05" -> "5 de noviembre" */
export function fechaLarga(fecha: string): string {
  const [, mes, dia] = fecha.split('-').map(Number);
  return `${dia} de ${MESES[mes - 1].toLowerCase()}`;
}

function aISO(anio: number, mes: number, dia: number): string {
  return `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

type Celda = { iso: string; dia: number; delMes: boolean };

/** Semanas del mes (empiezan en lunes). Se arma con fechas UTC para que la zona horaria no corra los días. */
function celdasDelMes(anio: number, mes: number): Celda[] {
  const desfase = (new Date(Date.UTC(anio, mes, 1)).getUTCDay() + 6) % 7;
  const celdas: Celda[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(Date.UTC(anio, mes, 1 - desfase + i));
    celdas.push({
      iso: aISO(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
      dia: d.getUTCDate(),
      delMes: d.getUTCMonth() === mes,
    });
  }
  // Si la última semana cae entera en el mes siguiente, no se muestra.
  return celdas.slice(35).some((c) => c.delMes) ? celdas : celdas.slice(0, 35);
}

type Props = {
  visible: boolean;
  fecha: string;
  onElegir: (fecha: string) => void;
  onCerrar: () => void;
};

function Hoja({ fecha, onElegir, onCerrar }: Omit<Props, 'visible'>) {
  const m = useMarca();
  const hoy = hoyISO();
  const ultimo = sumarDias(hoy, 6);

  const [anio, setAnio] = useState(() => Number(fecha.slice(0, 4)));
  const [mes, setMes] = useState(() => Number(fecha.slice(5, 7)) - 1);

  const mesHoy = Number(hoy.slice(0, 4)) * 12 + Number(hoy.slice(5, 7)) - 1;
  const mesUltimo = Number(ultimo.slice(0, 4)) * 12 + Number(ultimo.slice(5, 7)) - 1;
  const mesActual = anio * 12 + mes;
  const puedeIrAtras = mesActual > mesHoy;
  const puedeIrAdelante = mesActual < mesUltimo;

  function moverMes(delta: number) {
    const total = anio * 12 + mes + delta;
    setAnio(Math.floor(total / 12));
    setMes(total % 12);
  }

  const acento = m.tarjetaLibre;

  return (
    <Pressable style={[estilos.hoja, { backgroundColor: m.calendarioFondo }]} onPress={() => {}}>
      <View style={estilos.encabezado}>
        <Text style={[estilos.titulo, { color: m.calendarioTexto }]}>{MESES[mes]} {anio}</Text>
        <View style={estilos.flechas}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mes anterior"
            disabled={!puedeIrAtras}
            onPress={() => moverMes(-1)}
            hitSlop={10}
            style={{ opacity: puedeIrAtras ? 1 : 0.25 }}
          >
            <Ionicons name="arrow-back" size={24} color={acento} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mes siguiente"
            disabled={!puedeIrAdelante}
            onPress={() => moverMes(1)}
            hitSlop={10}
            style={{ opacity: puedeIrAdelante ? 1 : 0.25 }}
          >
            <Ionicons name="arrow-forward" size={24} color={acento} />
          </Pressable>
        </View>
      </View>

      <Text style={[estilos.ayuda, { color: m.calendarioSemana }]}>
        Podés mirar los próximos 7 días
      </Text>

      <View style={estilos.semana}>
        {SEMANA.map((d) => (
          <Text key={d} style={[estilos.diaSemana, { color: m.calendarioSemana }]}>
            {d}
          </Text>
        ))}
      </View>

      <View style={estilos.grilla}>
        {celdasDelMes(anio, mes).map((c) => {
          const habilitado = c.iso >= hoy && c.iso <= ultimo;
          const elegido = c.iso === fecha;
          const esHoy = c.iso === hoy;

          return (
            <View key={c.iso} style={estilos.celdaExterior}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={fechaLarga(c.iso)}
                accessibilityState={{ selected: elegido, disabled: !habilitado }}
                disabled={!habilitado}
                onPress={() => onElegir(c.iso)}
                style={[
                  estilos.celda,
                  habilitado && { borderColor: acento, borderWidth: 1.5 },
                  elegido && { backgroundColor: acento },
                ]}
              >
                <Text
                  style={[
                    estilos.numero,
                    {
                      color: elegido
                        ? '#FFFFFF'
                        : habilitado
                          ? acento
                          : c.delMes
                            ? m.calendarioTexto
                            : m.calendarioApagado,
                      fontFamily: habilitado ? fuente.seminegrita : fuente.regular,
                      opacity: habilitado || !c.delMes ? 1 : 0.55,
                    },
                  ]}
                >
                  {c.dia}
                </Text>
                {esHoy && (
                  <View
                    style={[estilos.punto, { backgroundColor: elegido ? '#FFFFFF' : acento }]}
                  />
                )}
              </Pressable>
            </View>
          );
        })}
      </View>

      <Pressable onPress={onCerrar} accessibilityRole="button" style={estilos.cerrar}>
        <Text style={[estilos.textoCerrar, { color: acento }]}>Cerrar</Text>
      </Pressable>
    </Pressable>
  );
}

export function CalendarioModal({ visible, fecha, onElegir, onCerrar }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      <Pressable style={estilos.fondo} onPress={onCerrar} accessibilityLabel="Cerrar calendario">
        {/* Se arma de nuevo en cada apertura: así siempre arranca en el mes del día elegido. */}
        {visible && <Hoja fecha={fecha} onElegir={onElegir} onCerrar={onCerrar} />}
      </Pressable>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: 20 },
  hoja: { borderRadius: 28, padding: 18 },
  encabezado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titulo: { fontSize: 24, fontFamily: fuente.negrita },
  flechas: { flexDirection: 'row', gap: 18 },
  ayuda: { fontSize: 14, fontFamily: fuente.regular, marginTop: 4, marginBottom: 12 },
  semana: { flexDirection: 'row', marginBottom: 6 },
  diaSemana: { width: `${100 / 7}%`, textAlign: 'center', fontSize: 12, fontFamily: fuente.media },
  grilla: { flexDirection: 'row', flexWrap: 'wrap' },
  celdaExterior: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 3 },
  celda: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numero: { fontSize: 17 },
  punto: { position: 'absolute', bottom: 5, width: 5, height: 5, borderRadius: 3 },
  cerrar: { alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 24, marginTop: 8 },
  textoCerrar: { fontSize: 16, fontFamily: fuente.seminegrita },
});
