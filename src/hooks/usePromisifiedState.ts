import { useState, useCallback, useEffect, useRef } from 'react';

export const usePromisifiedState = <T>(initialState?: T) => {
  const [state, setState] = useState(initialState);
  const init = useRef(typeof initialState !== 'undefined');
  const resolver = useRef<(value: T) => void>(null);

  const setWithPromise = useCallback((value: T) => {
    setState(value);

    return new Promise<T>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  useEffect(() => {
    if (init.current) {
      init.current = false;
      return;
    }

    if (resolver.current) {
      resolver.current(state);
      resolver.current = null;
    }
  }, [state]);

  return [state, setWithPromise] as const;
};
