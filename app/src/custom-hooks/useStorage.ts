import { useCallback } from 'react';

const isBrowser = typeof window !== 'undefined';

export function useStorage<T>(
  key: string,
  storage: Storage | undefined = isBrowser ? localStorage : undefined
) {
  const getStorageItem = useCallback(() => {
    if (!isBrowser) return null;
    try {
      return JSON.parse(storage?.getItem(key) ?? '') as T;
    } catch (error) {
      return null;
    }
  }, [key, storage]);

  const setStorageItem = useCallback(
    (value: T) => {
      if (isBrowser) {
        storage?.setItem(key, JSON.stringify(value));
      }
    },
    [key, storage]
  );

  return { getStorageItem, setStorageItem };
}
