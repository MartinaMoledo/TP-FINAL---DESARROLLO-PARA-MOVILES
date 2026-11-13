// Reservas fijas: un grupo que usa la misma cancha todas las semanas.
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { CampoTexto } from '@/components/CampoTexto';
import { Etiqueta } from '@/components/Etiqueta';
import { ChipSeleccion } from '@/components/panel/ChipSeleccion';
import { EstadoLista } from '@/components/panel/EstadoLista';
import { SelectorEspacios } from '@/components/panel/SelectorEspacios';
import { SelectorHora } from '@/components/panel/SelectorHora';
import {
  DIAS,
  esFechaValida,
  fechaCorta,
  HORAS_INICIO,
  horasFinDesde,
  mensajeDeError,
} from '@/components/panel/comunes';
import { Tarjeta } from '@/components/Tarjeta';
import { useCargar } from '@/hooks/useCargar';
import { personalServicio } from '@/servicios/personal';
import { fuente } from '@/tema/tipografia';
import { tamanos, useTema } from '@/tema/useTema';
import type { Espacio, ReservaFija } from '@/tipos';
import { hoyISO } from '@/utilidades/fechas';

type Props = {
  espacios: Espacio[];
  esAdmin: boolean;
};

export function PanelFijas({ espacios, esAdmin }: Props) {
  const t = useTema();
  const { datos, cargando, error, recargar } = useCargar(
    () => personalServicio.fijas(),
    []
  );

  const [formVisible, setFormVisible] = useState(false);
  const [editando, setEditando] = useState<ReservaFija | null>(null);
  const [espacioId, setEspacioId] = useState('');
  const [titular, setTitular] = useState('');
  const [dia, setDia] = useState<ReservaFija['dia']>(1);
  const [inicio, setInicio] = useState('09:00');
  const [fin, setFin] = useState('10:00');
  const [desde, setDesde] = useState(hoyISO());
  const [hasta, setHasta] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [ocupada, setOcupada] = useState<string | null>(null);

  const nombreEspacio = (id: string) =>
    espacios.find((espacio) => espacio.id === id)?.nombre ?? id;

  const lista = [...(datos ?? [])].sort(
    (a, b) =>
      Number(b.activa) - Number(a.activa) ||
      a.dia - b.dia ||
      a.inicio.localeCompare(b.inicio)
  );

  function cambiarInicio(hora: string) {
    setInicio(hora);
    const opciones = horasFinDesde(hora);
    if (!opciones.includes(fin)) setFin(opciones[0] ?? fin);
  }

  function limpiar() {
    setEditando(null);
    setEspacioId('');
    setTitular('');
    setDia(1);
    setInicio('09:00');
    setFin('10:00');
    setDesde(hoyISO());
    setHasta('');
  }

  function nueva() {
    limpiar();
    setFormVisible(true);
  }

  function editar(fija: ReservaFija) {
    setEditando(fija);
    setEspacioId(fija.espacioId);
    setTitular(fija.titular);
    setDia(fija.dia);
    setInicio(fija.inicio);
    setFin(fija.fin);
    setDesde(fija.desde);
    setHasta(fija.hasta ?? '');
    setFormVisible(true);
  }

  function cerrar() {
    limpiar();
    setFormVisible(false);
  }

  function guardar() {
    if (!editando && !espacioId) {
      Alert.alert('Falta la cancha', 'Elegí la cancha de la reserva fija.');
      return;
    }
    if (!titular.trim()) {
      Alert.alert('Falta el titular', 'Escribí el nombre del grupo o de la persona.');
      return;
    }
    if (inicio >= fin) {
      Alert.alert('Horario inválido', 'La hora de fin tiene que ser posterior a la de inicio.');
      return;
    }
    if (!esFechaValida(desde.trim())) {
      Alert.alert('Fecha inválida', 'La fecha de inicio tiene que ser AAAA-MM-DD.');
      return;
    }
    const hastaLimpio = hasta.trim() || null;
    if (hastaLimpio && !esFechaValida(hastaLimpio)) {
      Alert.alert('Fecha inválida', 'La fecha de fin tiene que ser AAAA-MM-DD o quedar vacía.');
      return;
    }
    if (hastaLimpio && hastaLimpio < desde.trim()) {
      Alert.alert('Fechas cruzadas', 'La fecha de fin no puede ser anterior a la de inicio.');
      return;
    }

    setGuardando(true);
    const cambios = {
      titular: titular.trim(),
      dia,
      inicio,
      fin,
      desde: desde.trim(),
      hasta: hastaLimpio,
    };

    const pedido = editando
      ? personalServicio.editarFija(editando.id, cambios)
      : personalServicio.crearFija({ espacioId, ...cambios });

    pedido
      .then(() => {
        Alert.alert(
          editando ? 'Reserva fija actualizada' : 'Reserva fija cargada',
          'Los turnos de ese día ya la tienen en cuenta.'
        );
        cerrar();
        recargar();
      })
      .catch((e) => Alert.alert('No se pudo guardar', mensajeDeError(e)))
      .finally(() => setGuardando(false));
  }

  function darDeBaja(fija: ReservaFija) {
    Alert.alert(
      'Dar de baja',
      `¿Dar de baja la fija de ${fija.titular}? Deja de ocupar sus turnos.`,
      [
        { text: 'Volver', style: 'cancel' },
        {
          text: 'Sí, dar de baja',
          style: 'destructive',
          onPress: async () => {
            setOcupada(fija.id);
            try {
              await personalServicio.darDeBajaFija(fija.id);
              recargar();
            } catch (e) {
              Alert.alert('No se pudo dar de baja', mensajeDeError(e));
            } finally {
              setOcupada(null);
            }
          },
        },
      ]
    );
  }

  async function reactivar(fija: ReservaFija) {
    setOcupada(fija.id);
    try {
      await personalServicio.editarFija(fija.id, { activa: true });
      recargar();
    } catch (e) {
      Alert.alert('No se pudo reactivar', mensajeDeError(e));
    } finally {
      setOcupada(null);
    }
  }

  return (
    <View style={estilos.seccion}>
      <Text style={[estilos.titulo, { color: t.texto }]}>Reservas fijas</Text>
      <Text style={[estilos.ayuda, { color: t.textoSuave }]}>
        Un grupo con el mismo día y horario todas las semanas. No se pueden pisar entre sí
        ni con reservas ya confirmadas.
      </Text>

      {!esAdmin ? (
        <Tarjeta>
          <Text style={[estilos.aviso, { color: t.textoSuave }]}>
            Sólo el administrador puede cargar, editar o dar de baja reservas fijas.
            Desde acá podés consultarlas.
          </Text>
        </Tarjeta>
      ) : formVisible ? (
        <Tarjeta style={estilos.tarjeta}>
          <Text style={[estilos.subtitulo, { color: t.texto }]}>
            {editando ? 'Editar reserva fija' : 'Nueva reserva fija'}
          </Text>

          <Text style={[estilos.etiquetaCampo, { color: t.texto }]}>Cancha</Text>
          {editando ? (
            <>
              <Text style={[estilos.espacio, { color: t.texto }]}>
                {nombreEspacio(espacioId)}
              </Text>
              <Text style={[estilos.ayuda, { color: t.textoSuave }]}>
                La cancha no se puede cambiar. Si hace falta, dá de baja esta fija y creá
                otra.
              </Text>
            </>
          ) : (
            <SelectorEspacios
              espacios={espacios}
              seleccionados={espacioId ? [espacioId] : []}
              onCambiar={(ids) => setEspacioId(ids[0] ?? '')}
            />
          )}

          <CampoTexto
            etiqueta="Titular o grupo"
            placeholder="Grupo de los martes"
            value={titular}
            onChangeText={setTitular}
            maxLength={120}
          />

          <Text style={[estilos.etiquetaCampo, { color: t.texto }]}>Día de la semana</Text>
          <View style={estilos.chips}>
            {DIAS.map((nombre, indice) => (
              <ChipSeleccion
                key={nombre}
                texto={nombre}
                activo={dia === indice}
                onPress={() => setDia(indice as ReservaFija['dia'])}
              />
            ))}
          </View>

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

          <CampoTexto
            etiqueta="Vigente desde"
            placeholder="AAAA-MM-DD"
            ayuda="Con la forma AAAA-MM-DD."
            value={desde}
            onChangeText={setDesde}
            maxLength={10}
          />
          <CampoTexto
            etiqueta="Vigente hasta (opcional)"
            placeholder="AAAA-MM-DD"
            ayuda="Dejala vacía si no tiene fecha de fin."
            value={hasta}
            onChangeText={setHasta}
            maxLength={10}
          />

          <Boton
            titulo={editando ? 'Guardar cambios' : 'Cargar reserva fija'}
            onPress={guardar}
            cargando={guardando}
            deshabilitado={guardando}
            style={estilos.boton}
          />
          <Boton
            titulo="Cancelar"
            variante="secundario"
            onPress={cerrar}
            deshabilitado={guardando}
            style={estilos.boton}
          />
        </Tarjeta>
      ) : (
        <Boton titulo="Nueva reserva fija" onPress={nueva} />
      )}

      <Text style={[estilos.subtitulo, { color: t.texto }]}>Cargadas</Text>

      <EstadoLista
        cargando={cargando}
        error={error}
        vacio={lista.length === 0}
        mensajeVacio="Todavía no hay reservas fijas cargadas."
        onReintentar={recargar}
      >
        <View style={estilos.lista}>
          {lista.map((fija) => (
            <Tarjeta key={fija.id} style={estilos.tarjetaFija}>
              <View style={estilos.filaSuperior}>
                <Text style={[estilos.titular, { color: t.texto }]}>{fija.titular}</Text>
                <Etiqueta
                  texto={fija.activa ? 'Activa' : 'Inactiva'}
                  tono={fija.activa ? 'exito' : 'neutro'}
                />
              </View>

              <Text style={[estilos.espacio, { color: t.texto }]}>
                {nombreEspacio(fija.espacioId)}
              </Text>
              <Text style={[estilos.ayuda, { color: t.textoSuave }]}>
                {DIAS[fija.dia]} de {fija.inicio} a {fija.fin}
              </Text>
              <Text style={[estilos.ayuda, { color: t.textoSuave }]}>
                Desde {fechaCorta(fija.desde)}
                {fija.hasta ? ` hasta ${fechaCorta(fija.hasta)}` : ' sin fecha de fin'}
              </Text>

              {esAdmin ? (
                <View style={estilos.acciones}>
                  <Boton
                    titulo="Editar"
                    variante="secundario"
                    onPress={() => editar(fija)}
                    deshabilitado={ocupada !== null || guardando}
                    style={estilos.botonAccion}
                  />
                  {fija.activa ? (
                    <Boton
                      titulo="Dar de baja"
                      variante="peligro"
                      onPress={() => darDeBaja(fija)}
                      cargando={ocupada === fija.id}
                      deshabilitado={ocupada !== null}
                      style={estilos.botonAccion}
                    />
                  ) : (
                    <Boton
                      titulo="Reactivar"
                      onPress={() => reactivar(fija)}
                      cargando={ocupada === fija.id}
                      deshabilitado={ocupada !== null}
                      style={estilos.botonAccion}
                    />
                  )}
                </View>
              ) : null}
            </Tarjeta>
          ))}
        </View>
      </EstadoLista>
    </View>
  );
}

const estilos = StyleSheet.create({
  seccion: { gap: 14 },
  titulo: { fontSize: tamanos.titulo, fontFamily: fuente.negrita },
  subtitulo: { fontSize: tamanos.texto, fontFamily: fuente.negrita },
  ayuda: { fontSize: 14, lineHeight: 20, fontFamily: fuente.regular },
  aviso: { fontSize: 15, lineHeight: 22, fontFamily: fuente.regular },
  tarjeta: { gap: 12 },
  etiquetaCampo: { fontSize: 15, fontFamily: fuente.seminegrita },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  horas: { gap: 12 },
  boton: { minHeight: 52 },
  lista: { gap: 10 },
  tarjetaFija: { gap: 6 },
  filaSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  titular: { flex: 1, fontSize: tamanos.texto, fontFamily: fuente.negrita },
  espacio: { fontSize: 16, fontFamily: fuente.seminegrita },
  acciones: { flexDirection: 'row', gap: 8, marginTop: 8 },
  botonAccion: { flex: 1, minHeight: 48 },
});
