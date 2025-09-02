import { useState, useEffect, useCallback, useMemo } from 'react';
import { assetManager, AssetType } from './AssetManager';

/**
 * Custom hook for fetching assets in React components
 */

export interface UseAssetOptions {
  preload?: boolean;
  fallback?: string;
  folder?: string;
}

export interface AssetState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook for fetching JSON data
 */
export function useJsonAsset<T = any>(
  name: string | null,
  options: UseAssetOptions = {}
): AssetState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!name) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await assetManager.fetchJson<T>(name, options.folder);
      setData(result);
      setLoading(false);
    } catch (error) {
      setData(null);
      setLoading(false);
      setError(error instanceof Error ? error : new Error('Unknown error'));
    }
  }, [name, options.folder]);

  useEffect(() => {
    if (options.preload || name) {
      fetchData();
    }
  }, [fetchData, options.preload, name]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

/**
 * Hook for fetching image URLs
 */
export function useImageAsset(
  name: string | null,
  options: UseAssetOptions = {}
): AssetState<string> {
  const [data, setData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!name) {
      setData(options.fallback || null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = await assetManager.fetchImageUrl(name, options.folder);
      setData(url);
      setLoading(false);
    } catch (error) {
      setData(options.fallback || null);
      setLoading(false);
      setError(error instanceof Error ? error : new Error('Unknown error'));
    }
  }, [name, options.folder, options.fallback]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

/**
 * Hook for fetching texture URLs from JSON paths (for Three.js)
 */
export function useTextureAssetsFromPaths(paths: string[] | null): AssetState<string[]> {
  const [data, setData] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Memoize the paths array to prevent unnecessary re-renders
  const memoizedPaths = useMemo(() => paths, [paths ? paths.join(',') : null]);

  const fetchData = useCallback(async () => {
    if (!memoizedPaths || memoizedPaths.length === 0) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const urls = await assetManager.fetchTextureUrlsFromPaths(memoizedPaths);
      setData(urls);
      setLoading(false);
    } catch (error) {
      setData(null);
      setLoading(false);
      setError(error instanceof Error ? error : new Error('Unknown error'));
    }
  }, [memoizedPaths]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

/**
 * Hook for fetching texture URLs (for Three.js) - legacy method
 */
export function useTextureAssets(names: string[] | null): AssetState<string[]> {
  const [data, setData] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Memoize the names array to prevent unnecessary re-renders
  const memoizedNames = useMemo(() => names, [names ? names.join(',') : null]);

  const fetchData = useCallback(async () => {
    if (!memoizedNames || memoizedNames.length === 0) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const urls = await assetManager.fetchTextureUrls(memoizedNames);
      setData(urls);
      setLoading(false);
    } catch (error) {
      setData(null);
      setLoading(false);
      setError(error instanceof Error ? error : new Error('Unknown error'));
    }
  }, [memoizedNames]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

/**
 * Hook for fetching image URL from JSON path
 */
export function useImageAssetFromPath(path: string | null): AssetState<string> {
  const [data, setData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!path) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = await assetManager.fetchImageUrlFromPath(path);
      setData(url);
      setLoading(false);
    } catch (error) {
      setData(null);
      setLoading(false);
      setError(error instanceof Error ? error : new Error('Unknown error'));
    }
  }, [path]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

/**
 * Hook for fetching document URLs from JSON paths
 */
export function useDocumentAssetFromPath(path: string | null): AssetState<string> {
  const [data, setData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!path) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = await assetManager.fetchDocumentUrlFromPath(path);
      setData(url);
      setLoading(false);
    } catch (error) {
      setData(null);
      setLoading(false);
      setError(error instanceof Error ? error : new Error('Unknown error'));
    }
  }, [path]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

/**
 * Hook for fetching document URLs (PDFs, etc.)
 */
export function useDocumentAsset(
  name: string | null,
  options: UseAssetOptions = {}
): AssetState<string> {
  const [data, setData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!name) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = await assetManager.fetchDocumentUrl(name, options.folder);
      setData(url);
      setLoading(false);
    } catch (error) {
      setData(null);
      setLoading(false);
      setError(error instanceof Error ? error : new Error('Unknown error'));
    }
  }, [name, options.folder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

/**
 * Generic hook for any asset type
 */
export function useAsset(
  name: string | null,
  type: AssetType,
  options: UseAssetOptions = {}
): AssetState<string> {
  const [data, setData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!name) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = await assetManager.fetchAssetUrl(name, type, options.folder);
      setData(url);
      setLoading(false);
    } catch (error) {
      setData(null);
      setLoading(false);
      setError(error instanceof Error ? error : new Error('Unknown error'));
    }
  }, [name, type, options.folder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

/**
 * Hook for preloading multiple assets
 */
export function useAssetPreloader(
  assets: Array<{ name: string; type: AssetType; folder?: string }> | null
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!assets || assets.length === 0) return;

    const preload = async () => {
      setLoading(true);
      setError(null);

      try {
        await assetManager.preloadAssets(assets);
      } catch (error) {
        setError(error instanceof Error ? error : new Error('Preload failed'));
      } finally {
        setLoading(false);
      }
    };

    preload();
  }, [assets]);

  return { loading, error };
}
