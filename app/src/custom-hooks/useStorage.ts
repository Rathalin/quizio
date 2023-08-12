import { isBrowser } from '@/utilities/isBrowser';
import { SetStateAction, useCallback, useEffect, useState } from 'react';

export default function useStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [key]);

  useEffect(() => {
    if (!loaded && isBrowser()) {
      const storedValue = localStorage.getItem(key);
      try {
        if (storedValue != null) {
          setValue(JSON.parse(storedValue) as T);
        }
      } catch (e) {
        console.error(`Invalid localStorage value for key '${key}'`);
      } finally {
        setLoaded(true);
      }
    }
  }, [key, loaded]);

  const setStorageValue = useCallback(
    (setStateAction: SetStateAction<T>) => {
      if (isBrowser()) {
        setValue((prevState) => {
          const newValue =
            typeof setStateAction === 'function'
              ? (setStateAction as (prevState: T) => T)(prevState)
              : setStateAction;
          localStorage.setItem(key, JSON.stringify(newValue));
          return newValue;
        });
      }
    },
    [key]
  );

  return [value, setStorageValue] as const;
}
