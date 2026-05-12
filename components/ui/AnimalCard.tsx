// ============================================================
// components/cards/AnimalCard.tsx
// Tarjeta de animal en adopción con botón para iniciar proceso.
// ============================================================
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Animal } from '../../types';
import { Button, Card } from '../ui';

interface Props {
  animal: Animal;
  onAdoptar: (animal: Animal) => void;
}

export function AnimalCard({ animal, onAdoptar }: Props) {
  return (
    <Card style={s.card}>
      <View style={s.row}>
        <View style={s.avatar}>
          <Text style={s.avatarEmoji}>🐾</Text>
        </View>
        <View style={s.info}>
          <Text style={s.nombre}>{animal.nombre}</Text>
          <View style={s.tagContainer}>
            <View style={s.tag}><Text style={s.tagText}>{animal.tamaño}</Text></View>
            <View style={s.tag}><Text style={s.tagText}>{animal.edad}</Text></View>
          </View>
        </View>
      </View>
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
  card: { padding: 20 },
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
});
