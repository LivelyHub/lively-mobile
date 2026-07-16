import { colors } from '@/constants/tokens';
import type { CompanionKey } from '@/lib/api/types';

// Canonical identity for the two fixed companions (CORE §3): display name plus
// the initials-avatar tint. One source of truth shared by the setup wizard and
// Home, so a companion looks the same on every screen.
export type CompanionMeta = {
  key: CompanionKey;
  displayName: string;
  initials: string;
  tint: string;
  tintText: string;
};

export const COMPANION_META: Record<CompanionKey, CompanionMeta> = {
  mbak_asih: {
    key: 'mbak_asih',
    displayName: 'Mbak Asih',
    initials: 'MA',
    tint: colors.primarySoft,
    tintText: colors.primary,
  },
  mas_budi: {
    key: 'mas_budi',
    displayName: 'Mas Budi',
    initials: 'MB',
    tint: colors.warningSoft,
    tintText: colors.warning,
  },
};

// The elder payload carries only companion_id and CORE.md has no /companions read
// endpoint yet, so resolve the id to its key by the known slug. The two companions
// are fixed, so this stays correct until a companion lookup lands.
export function companionKeyFromId(companionId: string): CompanionKey {
  return companionId.includes('budi') ? 'mas_budi' : 'mbak_asih';
}

export function companionMetaFromId(companionId: string): CompanionMeta {
  return COMPANION_META[companionKeyFromId(companionId)];
}
