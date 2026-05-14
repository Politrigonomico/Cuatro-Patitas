import emailjs from "@emailjs/react-native";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Design System
import {
  useTheme,
  Spacing,
  BorderRadius,
  getShadow,
  isWeb,
  isDesktop,
} from "../../design-system/tokens/Theme";
import {
  Hero,
  H1,
  H2,
  H3,
  H4,
  Body,
  BodySmall,
  Caption,
  SectionTitle,
} from "../../design-system/tokens/Typography";
import { AppCard } from "../../design-system/components/AppCard";
import { AppButton, IconButton, ButtonGroup } from "../../design-system/components/AppButton";
import { StatusBadge } from "../../design-system/components/StatusBadge";
import { SkeletonList } from "../../design-system/components/SkeletonCard";
import { EmptyState, InlineEmpty } from "../../design-system/components/EmptyState";

// Componentes existentes
import AnimalFormModal from "../../components/admin/AnimalFormModal";
import CampanaFormModal from "../../components/admin/CampanaFormModal";
import EvaluacionModal from "../../components/admin/EvaluacionModal";
import RegistroAntiguoModal from "../../components/admin/RegistroAntiguoModal";
import WhatsAppFormModal from "../../components/admin/WhatsAppFormModal";
import app from "../../firebaseConfig";

import type { Animal, Campana, Castracion, Seguimiento, Solicitud } from "../../types";

type Seccion = "MENU" | "ANIMALES" | "ADOPCIONES" | "CASTRACIONES";

