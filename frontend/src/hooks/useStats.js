import { useEffect, useState } from 'react';
import { apiService } from '../services/apiService';

/**
 * Hook to fetch platform statistics
 */
export function useStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      setLoading(true);
      setError(null);

      try {
        const data = await apiService.getStats();
        if (!cancelled) {
          setStats(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load statistics');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    stats,
    loading,
    error,
  };
}
