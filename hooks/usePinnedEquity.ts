'use client';

import { useSyncExternalStore, useCallback, useEffect, useRef } from 'react';

const STORAGE_KEY = 'hammer_pinned_equity_id';
const CHANGE_EVENT = 'hammer-pin-change';
const SYNC_ERROR_EVENT = 'hammer-pin-sync-error';

let _syncError = false;
const _syncErrorListeners = new Set<() => void>();

function getSyncErrorSnapshot(): boolean {
  return _syncError;
}

function subscribeSyncError(callback: () => void): () => void {
  _syncErrorListeners.add(callback);
  if (typeof window !== 'undefined') {
    window.addEventListener(SYNC_ERROR_EVENT, callback);
    return () => {
      _syncErrorListeners.delete(callback);
      window.removeEventListener(SYNC_ERROR_EVENT, callback);
    };
  }
  return () => {
    _syncErrorListeners.delete(callback);
  };
}

function setSyncError(value: boolean) {
  if (_syncError === value) return;
  _syncError = value;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(SYNC_ERROR_EVENT));
  }
}

function getSnapshot(): string | null {
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY);
    }
  } catch {}
  return null;
}

function subscribe(callback: () => void): () => void {
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', callback);
    window.addEventListener(CHANGE_EVENT, callback);
    return () => {
      window.removeEventListener('storage', callback);
      window.removeEventListener(CHANGE_EVENT, callback);
    };
  }
  return () => {};
}

function dispatchChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}

export function usePinnedEquity() {
  const pinnedId = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const syncError = useSyncExternalStore(subscribeSyncError, getSyncErrorSnapshot, () => false);

  const setPinnedId = useCallback((id: string) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, id);
      }
    } catch {}
    dispatchChange();
  }, []);

  const clearPinnedId = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {}
    dispatchChange();
    setSyncError(false);
  }, []);

  return { pinnedId, setPinnedId, clearPinnedId, syncError };
}