export default function Admin() {
  const theme = useTheme();
  const [seccionActiva, setSeccionActiva] = useState<Seccion>("MENU");
  const [cargando, setCargando] = useState(true);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [castraciones, setCastraciones] = useState<Castracion[]>([]);
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([]);
  const [animales, setAnimales] = useState<Animal[]>([]);

  // Filtros
  const [filtroAdopciones, setFiltroAdopciones] = useState<"Todas" | "Pendiente">("Todas");

  // Modales
  const [modalManualVisible, setModalManualVisible] = useState(false);
  const [modalAnimalVisible, setModalAnimalVisible] = useState(false);
  const [modalEvaluacionVisible, setModalEvaluacionVisible] = useState(false);
  const [modalAgendarVisible, setModalAgendarVisible] = useState(false);
  const [modalCampanaVisible, setModalCampanaVisible] = useState(false);

  // Estado para evaluación
  const [elementoActivo, setElementoActivo] = useState<{
    id: string;
    coleccion: string;
  } | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState("");

  useEffect(() => {
    const db = getFirestore(app);
    setCargando(true);

    const unsubAdop = onSnapshot(
      collection(db, "Solicitudes_Adopciones"),
      (snap) => {
        setSolicitudes(
          snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Solicitud))
        );
      }
    );

    const unsubCast = onSnapshot(collection(db, "Castraciones"), (snap) => {
      setCastraciones(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Castracion))
      );
    });

    const unsubCamp = onSnapshot(collection(db, "Campañas"), (snap) => {
      setCampanas(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Campana))
      );
    });

    const unsubSeg = onSnapshot(collection(db, "Seguimiento"), (snap) => {
      setSeguimientos(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Seguimiento))
      );
    });

    const unsubAnim = onSnapshot(collection(db, "Animales"), (snap) => {
      setAnimales(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Animal))
      );
      setCargando(false);
    });

    return () => {
      unsubAdop();
      unsubCast();
      unsubCamp();
      unsubSeg();
      unsubAnim();
    };
  }, []);

  // ─── ESTADÍSTICAS ───
  const stats = {
    totalAnimales: animales.length,
    enAdopcion: animales.filter((a) => a.estado === "En adopción").length,
    adoptados: animales.filter((a) => a.estado === "Adoptado").length,
    pendientes: solicitudes.filter((s) => s.estadoSolicitud === "Pendiente").length,
    castracionesPendientes: castraciones.filter((c) => c.estadoTurno === "Pendiente").length,
    campanasActivas: campanas.filter((c) => c.estado === "Abierta").length,
  };

  const abrirEvaluacion = (id: string, coleccion: string, estado: string) => {
    setElementoActivo({ id, coleccion });
    setNuevoEstado(estado);
    setModalEvaluacionVisible(true);
  };

  const guardarEvaluacion = async (nota: string) => {
    if (!elementoActivo) return;

    try {
      const db = getFirestore(app);
      const refRegistro = doc(db, elementoActivo.coleccion, elementoActivo.id);

      let mensajeExito = "Estado actualizado correctamente.";

      if (elementoActivo.coleccion === "Seguimiento") {
        await updateDoc(refRegistro, { notasSeguimiento: nota });
        Alert.alert("¡Éxito!", "La nota de seguimiento se guardó.");
        setModalEvaluacionVisible(false);
        return;
      }

      if (
        elementoActivo.coleccion === "Solicitudes_Adopciones" &&
        nuevoEstado === "Aprobado"
      ) {
        const soli = solicitudes.find((s) => s.id === elementoActivo!.id);

        if (soli) {
          const animalRef = doc(db, "Animales", soli.animalId);
          await updateDoc(animalRef, { estado: "Adoptado" });

          await addDoc(collection(db, "Seguimiento"), {
            animalId: soli.animalId,
            animalNombre: soli.animalNombre,
            adoptanteNombre: soli.datosAdoptante.nombreCompleto || "No registrado",
            adoptanteDni: soli.datosAdoptante.dni || "No registrado",
            adoptanteTelefono: soli.datosAdoptante.telefono || "No registrado",
            fechaAdopcion: new Date().toLocaleDateString(),
            notasSeguimiento: "Adopción aprobada. Pendiente seguimiento.",
          });

          mensajeExito =
            "El animal se movió a 'Adoptados' y se creó su ficha de seguimiento.";
        }
      }

      if (elementoActivo.coleccion === "Castraciones") {
        const snapTurno = castraciones.find((c) => c.id === elementoActivo!.id);
        if (snapTurno && snapTurno.campanaId) {
          const estadoAnterior = snapTurno.estadoTurno;
          let diferenciaCupo = 0;
          if (estadoAnterior !== "Aprobado" && nuevoEstado === "Aprobado")
            diferenciaCupo = -1;
          else if (estadoAnterior === "Aprobado" && nuevoEstado !== "Aprobado")
            diferenciaCupo = 1;

          if (diferenciaCupo !== 0) {
            const refCampana = doc(db, "Campañas", snapTurno.campanaId);
            const campanaActual = campanas.find(
              (c) => c.id === snapTurno.campanaId
            );
            if (campanaActual) {
              const nuevoCupo = parseInt(campanaActual.cupo) + diferenciaCupo;
              await updateDoc(refCampana, {
                cupo: nuevoCupo.toString(),
                estado: nuevoCupo > 0 ? "Abierta" : "Llena",
              });
            }
          }
        }
      }

      const datosActualizar =
        elementoActivo.coleccion === "Castraciones"
          ? { estadoTurno: nuevoEstado, notaDevolucion: nota }
          : { estadoSolicitud: nuevoEstado, notaDevolucion: nota };

      await updateDoc(refRegistro, datosActualizar);

      // Emails
      if (elementoActivo.coleccion === "Solicitudes_Adopciones") {
        const soli = solicitudes.find((s) => s.id === elementoActivo!.id);
        if (soli && soli.userEmail) {
          let emailSubject = "";
          let emailMessage = "";

          if (nuevoEstado === "Aprobado") {
            emailSubject = `¡Felicidades! ${soli.animalNombre} ya es tuyo 🎉`;
            emailMessage = `Tu solicitud ha sido aprobada. Nos comunicaremos contigo para coordinar la entrega.`;
          } else if (nuevoEstado === "Requiere Info") {
            emailSubject = `Requerimos más información sobre tu solicitud por ${soli.animalNombre}`;
            emailMessage = `Hola, para continuar con la adopción necesitamos que nos aclares lo siguiente: ${nota}`;
          }

          if (emailSubject) {
            try {
              await emailjs.send(
                "service_qiarh1e",
                "template_atixtzk",
                {
                  to_email: soli.userEmail,
                  user_dni: soli.datosAdoptante.dni,
                  subject: emailSubject,
                  message: emailMessage,
                  animal_name: soli.animalNombre,
                },
                { publicKey: "UXNkFYGoFoOO86qS3" }
              );
            } catch (e) {
              console.error("No se pudo enviar el correo", e);
            }
          }
        }
      }

      Alert.alert("¡Hecho!", mensajeExito);
      setModalEvaluacionVisible(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo completar la operación.");
    }
  };

  const marcarDevuelto = async (anim: Animal) => {
    Alert.alert(
      "Devolución",
      `¿Marcar a ${anim.nombre} como devuelto y volver a poner en adopción?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí",
          onPress: async () => {
            try {
              const db = getFirestore(app);
              await updateDoc(doc(db, "Animales", anim.id), {
                estado: "En adopción",
              });

              const seg = seguimientos.find((s) => s.animalId === anim.id);
              if (seg) {
                await updateDoc(doc(db, "Seguimiento", seg.id), {
                  notasSeguimiento:
                    seg.notasSeguimiento +
                    "\n[SISTEMA]: Animal devuelto y reingresado a adopción.",
                });
              }
              Alert.alert("Éxito", "Animal devuelto a adopción.");
            } catch (e) {
              console.error(e);
              Alert.alert("Error", "No se pudo actualizar.");
            }
          },
        },
      ]
    );
  };

  const borrarRegistro = async (id: string, coleccion: string) => {
    const confirmar = () => {
      Alert.alert("Eliminar", "¿Seguro que quieres borrar este registro para siempre?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, borrar",
          style: "destructive",
          onPress: async () => {
            try {
              const db = getFirestore(app);
              await deleteDoc(doc(db, coleccion, id));
            } catch {
              Alert.alert("Error", "No se pudo borrar.");
            }
          },
        },
      ]);
    };

    if (Platform.OS === "web") {
      if (window.confirm("¿Seguro que quieres borrar este registro para siempre?")) {
        try {
          const db = getFirestore(app);
          await deleteDoc(doc(db, coleccion, id));
        } catch {
          Alert.alert("Error", "No se pudo borrar.");
        }
      }
    } else {
      confirmar();
    }
  };

  // ─── RENDER CABECERA ───
  const renderCabecera = (titulo: string) => (
    <View
      style={[
        s.header,
        {
          backgroundColor: theme.primary,
        },
      ]}
    >
      {seccionActiva !== "MENU" && (
        <TouchableOpacity
          style={s.botonVolver}
          onPress={() => setSeccionActiva("MENU")}
        >
          <Body color="inverse" weight="semibold">
            ← Volver
          </Body>
        </TouchableOpacity>
      )}
      <H2 color="inverse">{titulo}</H2>
    </View>
  );

  // ─── RENDER ───
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[s.webContainer, isDesktop && { maxWidth: 1200 }]}>
          {/* ─── VISTA: MENÚ PRINCIPAL ─── */}
          {seccionActiva === "MENU" && (
            <>
              {renderCabecera("Panel de Control")}
              <View style={s.contenido}>
                {/* Stats Grid */}
                <View style={s.statsGrid}>
                  <AppCard
                    variant="stat"
                    icon="🐾"
                    label="Total Animales"
                    value={stats.totalAnimales}
                    trend={stats.enAdopcion > 0 ? "up" : "neutral"}
                    trendValue={`${stats.enAdopcion} en adopción`}
                  />
                  <AppCard
                    variant="stat"
                    icon="🏠"
                    label="Adopciones Pendientes"
                    value={stats.pendientes}
                    trend={stats.pendientes > 0 ? "up" : "neutral"}
                    trendValue="por revisar"
                  />
                  <AppCard
                    variant="stat"
                    icon="🏥"
                    label="Turnos Pendientes"
                    value={stats.castracionesPendientes}
                    trend={stats.castracionesPendientes > 0 ? "up" : "neutral"}
                    trendValue="por asignar"
                  />
                </View>

                {/* Menu Grid */}
                <View style={s.menuGrid}>
                  <AppCard
                    variant="menu"
                    icon="🐾"
                    title="Gestionar Animales"
                    count={animales.length}
                    onPress={() => setSeccionActiva("ANIMALES")}
                  />
                  <AppCard
                    variant="menu"
                    icon="🏠"
                    title="Solicitudes Adopción"
                    count={stats.pendientes}
                    subtitle="Pendientes"
                    onPress={() => setSeccionActiva("ADOPCIONES")}
                  />
                  <AppCard
                    variant="menu"
                    icon="🏥"
                    title="Turnos Castración"
                    count={stats.castracionesPendientes}
                    subtitle="Pendientes"
                    onPress={() => setSeccionActiva("CASTRACIONES")}
                  />
                </View>

                <AppButton
                  label="Cargar Adoptante Antiguo"
                  variant="outline"
                  icon="📂"
                  onPress={() => setModalManualVisible(true)}
                  style={{ marginTop: Spacing["4"] }}
                />
              </View>
            </>
          )}

          {/* ─── VISTA: ANIMALES ─── */}
          {seccionActiva === "ANIMALES" && (
            <>
              {renderCabecera("Gestión de Animales")}
              <View style={s.contenido}>
                <AppButton
                  label="Agregar Perrito al Catálogo"
                  variant="primary"
                  icon="➕"
                  onPress={() => setModalAnimalVisible(true)}
                  style={{ marginBottom: Spacing["5"] }}
                />

                {cargando ? (
                  <SkeletonList count={4} type="text" />
                ) : animales.length === 0 ? (
                  <EmptyState type="no-animals" />
                ) : (
                  <View style={s.listaGrid}>
                    {animales.map((anim) => (
                      <View key={anim.id} style={s.listaItem}>
                        <View
                          style={[
                            s.animalRow,
                            {
                              backgroundColor: theme.surface,
                              borderColor: theme.border,
                            },
                          ]}
                        >
                          <View style={{ flex: 1 }}>
                            <Body weight="semibold" color="primary">
                              {anim.nombre}
                            </Body>
                            <Caption color="secondary">
                              {anim.tamaño} · {anim.edad}
                            </Caption>
                          </View>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: Spacing["2"],
                            }}
                          >
                            {anim.estado === "Adoptado" && (
                              <AppButton
                                label="Devuelto"
                                variant="danger"
                                size="sm"
                                onPress={() => marcarDevuelto(anim)}
                              />
                            )}
                            <StatusBadge status={anim.estado} size="sm" />
                            <IconButton
                              icon="🗑️"
                              variant="ghost"
                              size="sm"
                              onPress={() => borrarRegistro(anim.id, "Animales")}
                            />
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </>
          )}

          {/* ─── VISTA: ADOPCIONES ─── */}
          {seccionActiva === "ADOPCIONES" && (
            <>
              {renderCabecera("Solicitudes de Adopción")}
              <View style={s.contenido}>
                {/* Filtro */}
                <ButtonGroup
                  buttons={[
                    {
                      label: "Todas",
                      active: filtroAdopciones === "Todas",
                      onPress: () => setFiltroAdopciones("Todas"),
                    },
                    {
                      label: "Pendientes",
                      active: filtroAdopciones === "Pendiente",
                      onPress: () => setFiltroAdopciones("Pendiente"),
                    },
                  ]}
                  style={{ marginBottom: Spacing["5"] }}
                />

                {cargando ? (
                  <SkeletonList count={3} type="request" />
                ) : (
                  <View style={s.listaGrid}>
                    {solicitudes
                      .filter(
                        (soli) =>
                          filtroAdopciones === "Todas" ||
                          soli.estadoSolicitud === "Pendiente"
                      )
                      .map((soli) => (
                        <View key={soli.id} style={s.listaItem}>
                          <AppCard
                            variant="request"
                            type="adoption"
                            applicantName={
                              soli.datosAdoptante?.nombreCompleto || "Sin nombre"
                            }
                            animalName={soli.animalNombre}
                            date={
                              soli.fechaSolicitud ||
                              new Date().toLocaleDateString()
                            }
                            status={soli.estadoSolicitud}
                            notes={soli.notaDevolucion}
                            onApprove={() =>
                              abrirEvaluacion(
                                soli.id,
                                "Solicitudes_Adopciones",
                                "Aprobado"
                              )
                            }
                            onInfo={() =>
                              abrirEvaluacion(
                                soli.id,
                                "Solicitudes_Adopciones",
                                "Requiere Info"
                              )
                            }
                            onReject={() =>
                              abrirEvaluacion(
                                soli.id,
                                "Solicitudes_Adopciones",
                                "Rechazado"
                              )
                            }
                            onDelete={() =>
                              borrarRegistro(soli.id, "Solicitudes_Adopciones")
                            }
                          />
                        </View>
                      ))}
                  </View>
                )}
              </View>
            </>
          )}

          {/* ─── VISTA: CASTRACIONES ─── */}
          {seccionActiva === "CASTRACIONES" && (
            <>
              {renderCabecera("Turnos y Campañas")}
              <View style={s.contenido}>
                <View
                  style={{
                    flexDirection: "row",
                    gap: Spacing["3"],
                    marginBottom: Spacing["5"],
                  }}
                >
                  <AppButton
                    label="Nueva Campaña"
                    variant="primary"
                    icon="➕"
                    onPress={() => setModalCampanaVisible(true)}
                    style={{ flex: 1 }}
                  />
                  <AppButton
                    label="WhatsApp"
                    variant="secondary"
                    icon="💬"
                    onPress={() => setModalAgendarVisible(true)}
                    style={{ flex: 1 }}
                  />
                </View>

                <SectionTitle title="Campañas Activas" />
                {campanas.length === 0 ? (
                  <InlineEmpty message="No hay campañas activas" icon="🏥" />
                ) : (
                  <View style={s.listaGrid}>
                    {campanas.map((camp) => (
                      <View key={camp.id} style={s.listaItem}>
                        <AppCard
                          variant="campaign"
                          date={camp.fecha}
                          location={camp.lugar}
                          status={camp.estado}
                          slots={parseInt(camp.cupo)}
                          totalSlots={parseInt(camp.cupo) + 10} // Ajustar según lógica real
                          onDelete={() => borrarRegistro(camp.id, "Campañas")}
                        />
                      </View>
                    ))}
                  </View>
                )}

                <SectionTitle
                  title="Solicitudes de Turno"
                  style={{ marginTop: Spacing["6"] }}
                />
                {cargando ? (
                  <SkeletonList count={3} type="request" />
                ) : castraciones.length === 0 ? (
                  <InlineEmpty message="No hay turnos registrados" icon="📋" />
                ) : (
                  <View style={s.listaGrid}>
                    {castraciones.map((turno) => (
                      <View key={turno.id} style={s.listaItem}>
                        <AppCard
                          variant="request"
                          type="castration"
                          applicantName={turno.responsableNombre || "Sin nombre"}
                          date={turno.fechaSolicitud || "Fecha no definida"}
                          status={turno.estadoTurno}
                          notes={turno.notaDevolucion}
                          onApprove={() =>
                            abrirEvaluacion(turno.id, "Castraciones", "Aprobado")
                          }
                          onInfo={() =>
                            abrirEvaluacion(
                              turno.id,
                              "Castraciones",
                              "Lista de Espera"
                            )
                          }
                          onReject={() =>
                            abrirEvaluacion(turno.id, "Castraciones", "Rechazado")
                          }
                          onDelete={() =>
                            borrarRegistro(turno.id, "Castraciones")
                          }
                        />
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* MODALES */}
      <AnimalFormModal
        visible={modalAnimalVisible}
        onClose={() => setModalAnimalVisible(false)}
        onSuccess={() => setModalAnimalVisible(false)}
      />
      <CampanaFormModal
        visible={modalCampanaVisible}
        onClose={() => setModalCampanaVisible(false)}
        onSuccess={() => setModalCampanaVisible(false)}
      />
      <WhatsAppFormModal
        visible={modalAgendarVisible}
        onClose={() => setModalAgendarVisible(false)}
        onSuccess={() => setModalAgendarVisible(false)}
      />
      <EvaluacionModal
        visible={modalEvaluacionVisible}
        nuevoEstado={nuevoEstado}
        onClose={() => setModalEvaluacionVisible(false)}
        onSave={guardarEvaluacion}
      />
      <RegistroAntiguoModal
        visible={modalManualVisible}
        onClose={() => setModalManualVisible(false)}
        onSuccess={() => setModalManualVisible(false)}
      />
    </View>
  );
}

// ─── ESTILOS ───
const s = StyleSheet.create({
  webContainer: {
    width: "100%",
    maxWidth: 1024,
    alignSelf: "center",
  },
  header: {
    padding: Spacing["6"],
    paddingTop: Spacing["10"],
    borderBottomLeftRadius: BorderRadius["3xl"],
    borderBottomRightRadius: BorderRadius["3xl"],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  botonVolver: {
    position: "absolute",
    left: Spacing["5"],
    top: Spacing["10"],
  },
  contenido: {
    padding: Spacing["4"],
    ...Platform.select({
      web: { padding: Spacing["6"] },
      default: {},
    }),
  },

  // Stats
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing["4"],
    marginBottom: Spacing["6"],
  },

  // Menu
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing["4"],
    justifyContent: "space-between",
  },

  // Lista
  listaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing["4"],
  },
  listaItem: {
    flex: 1,
    minWidth: 300,
    maxWidth: isDesktop ? 400 : "100%",
    ...Platform.select({
      web: {
        minWidth: "unset",
        maxWidth: "unset",
        width: "calc(50% - 12px)",
      },
      default: {},
    }),
  },

  // Animal row (compacto)
  animalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing["4"],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    ...getShadow("sm", isWeb ? "dark" : "light"),
  },
});
