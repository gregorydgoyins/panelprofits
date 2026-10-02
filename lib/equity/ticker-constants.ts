import { Crown, Gem, Shield, Zap, Flame, Clock } from 'lucide-react';
import { ERA_COLORS } from '@/lib/design-system/colors';

export const SCARCITY_ICONS = {
  mythic:    Crown,
  legendary: Gem,
  epic:      Shield,
  rare:      Zap,
  uncommon:  Flame,
  common:    Clock,
} as const;

export const SCARCITY_NEON: Record<string, string> = {
  mythic:    '#c084fc',
  legendary: '#f59e0b',
  epic:      '#f43f5e',
  rare:      '#60a5fa',
  uncommon:  '#4ade80',
  common:    '#94a3b8',
};

export const SCARCITY_LEGEND = [
  { key: 'mythic',    label: 'Mythic',    color: SCARCITY_NEON.mythic,    Icon: Crown  },
  { key: 'legendary', label: 'Legendary', color: SCARCITY_NEON.legendary, Icon: Gem    },
  { key: 'epic',      label: 'Epic',      color: SCARCITY_NEON.epic,      Icon: Shield },
  { key: 'rare',      label: 'Rare',      color: SCARCITY_NEON.rare,      Icon: Zap    },
  { key: 'uncommon',  label: 'Uncommon',  color: SCARCITY_NEON.uncommon,  Icon: Flame  },
  { key: 'common',    label: 'Common',    color: SCARCITY_NEON.common,    Icon: Clock  },
];

export const ERA_LEGEND = [
  { key: 'platinum',    label: 'Platinum', color: '#e5c06d' },
  { key: 'golden',      label: 'Golden',   color: ERA_COLORS.golden.border },
  { key: 'atomic',      label: 'Atomic',   color: '#a78bfa' },
  { key: 'silver',      label: 'Silver',   color: ERA_COLORS.silver.border },
  { key: 'bronze',      label: 'Bronze',   color: ERA_COLORS.bronze.border },
  { key: 'copper',      label: 'Copper',   color: ERA_COLORS.copper.border },
  { key: 'modern',      label: 'Modern',   color: ERA_COLORS.modern.border },
  { key: 'independent', label: 'Indie',    color: ERA_COLORS.independent.border },
  { key: 'postmodern',  label: 'Post-Mod', color: ERA_COLORS.postmodern.border },
];

export const ASSET_CLASS_CONFIG: Record<string, { color: string; label: string }> = {
  SOV:          { color: '#f59e0b', label: 'SOV' },
  PREMIUM:      { color: '#c084fc', label: 'PREMIUM' },
  STD:          { color: '#38bdf8', label: 'STD' },
  OTC:          { color: '#fb923c', label: 'OTC' },
  UNICORN_CALL: { color: '#f472b6', label: 'UC'  },
  RAW:          { color: '#94a3b8', label: 'RAW' },
  VARIANT:      { color: '#a78bfa', label: 'VAR' },
};

export const REGIME_IMG_FILTER: Record<string, string> = {
  CALM:     'none',
  NORMAL:   'none',
  ELEVATED: 'none',
  PANIC:    'saturate(0.65) brightness(0.85)',
};

export const EQUITY_SCROLL_SPEED = 90;
export const BATCH_SIZE          = 50;
export const MAX_LOADED          = 200;
export const MAX_BATCHES         = Math.ceil(MAX_LOADED / BATCH_SIZE) * 2;
