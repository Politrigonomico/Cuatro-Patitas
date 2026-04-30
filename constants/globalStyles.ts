// Archivo: constants/globalStyles.ts
import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  contenedorCentral: { width: '100%', maxWidth: 800, alignSelf: 'center' },
  header: { padding: 30, backgroundColor: '#0f172a', alignItems: 'center', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#ffffff' },
  contenido: { padding: 20 },
  
  botonActualizarGlobal: { backgroundColor: '#e2e8f0', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  seccionAcciones: { marginBottom: 20 },
  botonAgregarAnimal: { backgroundColor: '#f59e0b', padding: 15, borderRadius: 10, alignItems: 'center' },
  
  filaTituloConBoton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  tituloSeccion: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  botonAgendarWhatsapp: { backgroundColor: '#0284c7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  textoBotonBlancoPequeño: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  
  separador: { height: 1, backgroundColor: '#cbd5e1', marginVertical: 20 },
  textoVacio: { textAlign: 'center', color: '#64748b', marginVertical: 10 },
  
  tarjeta: { backgroundColor: '#ffffff', borderRadius: 12, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#e2e8f0' },
  encabezadoTarjeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 10, marginBottom: 10 },
  nombreAnimalSolicitud: { fontSize: 18, fontWeight: 'bold', color: '#1e40af', flex: 1 },
  filaInsignias: { flexDirection: 'row', alignItems: 'center' },
  estadoBandeja: { backgroundColor: '#e2e8f0', color: '#334155', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5, fontSize: 12, fontWeight: 'bold', marginRight: 10 },
  botonBorrar: { backgroundColor: '#fee2e2', padding: 8, borderRadius: 5 },
  
  bloqueRespuestas: { backgroundColor: '#f8fafc', padding: 10, borderRadius: 8, marginBottom: 10 },
  datoAdoptante: { fontSize: 14, color: '#334155', marginBottom: 6 },
  negrita: { fontWeight: 'bold' },
  textoNotaInterna: { backgroundColor: '#fef3c7', color: '#92400e', padding: 10, borderRadius: 5, fontSize: 14, marginVertical: 10, borderWidth: 1, borderColor: '#fde68a' },
  
  acciones: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  botonAprobar: { backgroundColor: '#10b981', padding: 10, borderRadius: 8, flex: 1, marginRight: 5, alignItems: 'center' },
  botonDevolucion: { backgroundColor: '#f59e0b', padding: 10, borderRadius: 8, flex: 1, marginHorizontal: 5, alignItems: 'center' },
  botonRechazar: { backgroundColor: '#ef4444', padding: 10, borderRadius: 8, flex: 1, marginLeft: 5, alignItems: 'center' },
  
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 20 },
  modalContent: { backgroundColor: 'white', padding: 25, borderRadius: 20 },
  modalTituloAzul: { fontSize: 22, fontWeight: 'bold', color: '#0284c7', marginBottom: 15, textAlign: 'center' },
  labelFino: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 8, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, marginBottom: 10, fontSize: 16 },
  
  filaBotonesSeleccion: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  botonSeleccion: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 5, borderWidth: 1, borderColor: '#cbd5e1' },
  botonInactivo: { backgroundColor: 'white' },
  botonActivoAzul: { backgroundColor: '#0284c7', borderColor: '#0284c7' },
  botonActivoRosa: { backgroundColor: '#ec4899', borderColor: '#ec4899' },
  
  filaBotones: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  botonCancelarModal: { backgroundColor: '#e2e8f0', padding: 15, borderRadius: 8, flex: 1, marginRight: 10, alignItems: 'center' },
  botonEnviarPedido: { backgroundColor: '#0284c7', padding: 15, borderRadius: 8, flex: 1, marginLeft: 10, alignItems: 'center' },
  
  textoBotonBlanco: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  textoBotonOscuro: { color: '#334155', fontWeight: 'bold', fontSize: 16 },
  textoBotonSecundario: { color: '#334155', fontWeight: 'bold', fontSize: 15 },
});