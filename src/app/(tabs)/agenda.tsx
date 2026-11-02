// Agenda del día para encargados y administradores: todos los turnos por espacio.
import { useMemo, useState } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';

import { EstadoPantalla } from '@/components/EstadoPantalla';
import { Etiqueta, etiquetaDeTurno } from '@/components/Etiqueta';
import { SelectorFecha } from '@/components/SelectorFecha';
import { useCargar } from '@/hooks/useCargar';
import { personalServicio } from '@/servicios/personal';
import { tamanos, useTema } from '@/tema/useTema';
import type { Espacio, Turno } from '@/tipos';
import { hoyISO } from '@/utilidades/fechas';

type Seccion = {
  espacio: Espacio;
  title: string;
  data: Turno[];
};

export default function AgendaPantalla() {
  const t = useTema();
  const [fecha, setFecha] = useState(hoyISO());

  const { datos, cargando, error, recargar } = useCargar(
    () => personalServicio.agendaDelDia(fecha),
    [fecha]
  );

  const secciones = useMemo<Seccion[]>(() => {
    if (!datos) return [];

    return datos.espacios
      .map((espacio) => ({
        espacio,
        title: espacio.nombre,
        data: datos.turnos
          .filter((turno) => turno.espacioId === espacio.id)
          .sort((a, b) => a.inicio.localeCompare(b.inicio)),
      }))
      .filter((seccion) => seccion.data.length > 0);
  }, [datos]);

  const total = datos?.turnos.length ?? 0;
  const ocupados = datos?.turnos.filter((turno) => turno.estado !== 'libre').length ?? 0;

  return (
    <View style={[estilos.pantalla, { backgroundColor: t.fondo }]}>
      <SelectorFecha fecha={fecha} onCambiar={setFecha} />

      <EstadoPantalla
        cargando={cargando}
        error={error}
        vacio={!!datos && total === 0}
        mensajeVacio="No hay turnos cargados para este día."
        onReintentar={recargar}
      >
        <View style={estilos.resumen}>
          <Text style={[estilos.titulo, { color: t.texto }]}>
            {total} turnos
          </Text>
          <Text style={[estilos.detalle, { color: t.textoSuave }]}>
            {ocupados} ocupados · {total - ocupados} libres
          </Text>
        </View>

        <SectionList
          sections={secciones}
          keyExtractor={(turno) => turno.id}
          contentContainerStyle={estilos.lista}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <View style={estilos.encabezadoSeccion}>
              <Text style={[estilos.espacio, { color: t.texto }]}>
                {section.espacio.nombre}
              </Text>
              <Text style={[estilos.detalle, { color: t.textoSuave }]}>
                {section.espacio.complejo} · {section.espacio.superficie}
              </Text>
            </View>
          )}
          renderItem={({ item }) => {
            const etiqueta = etiquetaDeTurno(item.estado);
            return (
              <View
                style={[
                  estilos.fila,
                  { backgroundColor: t.tarjeta, borderColor: t.borde },
                ]}
              >
                <View style={estilos.horario}>
                  <Text style={[estilos.hora, { color: t.texto }]}>{item.inicio}</Text>
                  <Text style={[estilos.detalle, { color: t.textoSuave }]}>
                    a {item.fin}
                  </Text>
                </View>
                <Etiqueta texto={etiqueta.texto} tono={etiqueta.tono} />
              </View>
            );
          }}
        />
      </EstadoPantalla>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1 },
  resumen: { paddingHorizontal: 16, paddingBottom: 8, gap: 2 },
  titulo: { fontSize: tamanos.titulo, fontWeight: '800' },
  detalle: { fontSize: 15 },
  lista: { paddingHorizontal: 16, paddingBottom: 24 },
  encabezadoSeccion: { paddingTop: 18, paddingBottom: 8, gap: 2 },
  espacio: { fontSize: tamanos.texto, fontWeight: '800' },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  horario: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  hora: { fontSize: tamanos.texto, fontWeight: '700' },
});
