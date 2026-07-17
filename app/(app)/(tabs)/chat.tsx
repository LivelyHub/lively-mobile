import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Banner, EmptyState, ErrorState } from '@/components/ui';
import { TAB_BAR_CLEARANCE } from '@/components/ui/TabBar';
import { buildChatItems, ChatSkeleton, DaySeparator, MessageBubble, type ChatItem } from '@/components/chat';
import { colors, radii, shadow, spacing, typography } from '@/constants/tokens';
import { getConversation } from '@/lib/api/endpoints';
import { useConversation, useElders } from '@/lib/api/hooks';
import type { ConversationMessage } from '@/lib/api/types';
import { companionMetaFromKey } from '@/lib/companions';

const POLL_MS = 10_000; // Chat refetches the full history every 10s while focused (M4.1).
const OLDER_PAGE = 30; // page size for the older-history `before` cursor.
// In an inverted list contentOffset.y is ~0 when the newest message is visible;
// it grows as the user scrolls up into history. Treat "near 0" as at-bottom.
const AT_BOTTOM_THRESHOLD = 24;

function dedupeSortById(messages: ConversationMessage[]): ConversationMessage[] {
  const map = new Map<string, ConversationMessage>();
  for (const m of messages) map.set(m.id, m);
  return [...map.values()].sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const elders = useElders();
  const elder = elders.data?.[0];
  const honorific = elder?.honorific ?? 'Eyang';
  const companion = elder ? companionMetaFromKey(elder.companion_key) : null;
  const companionName = companion?.displayName ?? 'pendamping';

  // Poll-all-and-reconcile: fetch the whole history on a 10s interval and merge by
  // id, rather than tracking an `after` cursor. Simplest robust path for mock +
  // demo; the `before` cursor below still exercises the paginating-backend path.
  const conversation = useConversation(
    elder?.id ?? '',
    {},
    { refetchInterval: elder ? POLL_MS : undefined },
  );

  const [olderMessages, setOlderMessages] = useState<ConversationMessage[]>([]);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewPill, setShowNewPill] = useState(false);

  const listRef = useRef<FlatList<ChatItem>>(null);
  const atBottomRef = useRef(true);
  const loadingOlderRef = useRef(false);
  const hasMoreOlderRef = useRef(true);
  const lastNewestIdRef = useRef<string | null>(null);

  const messages = useMemo(
    () => dedupeSortById([...(conversation.data ?? []), ...olderMessages]),
    [conversation.data, olderMessages],
  );

  // items are built oldest -> newest with day separators, then reversed for the
  // inverted FlatList so data[0] (newest) renders at the bottom.
  const items = useMemo(() => [...buildChatItems(messages)].reverse(), [messages]);

  // Reset the pagination + arrival trackers when the active elder changes.
  useEffect(() => {
    setOlderMessages([]);
    hasMoreOlderRef.current = true;
    loadingOlderRef.current = false;
    lastNewestIdRef.current = null;
    atBottomRef.current = true;
    setShowNewPill(false);
  }, [elder?.id]);

  // Soft auto-scroll: when a genuinely new newest message arrives, jump to the
  // bottom only if the user is already there; otherwise surface the "Pesan baru"
  // pill instead of yanking them out of the history they are reading. Loading
  // older pages never changes the newest id, so it can't trigger either path.
  useEffect(() => {
    if (messages.length === 0) return;
    const newestId = messages[messages.length - 1].id;
    if (lastNewestIdRef.current === null) {
      lastNewestIdRef.current = newestId;
      return;
    }
    if (newestId !== lastNewestIdRef.current) {
      lastNewestIdRef.current = newestId;
      if (atBottomRef.current) {
        requestAnimationFrame(() => listRef.current?.scrollToOffset({ offset: 0, animated: true }));
      } else {
        setShowNewPill(true);
      }
    }
  }, [messages]);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const atBottom = e.nativeEvent.contentOffset.y <= AT_BOTTOM_THRESHOLD;
    atBottomRef.current = atBottom;
    if (atBottom) setShowNewPill(false);
  }, []);

  const scrollToBottom = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
    setShowNewPill(false);
  }, []);

  // Load older history via the `before` cursor (visual top of the inverted list).
  // In mock mode the base query already returns everything, so the first call
  // fetches nothing older and flips hasMore off; the synchronous refs guard
  // against re-entrancy and an empty-result loop.
  const loadOlder = useCallback(async () => {
    if (!elder || loadingOlderRef.current || !hasMoreOlderRef.current) return;
    const oldest = messages[0];
    if (!oldest) return;
    loadingOlderRef.current = true;
    setIsLoadingOlder(true);
    try {
      const older = await getConversation(elder.id, {
        before: oldest.id,
        limit: OLDER_PAGE,
      });
      if (older.length === 0) {
        hasMoreOlderRef.current = false;
      } else {
        setOlderMessages((prev) => dedupeSortById([...prev, ...older]));
        if (older.length < OLDER_PAGE) hasMoreOlderRef.current = false;
      }
    } catch {
      // Leave hasMore true so a later scroll-to-top can retry; no loop because
      // onEndReached only fires again on a fresh gesture.
    } finally {
      loadingOlderRef.current = false;
      setIsLoadingOlder(false);
    }
  }, [elder, messages]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([elders.refetch(), elder ? conversation.refetch() : Promise.resolve()]);
    } finally {
      setRefreshing(false);
    }
  }, [elders, conversation, elder]);

  const renderItem = useCallback(({ item }: { item: ChatItem }) => {
    if (item.kind === 'separator') return <DaySeparator label={item.label} />;
    return (
      <MessageBubble message={item.message} showTime={item.showTime} startsGroup={item.startsGroup} />
    );
  }, []);

  const eldersFirstLoad = elders.isLoading && !elders.data;
  const eldersError = elders.isError && !elders.data;
  const noElders = Boolean(elders.data) && !elder;

  const convFirstLoad = Boolean(elder) && conversation.isLoading && !conversation.data;
  const convFullError = Boolean(elder) && conversation.isError && !conversation.data;
  const showSkeleton = eldersFirstLoad || convFirstLoad;
  const showEmpty = Boolean(elder) && Boolean(conversation.data) && messages.length === 0;
  const showList = Boolean(elder) && messages.length > 0;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        {elder && companion ? (
          <>
            <View style={styles.avatarRing}>
              <Avatar initials={companion.initials} tint={companion.tint} tintText={companion.tintText} size={44} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Obrolan {honorific}</Text>
              <Text style={styles.headerSub}>bersama {companionName}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.headerTitle}>Obrolan</Text>
        )}
      </View>

      {conversation.isError && conversation.data ? (
        <View style={styles.bannerWrap}>
          <Banner
            variant="danger"
            message="Gagal memperbarui. Menampilkan pesan terakhir."
            actionLabel="Coba lagi"
            onActionPress={onRefresh}
          />
        </View>
      ) : null}

      <View style={[styles.body, !elder && styles.bodyNoFooter]}>
        {showSkeleton ? (
          <ChatSkeleton />
        ) : eldersError ? (
          <View style={styles.centerBlock}>
            <ErrorState onRetry={() => void elders.refetch()} isRetrying={elders.isRefetching} />
          </View>
        ) : convFullError ? (
          <View style={styles.centerBlock}>
            <ErrorState onRetry={() => void conversation.refetch()} isRetrying={conversation.isRefetching} />
          </View>
        ) : noElders ? (
          <View style={styles.centerBlock}>
            <EmptyState
              icon="people-outline"
              title="Belum ada Eyang di sini"
              body="Tambahkan orang tersayang Anda dulu, lalu obrolannya dengan pendamping akan muncul di sini."
              ctaLabel="Tambah Eyang"
              onCtaPress={() => router.push('/setup-wizard')}
              iconAccessibilityLabel="Belum ada data"
            />
          </View>
        ) : showEmpty ? (
          <View style={styles.centerBlock}>
            <EmptyState
              icon="chatbubbles-outline"
              title="Belum ada percakapan"
              body={`${companionName} akan menyapa ${honorific} besok pagi.`}
              iconAccessibilityLabel="Belum ada percakapan"
            />
          </View>
        ) : showList ? (
          <View style={[styles.listWrap, styles.listCard]}>
            <FlatList
              ref={listRef}
              data={items}
              inverted
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              onScroll={onScroll}
              scrollEventThrottle={16}
              onEndReached={loadOlder}
              onEndReachedThreshold={0.4}
              ListFooterComponent={
                isLoadingOlder ? (
                  <View style={styles.paginationRow}>
                    <ActivityIndicator color={colors.primary} />
                  </View>
                ) : null
              }
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
              }
            />

            {showNewPill ? (
              <Pressable
                accessibilityRole="button"
                onPress={scrollToBottom}
                style={({ pressed }) => [styles.newPill, pressed && styles.newPillPressed]}
              >
                <Ionicons name="arrow-down" size={16} color={colors.textOnPrimary} />
                <Text style={styles.newPillText}>Pesan baru</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>

      {elder ? (
        <View style={styles.footer}>
          <Ionicons name="lock-closed-outline" size={14} color={colors.textMuted} style={styles.footerIcon} />
          <Text style={styles.footerText}>
            Ini percakapan {honorific} dengan {companionName}, kirim pesan lewat{' '}
            <Text
              style={styles.footerLink}
              accessibilityRole="link"
              onPress={() => router.push('/titipan')}
            >
              Titipan
            </Text>
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  avatarRing: {
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.primarySoft,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  headerTitle: {
    ...typography.section,
  },
  headerSub: {
    ...typography.caption,
  },
  bannerWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  bodyNoFooter: {
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  centerBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  listWrap: {
    flex: 1,
  },
  listCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    overflow: 'hidden',
    ...shadow.card,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  paginationRow: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  newPill: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    minHeight: 44,
    ...shadow.card,
  },
  newPillPressed: {
    opacity: 0.85,
  },
  newPillText: {
    ...typography.button,
    color: colors.textOnPrimary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: TAB_BAR_CLEARANCE,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.card,
    backgroundColor: colors.surfaceMuted,
  },
  footerIcon: {
    marginTop: 1,
  },
  footerText: {
    ...typography.caption,
    flex: 1,
  },
  footerLink: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
});
