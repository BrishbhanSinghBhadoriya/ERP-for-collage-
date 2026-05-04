'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseFetchOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useFetch<T>(
  apiCall: (...args: any[]) => Promise<any>,
  options: UseFetchOptions = {}
) {
  const { immediate = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!!immediate);
  const [error, setError] = useState<any>(null);

  // Use refs to keep track of the latest apiCall and options without triggering re-renders
  const apiCallRef = useRef(apiCall);
  const optionsRef = useRef(options);

  useEffect(() => {
    apiCallRef.current = apiCall;
    optionsRef.current = options;
  }, [apiCall, options]);

  const execute = useCallback(async (...args: any[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCallRef.current(...args);
      const result = response.data;
      setData(result);
      if (optionsRef.current.onSuccess) optionsRef.current.onSuccess(result);
      return result;
    } catch (err: any) {
      setError(err);
      if (optionsRef.current.onError) optionsRef.current.onError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { data, loading, error, execute, setData };
}
