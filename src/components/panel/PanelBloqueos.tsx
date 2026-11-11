// Bloquear una cancha por lluvia, mantenimiento o cualquier motivo.
import { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { CampoTexto } from '@/components/CampoTexto';
import { Etiqueta } from '@/components/Etiqueta';
import { EstadoLista } from '@/components/panel/EstadoLista';
import { SelectorEspacios } from '@/components/panel/SelectorEspacios';
import { SelectorHora } from '@/components/panel/SelectorHora';
import {
  fechaCorta,
  horarioDeBloqueo,
  HORAS_INICIO,
  horasFinDesde,
  mensajeDeError,
} from '@/components/panel/comunes';
import { SelectorFecha } from '@/components/SelectorFecha';
import { Tarjeta } from '@/components/Tarjeta';
import { useCargar } from '@/hooks/useCargar';
import { personalServicio, type Bloqueo } from '@/servicios/personal';
import { fuente } from '@/tema/tipografia';
import { tamanos, useTema } from '@/tema/useTema';
import type { Espacio } from '@/tipos';
import { hoyISO } from '@/utilidades/fechas';

type Props = {
  espacios: Espacio[];
};

export function PanelBloqueos({ espacios }: Props) {
  const t = useTema();
  const [fecha, setFecha] = useState(hoyISO());
  const [elegidas, setElegidas] = useState<string[]>([]);
  const [todoElDia, setTodoElDia] = useState(true);
  const [inicio, setInicio] = useState('09:00');
  const [fin, setFin] = useState('10:00');
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [borrando, setBorrando] = useState<string | null>(null);

  const { datos, cargando, error, recargar } = useCargar(
    () => personalServicio.bloqueos(hoyISO()),
    []
  );

  const nombreEspacio = (id: string) =>
    espacios.find((espacio) => espacio.id === id)?.nombre ?? id;

  const lista = [...(datos ?? [])].sort(
    (a, b) =>
      a.fecha.localeCompare(b.fecha) || (a.inicio ?? '').localeCompare(b.inicio ?? '')
  );

  function cambiarInicio(hora: string) {
    setInicio(hora);
    const opciones = horasFinDesde(hora);
    if (!opciones.includes(fin)) setFin(opciones[0] ?? fin);
  }

  function crear() {
    if (elegidas.length === 0) {
      Alert.alert('Falta la cancha', 'Elegí al menos una cancha para bloquear.');
      return;
    }
    if (!motivo.trim()) {
      Alert.alert('Falta el motivo', 'Contá por qué bloqueás: lluvia, mantenimiento…');
      return;
    }
    if (!todoElDia && inicio >= fin) {
      Alert.alert('Horario inválido', 'La hora de fin tiene que ser posterior a la de inicio.');
      return;
    }

    setEnviando(true);
    personalServicio
      .crearBloqueo({
        espacioIds: elegidas,
        fecha,
        inicio: todoElDia ? null : inicio,
        fin: todoElDia ? null : fin,
        motivo: motivo.trim(),
      })
      .then((creados) => {
        Alert.alert(
          'Bloqueo cargado',
          creados.length === 1
            ? 'La cancha quedó bloqueada.'
            : `Quedaron bloqueadas ${creados.length} canchas.`
        );
        setElegidas([]);
        setMotivo('');
        recargar();
      })
      .catch((e) => Alert.alert('No se pudo bloquear', mensajeDeError(e)))
      .finally(() => setEnviando(false));
  }

  function quitar(bloqueo: Bloqueo) {
    Alert.alert(
      'Quitar bloqueo',
      `¿Desbloquear ${nombreEspacio(bloqueo.espacioId)} el ${fechaCorta(bloqueo.fecha)}?`,
      [
        { text: 'Volver', style: 'cancel' },
        {
          text: 'Sí, quitar',
          style: 'destructive',
          onPress: async () => {
            setBorrando(bloqueo.id);
            try {
              await personalServicio.borrarBloqueo(bloqueo.id);
              recargar();
            } catch (e) {
              Alert.alert('No se pudo quitar', mensajeDeError(e));
            } finally {
              setBorrando(null);
            }
          },
        },
      ]
    );
  }

  return (
    <View style={estilos.seccion}>
      <Text style={[estilos.titulo, { color: t.texto }]}>Bloquear canchas</Text>
      <Text style={[estilos.ayuda, { color: t.textoSuave }]}>
        Las reservas confirmadas de esos turnos se cancelan y sus dueños reciben un aviso
        con el motivo.
      </Text>

      <Tarjeta style={estilos.tarjeta}>
        <Text style={[estilos.etiquetaCampo, { color: t.texto }]}>Fecha</Text>
        <View style={estilos.selectorFecha}>
          <SelectorFecha fecha={fecha} onCambiar={setFecha} />
        </View>

        <Text style={[estilos.etiquetaCampo, { color: t.texto }]}>Canchas</Text>
        <SelectorEspacios
          espacios={espacios}
          seleccionados={elegidas}
          onCambiar={setElegidas}
          multiple
        />

        <View style={estilos.filaSwitch}>
          <View style={estilos.textoSwitch}>
            <Text style={[estilos.etiquetaCampo, { color: t.texto }]}>Día entero</Text>
            <Text style={[estilos.ayuda, { color: t.textoSuave }]}>
              Apagalo para bloquear sólo un tramo.
            </Text>
          </View>
          <Switch
            accessibilityLabel="Bloquear el día entero"
            value={todoElDia}
            onValueChange={setTodoElDia}
            trackColor={{ true: t.primario, false: t.borde }}
            thumbColor={t.tarjeta}
          />
        </View>

        {!todoElDia ? (
          <View style={estilos.horas}>
            <SelectorHora
              etiqueta="Desde"
              horas={HORAS_INICIO}
              valor={inicio}
              onCambiar={cambiarInicio}
            />
            <SelectorHora
              etiqueta="Hasta"
              horas={horasFinDesde(inicio)}
              valor={fin}
              onCambiar={setFin}
            />
          </View>
        ) : null}

        <CampoTexto
          etiqueta="Motivo"
          placeholder="Lluvia, mantenimiento…"
          ayuda="Por ejemplo: lluvia, cancha anegada o mantenimiento."
          value={motivo}
          onChangeText={setMotivo}
          maxLength={200}
        />

        <Boton
          titulo="Bloquear"
          onPress={crear}
          cargando={enviando}
          deshabilitado={enviando}
          style={estilos.boton}
        />
      </Tarjeta>

      <Text style={[estilos.subtitulo, { color: t.texto }]}>Bloqueos desde hoy</Text>

      <EstadoLista
        cargando={cargando}
        error={error}
        vacio={lista.length === 0}
        mensajeVacio="No hay bloqueos cargados desde hoy."
        onReintentar={recargar}
      >
        <View style={estilos.lista}>
          {lista.map((bloqueo) => {
            const todoElDiaBloqueo = !bloqueo.inicio || !bloqueo.fin;
            return (
              <Tarjeta key={bloqueo.id} style={estilos.tarjetaBloqueo}>
                <View style={estilos.filaSuperior}>
                  <Text style={[estilos.fecha, { color: t.texto }]}>
                    {fechaCorta(bloqueo.fecha)}
                  </Text>
                  <Etiqueta
                    texto={horarioDeBloqueo(bloqueo.inicio, bloqueo.fin)}
                    tono={todoElDiaBloqueo ? 'mantenimiento' : 'advertencia'}
                  />
                </View>
                <Text style={[estilos.espacio, { color: t.texto }]}>
                  {nombreEspacio(bloqueo.espacioId)}
                </Text>
                <Text style={[estilos.ayuda, { color: t.textoSuave }]}>
                  {bloqueo.motivo}
                </Text>
                <Boton
                  titulo="Quitar bloqueo"
                  variante="peligro"
                  onPress={() => quitar(bloqueo)}
                  cargando={borrando === bloqueo.id}
                  deshabilitado={borrando !== null}
                  style={estilos.boton}
                />
              </Tarjeta>
            );
          })}
        </View>
      </EstadoLista>
    </View>
  );
}

const estilos = StyleSheet.create({
  seccion: { gap: 14 },
  titulo: { fontSize: tamanos.titulo, fontFamily: fuente.negrita },
  subtitulo: { fontSize: tamanos.texto, fontFamily: fuente.negrita, marginTop: 8 },
  ayuda: { fontSize: 14, lineHeight: 20, fontFamily: fuente.regular },
  tarjeta: { gap: 12 },
  selectorFecha: { marginHorizontal: -16 },
  etiquetaCampo: { fontSize: 15, fontFamily: fuente.seminegrita },
  filaSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  textoSwitch: { flex: 1, gap: 2 },
  horas: { gap: 12 },
  boton: { minHeight: 52 },
  lista: { gap: 10 },
  tarjetaBloqueo: { gap: 6 },
  filaSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  fecha: { fontSize: tamanos.texto, fontFamily: fuente.negrita },
  espacio: { fontSize: 16, fontFamily: fuente.seminegrita },
});
