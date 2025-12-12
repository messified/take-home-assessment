import { useEffect, useState } from 'react';
import { apiService } from '../services/apiService';

/**
 * Hook to fetch blockchain transactions
 */
export function useTransactions({ walletAddress = null, limit = 20 } = {}) {
  const [transactions, setTransactions] = useState([]);
  const [walletFilter, setWalletFilter] = useState(walletAddress);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTransactions() {
      setLoading(true);
      setError(null);

      try {
        const data = await apiService.getTransactions(
          walletFilter || null,
          limit
        );
        if (!cancelled) {
          setTransactions(data.transactions || data || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load transactions');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTransactions();

    return () => {
      cancelled = true;
    };
  }, [walletFilter, limit]);

  return {
    transactions,
    loading,
    error,
    walletFilter,
    setWalletFilter,
  };
}
