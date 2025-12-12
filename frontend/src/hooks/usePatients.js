import { useEffect, useState } from 'react';
import { apiService } from '../services/apiService';

/**
 * Hook to manage patient list, search, and pagination
 */
export function usePatients() {
  const [patients, setPatients] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPatients() {
      setLoading(true);
      setError(null);

      try {
        const data = await apiService.getPatients(page, limit, search);
        if (!cancelled) {
          setPatients(data.patients || []);
          setTotal(data.total || 0);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load patients');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPatients();

    return () => {
      cancelled = true;
    };
  }, [page, limit, search]);

  return {
    patients,
    page,
    limit,
    total,
    search,
    loading,
    error,
    setPage,
    setSearch,
  };
}
