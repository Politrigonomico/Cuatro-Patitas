// ============================================================
// components/cards/RequestCard.tsx
// Tarjeta de solicitud de adopción (usada en admin.tsx).
// ============================================================
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Solicitud } from '../../types';
import { Badge, Card, DeleteButton, RowActions } from '../ui';

interface Props {
  solicitud: Solicitud;
  onAprobar: () => void;
  onInfo: () => void;
  onRechazar: () => void;
  onEliminar: () => void;
}

export function RequestCard({
  solicitud,
  onAprobar,
  onInfo,
  onRechazar,
  onEliminar,
}: Props) {
  const d = solicitud.datosAdoptante;
  return (
    <Card>
      {/* Encabezado */}
      <View style={s.header}>
        <Text style={s.titulo}>Para: {solicitud.animalNombre}</Text>
        <View style={s.headerRight}>
          <Badge status={solicitud.estadoSolicitud} />
          <DeleteButton onPress={onEliminar} />
        </View>
      </View>

      {/* Datos adoptante */}
      <View style={s.bloque}>
        <Row label="Adoptante" value={d?.nombreCompleto} />
        <Row label="DNI" value={d?.dni} />
        <Row label="Teléfono" value={d?.telefono} />
        <Row label="Hogar" value={`${d?.tipoVivienda} · Patio: ${d?.tienePatio}`} />
      </View>

      {/* Nota */}
      {!!solicitud.notaDevolucion && (
        <View style={s.nota}>
          <Text style={s.notaText}>
            <Text style={{ fontWeight: '700' }}>Nota: </Text>
            {solicitud.notaDevolucion}
          </Text>
        </View>
      )}

      <RowActions
        onApprove={onAprobar}
        onInfo={onInfo}
        infoLabel="Requiere info"
        onReject={onRechazar}
      />
    </Card>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <Text style={rowS.text}>
      <Text style={rowS.label}>{label}: </Text>
      {value ?? '—'}
    </Text>
  );
}

const rowS = StyleSheet.create({
  text: { fontSize: 13, color: '#475569', marginBottom: 2 },
  label: { fontWeight: '600', color: '#334155' },
});

const s = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titulo: { fontSize: 16, fontWeight: '700', color: '#0f172a', flex: 1 },
  bloque: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    gap: 2,
  },
  nota: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  notaText: { fontSize: 13, color: '#92400e' },
});
