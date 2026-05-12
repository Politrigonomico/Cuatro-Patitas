// ============================================================
// components/cards/AnimalCard.tsx
// Tarjeta de animal en adopción con botón para iniciar proceso.
// ============================================================
import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import type { Animal } from '../../types';
import { Button, Card } from '../ui';

interface Props {
  animal: Animal;
  onAdoptar: (animal: Animal) => void;
}

export function AnimalCard({ animal, onAdoptar }: Props) {
  const tieneFoto = animal.fotos && animal.fotos.length > 0;
  const imagenUrl = tieneFoto ? animal.fotos![0] : animal.foto;

  return (
    <Card style={s.card}>
      {imagenUrl ? (
        <Image source={{ uri: imagenUrl }} style={s.imagenCover} />
      ) : null}
      
      <View style={s.row}>
        {!imagenUrl && (
          <View style={s.avatar}>
            <Text style={s.avatarEmoji}>🐾</Text>
          </View>
        )}
        <View style={s.info}>
          <Text style={s.nombre}>{animal.nombre}</Text>
          <View style={s.tagContainer}>
            <View style={s.tag}><Text style={s.tagText}>{animal.tamaño}</Text></View>
            <View style={s.tag}><Text style={s.tagText}>{animal.edad}</Text></View>
          </View>
        </View>
      </View>
      
      {animal.descripcion ? (
        <Text style={s.descripcion} numberOfLines={2}>
          "{animal.descripcion}"
        </Text>
      ) : null}

      <Button
        label="Quiero adoptarlo"
        onPress={() => onAdoptar(animal)}
        variant="primary"
        style={{ marginTop: 16 }}
      />
    </Card>
  );
}

const s = StyleSheet.create({
  card: { padding: 20, overflow: 'hidden' },
  imagenCover: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#f1f5f9',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  avatarEmoji: { fontSize: 28 },
  info: { flex: 1 },
  nombre: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  tagContainer: { flexDirection: 'row', gap: 6, marginTop: 4 },
  tag: { backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  descripcion: { fontSize: 14, color: '#64748b', marginTop: 12, fontStyle: 'italic', lineHeight: 20 },
});
