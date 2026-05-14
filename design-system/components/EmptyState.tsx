/**
 * Cuatro Patitas - EmptyState Component
 * Estados vacíos ilustrados y amigables
 * Soporta: sin resultados, sin conexión, lista vacía, error
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { useTheme, BorderRadius, Spacing, getShadow } from '../tokens/Theme';
import { H2, H3, Body, BodySmall, Caption } from '../tokens/Typography';
import { AppButton } from './AppButton';

// ─── TIPOS DE ESTADO VACÍO ───
export type EmptyType = 
  | 'no-animals'      // Sin animales en adopción
  | 'no-adopted'      // Sin adoptados aún
  | 'no-requests'     // Sin solicitudes
  | 'no-campaigns'    // Sin campañas
  | 'no-results'      // Búsqueda sin resultados
  | 'no-connection'   // Sin internet
  | 'error'           // Error genérico
  | 'empty-profile'   // Perfil sin trámites
  | 'custom';         // Personalizado

// ─── PROPS ───
interface EmptyStateProps {
  type: EmptyType;
  customIcon?: string;
  customTitle?: string;
  customMessage?: string;
  customAction?: { label: string; onPress: () => void };
  style?: ViewStyle;
}

// ─── CONFIGURACIONES POR TIPO ───
const emptyConfigs: Record<EmptyType, { icon: string; title: string; message: string; action?: string }> = {
  'no-animals': {
    icon: '🐕',
    title: 'No hay perritos aún',
    message: 'Pronto tendremos nuevos amigos esperando un hogar. ¡Vuelve a visitarnos!',
  },
  'no-adopted': {
    icon: '🏠',
    title: 'Aún no hay finales felices',
    message: 'Sé parte del primer final feliz. ¡Adopta un amigo hoy!',
    action: 'Ver Perritos',
  },
  'no-requests': {
    icon: '📋',
    title: 'Sin solicitudes pendientes',
    message: 'Todas las solicitudes han sido atendidas. ¡Buen trabajo!',
  },
  'no-campaigns': {
    icon: '🏥',
    title: 'No hay campañas activas',
    message: 'Pronto anunciaremos nuevas fechas para castraciones. Mantente atento.',
  },
  'no-results': {
    icon: '🔍',
    title: 'Sin resultados',
    message: 'No encontramos trámites con ese DNI. Verifica los datos e intenta de nuevo.',
  },
  'no-connection': {
    icon: '📡',
    title: 'Sin conexión',
    message: 'Parece que no tienes internet. Verifica tu conexión e intenta de nuevo.',
    action: 'Reintentar',
  },
  'error': {
    icon: '⚠️',
    title: 'Algo salió mal',
    message: 'Hubo un error al cargar los datos. Por favor, intenta más tarde.',
    action: 'Reintentar',
  },
  'empty-profile': {
    icon: '👤',
    title: 'Sin gestiones',
    message: 'Aún no tienes adopciones o turnos registrados. ¡Empieza ahora!',
    action: 'Explorar',
  },
  'custom': {
    icon: '✨',
    title: '',
    message: '',
  },
};

// ─── COMPONENTE ───
export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  customIcon,
  customTitle,
  customMessage,
  customAction,
  style,
}) => {
  const theme = useTheme();
  const isWeb = Platform.OS === 'web';

  const config = emptyConfigs[type];
  const icon = customIcon || config.icon;
  const title = customTitle || config.title;
  const message = customMessage || config.message;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
        style,
      ]}
    >
      {/* Icono animado */}
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: theme.primaryLight,
          },
        ]}
      >
        <Text style={styles.icon}>{icon}</Text>
      </View>

      {/* Título */}
      <H3
        color="primary"
        align="center"
        style={{ marginTop: Spacing['5'], marginBottom: Spacing['2'] }}
      >
        {title}
      </H3>

      {/* Mensaje */}
      <Body
        color="secondary"
        align="center"
        style={{ maxWidth: 320, marginBottom: Spacing['5'] }}
      >
        {message}
      </Body>

      {/* Acción */}
      {(config.action || customAction) && (
        <AppButton
          label={customAction?.label || config.action || 'Acción'}
          variant="primary"
          size="md"
          onPress={customAction?.onPress}
        />
      )}
    </View>
  );
};

// ─── ESTADO VACÍO INLINE (compacto) ───
interface InlineEmptyProps {
  icon?: string;
  message: string;
  style?: ViewStyle;
}

export const InlineEmpty: React.FC<InlineEmptyProps> = ({
  icon = '📭',
  message,
  style,
}) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.inlineContainer,
        {
          backgroundColor: theme.surfacePressed,
          borderColor: theme.border,
        },
        style,
      ]}
    >
      <Text style={{ fontSize: 24, marginRight: Spacing['3'] }}>{icon}</Text>
      <BodySmall color="secondary">{message}</BodySmall>
    </View>
  );
};

// ─── ESTILOS ───
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['8'],
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    marginVertical: Spacing['4'],
    ...Platform.select({
      web: {
        maxWidth: 480,
        alignSelf: 'center',
        width: '100%',
      },
      default: {},
    }),
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius['3xl'],
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        transition: 'transform 0.3s ease',
      },
      default: {},
    }),
  },
  icon: {
    fontSize: 40,
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing['4'],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
});

export default EmptyState;
