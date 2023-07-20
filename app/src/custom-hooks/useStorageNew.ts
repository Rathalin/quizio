import { SetStateAction, useCallback, useEffect, useState } from 'react';

function isBrowser() {
  return typeof window !== 'undefined';
}

export default function useStorageNew<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [key]);

  useEffect(() => {
    if (!loaded && isBrowser()) {
      const storedValue = window.localStorage.getItem(key);
      if (storedValue != null) {
        setValue(JSON.parse(storedValue));
        setLoaded(true);
      }
    }
  }, [key, loaded]);

  const setStorageValue = useCallback(
    (setStateAction: SetStateAction<T>) => {
      if (isBrowser()) {
        const newValue =
          typeof setStateAction === 'function'
            ? (setStateAction as (prevState: T) => T)(value)
            : setStateAction;
        localStorage.setItem(key, JSON.stringify(newValue));
      }
    },
    [key, value]
  );

  return [value, setStorageValue] as const;
}
