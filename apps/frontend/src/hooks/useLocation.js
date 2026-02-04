import { useState, useCallback, useEffect, useRef } from "react";

const defaultOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
};

/**
 * Hook for browser Geolocation API: one-shot and continuous watch.
 * Returns { position: { lat, lng } | null, error: string | null, loading: boolean, requestPosition, startWatching, stopWatching, isWatching }.
 * Use requestPosition() for a single update; startWatching()/stopWatching() for live updates (e.g. "Show my location" on map).
 */
export function useLocation(options = {}) {
  const opts = { ...defaultOptions, ...options };
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const watchIdRef = useRef(null);

  const clearError = useCallback(() => setError(null), []);

  const handleSuccess = useCallback((coords) => {
    setPosition({ lat: coords.latitude, lng: coords.longitude });
    setError(null);
    setLoading(false);
  }, []);

  const handleError = useCallback((err) => {
    setPosition(null);
    setLoading(false);
    if (err.code === 1) {
      setError("Location permission denied.");
    } else if (err.code === 2) {
      setError("Location unavailable.");
    } else if (err.code === 3) {
      setError("Location request timed out.");
    } else {
      setError(err?.message || "Location error.");
    }
  }, []);

  const requestPosition = useCallback(() => {
    if (!navigator?.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }
    setError(null);
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => handleSuccess(pos.coords),
      handleError,
      opts
    );
  }, [opts.enableHighAccuracy, opts.timeout, opts.maximumAge, handleSuccess, handleError]);

  const startWatching = useCallback(() => {
    if (!navigator?.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }
    if (watchIdRef.current != null) return;
    setError(null);
    setLoading(true);
    const id = navigator.geolocation.watchPosition(
      (pos) => handleSuccess(pos.coords),
      handleError,
      opts
    );
    watchIdRef.current = id;
    setIsWatching(true);
  }, [opts.enableHighAccuracy, opts.timeout, opts.maximumAge, handleSuccess, handleError]);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current != null) {
      navigator.geolocation?.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsWatching(false);
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  return {
    position,
    error,
    loading,
    isWatching,
    requestPosition,
    startWatching,
    stopWatching,
    clearError,
  };
}

export default useLocation;
