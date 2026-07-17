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

// Elder responses carry companion_key directly (CORE.md §7 — added during
// local-connection reconciliation 2026-07-17). This used to guess the key by
// checking whether companion_id's string happened to contain "budi", which
// only worked against mock fixture ids ('companion-mas-budi') — real
// Postgres UUIDs never contain that substring, so every elder against the
// real backend silently resolved to Mbak Asih regardless of actual companion.
export function companionMetaFromKey(companionKey: CompanionKey): CompanionMeta {
  return COMPANION_META[companionKey];
}
