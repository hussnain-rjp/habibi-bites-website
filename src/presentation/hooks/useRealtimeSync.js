import { useEffect, useRef } from 'react';
import { getSupabaseClient } from '../../infrastructure/supabase/client.js';

/**
 * useRealtimeSync
 *
 * Opens a single Supabase Realtime channel that listens for INSERT / UPDATE /
 * DELETE events on the given tables.  When any change arrives, `onUpdate` is
 * called with `(tableName, payload)` so the calling component can decide how
 * to react (usually: re-fetch that table's data from the DB).
 *
 * @param {string[]}  tables   - Table names to watch, e.g. ['menu_items', 'settings']
 * @param {Function}  onUpdate - Called as `onUpdate(table, payload)` on every change
 * @param {string}    [channelName] - Optional unique channel identifier
 */
export function useRealtimeSync(tables, onUpdate, channelName) {
  const onUpdateRef = useRef(onUpdate);
  // Keep ref in sync so we never need to re-subscribe when the callback changes
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client || !tables || tables.length === 0) return;

    const name = channelName || `habibi-realtime-${tables.join('-')}`;
    let channel = client.channel(name);

    tables.forEach((table) => {
      channel = channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          onUpdateRef.current(table, payload);
        }
      );
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIPTION_ERROR') {
        console.warn(`[useRealtimeSync] Subscription error on channel "${name}"`);
      }
    });

    return () => {
      try {
        client.removeChannel(channel);
      } catch (err) {
        // Ignore cleanup errors
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tables.join(','), channelName]);
}
