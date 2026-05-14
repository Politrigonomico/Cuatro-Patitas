/**
 * Cuatro Patitas - AppCard Component (CORREGIDO)
 * Tarjeta universal con múltiples variantes para web y mobile
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ImageStyle,
  Platform,
} from 'react-native';
import { useTheme, BorderRadius, Spacing, getShadow } from '../tokens/Theme';
import { AppText, H3, H4, Body, BodySmall, Caption } from '../tokens/Typography';
import { StatusBadge } from './StatusBadgeComponent';
import type { StatusType } from './StatusBadgeComponent';

export type CardVariant = 
  | 'animal' | 'request' | 'campaign' | 'menu' | 'stat' | 'adopted' | 'generic';

interface AppCardProps {
  variant: CardVariant;
  style?: ViewStyle;
  onPress?: () => void;
  children?: React.ReactNode;
}

// Props específicas por variante
interface AnimalCardProps extends AppCardProps {
  variant: 'animal';
  imageUrl?: string;
  name: string;
  breed?: string;
  age?: string;
  size?: string;
  gender?: 'male' | 'female';
  status?: StatusType;
  onAdoptar?: () => void;
}

interface RequestCardProps extends AppCardProps {
  variant: 'request';
  type: 'adoption' | 'castration';
  applicantName: string;
  animalName?: string;
  date: string;
  status: StatusType;
  notes?: string;
  onApprove?: () => void;
  onReject?: () => void;
  onInfo?: () => void;
  onDelete?: () => void;
}

interface CampaignCardProps extends AppCardProps {
  variant: 'campaign';
  date: string;
  location: string;
  status: StatusType;
  slots?: number;
  totalSlots?: number;
  onDelete?: () => void;
}

interface MenuCardProps extends AppCardProps {
  variant: 'menu';
  icon: string;
  title: string;
  count: number;
  subtitle?: string;
}

interface StatCardProps extends AppCardProps {
  variant: 'stat';
  icon: string;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

interface AdoptedCardProps extends AppCardProps {
  variant: 'adopted';
  imageUrl?: string;
  name: string;
  familyName?: string;
  date?: string;
  quote?: string;
}

export type CardProps = 
  | AnimalCardProps | RequestCardProps | CampaignCardProps | MenuCardProps 
  | StatCardProps | AdoptedCardProps | (AppCardProps & { variant: 'generic' });

export const AppCard: React.FC<CardProps> = (props) => {
  const theme = useTheme();
  const isWeb = Platform.OS === 'web';

  const baseStyle: ViewStyle = {
    backgroundColor: theme.surface,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
    ...getShadow('md', isWeb ? 'dark' : 'light'),
  };

  const [isHovered, setIsHovered] = React.useState(false);
  const handleMouseEnter = () => isWeb && setIsHovered(true);
  const handleMouseLeave = () => isWeb && setIsHovered(false);

  const hoverStyle: ViewStyle = isHovered && isWeb ? {
    transform: [{ translateY: -4 }],
    ...getShadow('lg', 'dark'),
  } : {};

  const renderContent = () => {
    switch (props.variant) {
      case 'animal': return <AnimalContent {...props as AnimalCardProps} />;
      case 'request': return <RequestContent {...props as RequestCardProps} />;
      case 'campaign': return <CampaignContent {...props as CampaignCardProps} />;
      case 'menu': return <MenuContent {...props as MenuCardProps} />;
      case 'stat': return <StatContent {...props as StatCardProps} />;
      case 'adopted': return <AdoptedContent {...props as AdoptedCardProps} />;
      default: return props.children;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={props.onPress ? 0.85 : 1}
      onPress={props.onPress}
      {...(isWeb ? { onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave } : {}) as any}
      style={[baseStyle, hoverStyle, props.style]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

// ─── ANIMAL ───
const AnimalContent: React.FC<AnimalCardProps> = ({
  imageUrl, name, breed, age, size, gender, status, onAdoptar,
}) => {
  const theme = useTheme();
  return (
    <View>
      <View style={styles.animalImageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.animalImage} />
        ) : (
          <View style={[styles.animalPlaceholder, { backgroundColor: theme.primaryLight }]}>
            <Text style={{ fontSize: 40 }}>🐕</Text>
          </View>
        )}
        {gender && (
          <View style={[styles.genderBadge, { 
            backgroundColor: gender === 'male' ? '#DBEAFE' : '#FCE7F3',
          }]}>
            <Text style={{ fontSize: 12, color: gender === 'male' ? '#3B82F6' : '#EC4899' }}>
              {gender === 'male' ? '♂' : '♀'}
            </Text>
          </View>
        )}
        {status && (
          <View style={styles.statusOverlay}>
            <StatusBadge status={status} size="sm" />
          </View>
        )}
      </View>
      <View style={styles.animalInfo}>
        <H3 numberOfLines={1}>{name}</H3>
        <View style={styles.animalMeta}>
          {breed && <Caption>{breed}</Caption>}
          {age && <Caption color="tertiary"> • {age}</Caption>}
          {size && <Caption color="tertiary"> • {size}</Caption>}
        </View>
        {onAdoptar && (
          <TouchableOpacity 
            style={[styles.adoptButton, { backgroundColor: theme.primary }]}
            onPress={onAdoptar}
          >
            <Body color="inverse" weight="semibold">Adoptar ❤️</Body>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ─── REQUEST (CORREGIDO) ───
const RequestContent: React.FC<RequestCardProps> = ({
  type, applicantName, animalName, date, status, notes,
  onApprove, onReject, onInfo, onDelete,
}) => {
  const theme = useTheme();
  return (
    <View style={styles.requestContainer}>
      <View style={styles.requestHeader}>
        <View style={{ flex: 1, marginRight: Spacing['2'] }}>
          <Body weight="semibold" numberOfLines={1}>{applicantName}</Body>
          {animalName && <Caption>por {animalName}</Caption>}
        </View>
        <StatusBadge status={status} size="sm" />
      </View>
      <View style={styles.requestMeta}>
        <Caption color="tertiary">
          {type === 'adoption' ? '🏠 Adopción' : '🏥 Castración'} • {date}
        </Caption>
      </View>
      {notes && (
        <View style={[styles.notesBox, { backgroundColor: theme.surfacePressed }]}>
          <Caption color="secondary" numberOfLines={2}>{notes}</Caption>
        </View>
      )}
      <View style={styles.requestActions}>
        {onApprove && (
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: theme.secondary + '20' }]}
            onPress={onApprove}
          >
            <BodySmall color="success" weight="semibold">✓ Aprobar</BodySmall>
          </TouchableOpacity>
        )}
        {onInfo && (
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: theme.accent + '20' }]}
            onPress={onInfo}
          >
            <BodySmall color="accent" weight="semibold">? Info</BodySmall>
          </TouchableOpacity>
        )}
        {onReject && (
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: theme.error + '20' }]}
            onPress={onReject}
          >
            <BodySmall color="error" weight="semibold">✕ Rechazar</BodySmall>
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
            <Text>🗑️</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ─── CAMPAIGN ───
const CampaignContent: React.FC<CampaignCardProps> = ({
  date, location, status, slots, totalSlots, onDelete,
}) => {
  const theme = useTheme();
  const percentage = totalSlots && slots !== undefined 
    ? Math.round(((totalSlots - slots) / totalSlots) * 100) 
    : 0;

  return (
    <View style={styles.campaignContainer}>
      <View style={styles.campaignHeader}>
        <View style={{ flex: 1 }}>
          <H4>{date}</H4>
          <Caption color="secondary">{location}</Caption>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <StatusBadge status={status} size="sm" />
          {onDelete && (
            <TouchableOpacity onPress={onDelete}>
              <Text>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {totalSlots !== undefined && slots !== undefined && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: theme.surfacePressed }]}>
            <View style={[
              styles.progressFill, 
              { 
                width: `${percentage}%`, 
                backgroundColor: percentage >= 90 ? theme.error : percentage >= 70 ? theme.accent : theme.success 
              }
            ]} />
          </View>
          <Caption color="tertiary">
            {totalSlots - slots} de {totalSlots} cupos ({percentage}%)
          </Caption>
        </View>
      )}
    </View>
  );
};

// ─── MENU (CORREGIDO) ───
const MenuContent: React.FC<MenuCardProps> = ({ icon, title, count, subtitle }) => {
  const theme = useTheme();
  return (
    <View style={styles.menuContainer}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <H4 align="center" style={{ marginTop: Spacing['2'] }} numberOfLines={2}>{title}</H4>
      <View style={[styles.menuBadge, { backgroundColor: theme.primaryLight }]}>
        <BodySmall color="primary" weight="bold">{count}</BodySmall>
      </View>
      {subtitle && (
        <Caption color="tertiary" style={{ marginTop: Spacing['1'] }}>{subtitle}</Caption>
      )}
    </View>
  );
};

// ─── STAT (CORREGIDO) ───
const StatContent: React.FC<StatCardProps> = ({ icon, label, value, trend, trendValue }) => {
  const theme = useTheme();

  const trendColors = {
    up: theme.success,
    down: theme.error,
    neutral: theme.textTertiary,
  };

  const trendIcons = { up: '↑', down: '↓', neutral: '→' };

  return (
    <View style={styles.statContainer}>
      <View style={styles.statHeader}>
        <Text style={{ fontSize: 24 }}>{icon}</Text>
        {trend && trendValue && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: trendColors[trend], fontWeight: '600', fontSize: 12 }}>
              {trendIcons[trend]} {trendValue}
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.statValue, { color: theme.textPrimary }]}>{value}</Text>
      <Caption color="secondary">{label}</Caption>
    </View>
  );
};

// ─── ADOPTED ───
const AdoptedContent: React.FC<AdoptedCardProps> = ({ imageUrl, name, familyName, date, quote }) => {
  const theme = useTheme();
  return (
    <View>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.adoptedImage} />
      ) : (
        <View style={[styles.adoptedPlaceholder, { backgroundColor: theme.secondaryLight }]}>
          <Text style={{ fontSize: 48 }}>🏠</Text>
        </View>
      )}
      <View style={styles.adoptedInfo}>
        <H3 color="secondary">{name}</H3>
        {familyName && <BodySmall color="secondary">Con la familia {familyName}</BodySmall>}
        {date && <Caption color="tertiary">Adoptado el {date}</Caption>}
        {quote && (
          <View style={[styles.quoteBox, { backgroundColor: theme.secondaryLight }]}>
            <BodySmall color="secondary" style={{ fontStyle: 'italic' }}>"{quote}"</BodySmall>
          </View>
        )}
      </View>
    </View>
  );
};

// ─── ESTILOS CORREGIDOS ───
const styles = StyleSheet.create({
  // Animal
  animalImageContainer: { position: 'relative', height: 200, width: '100%' },
  animalImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  animalPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  genderBadge: { position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  statusOverlay: { position: 'absolute', bottom: 12, left: 12 },
  animalInfo: { padding: Spacing['4'] },
  animalMeta: { flexDirection: 'row', marginTop: Spacing['1'], flexWrap: 'wrap' },
  adoptButton: { marginTop: Spacing['3'], padding: Spacing['3'], borderRadius: BorderRadius.lg, alignItems: 'center' },

  // Request
  requestContainer: { padding: Spacing['4'] },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing['2'] },
  requestMeta: { marginBottom: Spacing['3'] },
  notesBox: { padding: Spacing['3'], borderRadius: BorderRadius.md, marginBottom: Spacing['3'] },
  requestActions: { flexDirection: 'row', gap: Spacing['2'], flexWrap: 'wrap', alignItems: 'center' },
  actionBtn: { paddingVertical: Spacing['2'], paddingHorizontal: Spacing['3'], borderRadius: BorderRadius.md },
  deleteBtn: { marginLeft: 'auto', padding: Spacing['2'] },

  // Campaign
  campaignContainer: { padding: Spacing['4'] },
  campaignHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing['3'] },
  progressContainer: { marginTop: Spacing['2'] },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: Spacing['2'] },
  progressFill: { height: '100%', borderRadius: 3 },

  // Menu (CORREGIDO - altura fija y centrado)
  menuContainer: { 
    padding: Spacing['5'], 
    alignItems: 'center', 
    justifyContent: 'center',
    minHeight: 160,
  },
  menuIcon: { fontSize: 32, marginBottom: Spacing['2'] },
  menuBadge: { 
    marginTop: Spacing['3'], 
    paddingHorizontal: Spacing['4'], 
    paddingVertical: Spacing['1.5'], 
    borderRadius: BorderRadius.full,
    minWidth: 40,
    alignItems: 'center',
  },

  // Stat (CORREGIDO - layout vertical claro)
  statContainer: { 
    padding: Spacing['5'],
    minHeight: 120,
    justifyContent: 'space-between',
  },
  statHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: Spacing['2'],
  },
  statValue: { 
    fontSize: 32, 
    fontWeight: '800', 
    marginTop: Spacing['1'],
    marginBottom: Spacing['1'],
  },

  // Adopted
  adoptedImage: { width: '100%', height: 220, resizeMode: 'cover' },
  adoptedPlaceholder: { width: '100%', height: 220, justifyContent: 'center', alignItems: 'center' },
  adoptedInfo: { padding: Spacing['4'] },
  quoteBox: { marginTop: Spacing['3'], padding: Spacing['3'], borderRadius: BorderRadius.lg },
});

export default AppCard;
