import { useEffect, useState, type DependencyList } from 'react';
import { api } from './api';

interface AsyncState<T> {
  data?: T;
  loading: boolean;
  error?: Error;
}

export function useAsync<T>(load: () => Promise<T>, deps: DependencyList) {
  const [state, setState] = useState<AsyncState<T>>({ loading: true });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setState({ loading: true });
    load().then(
      (data) => active && setState({ data, loading: false }),
      (error: Error) => active && setState({ loading: false, error }),
    );
    return () => {
      active = false;
    };
  }, [...deps, attempt]);

  return { ...state, retry: () => setAttempt((n) => n + 1) };
}

export const useCatalog = () => useAsync(api.catalog, []);

export function useTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} | Amazon.com.br` : 'Amazon.com.br | Clone de portfólio';
  }, [title]);
}

export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? (JSON.parse(saved) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // modo privado / armazenamento cheio: o estado continua funcionando em memória
    }
  }, [key, value]);

  return [value, setValue] as const;
}
