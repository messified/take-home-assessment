import { useEffect, useState } from 'react';
import { apiService } from '../services/apiService';

/**
 * Hook to manage patient consents
 */
export function useConsents({ patientId, defaultStatus = '' } = {}) {
  const [consents, setConsents] = useState([]);
  const [statusFilter, setStatusFilter] = useState(defaultStatus);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function loadConsents() {
    setLoading(true);
    setError(null);

    try {
      const data = await apiService.getConsents(
        patientId || null,
        statusFilter || null
      );
      setConsents(data.consents || data || []);
    } catch (err) {
      setError(err.message || 'Failed to load consents');
    } finally {
      setLoading(false);
    }
  }

  async function createNewConsent(consentPayload) {
    await apiService.createConsent(consentPayload);
    await loadConsents();
  }

  async function activateConsent(consentId, blockchainTxHash) {
    await apiService.updateConsent(consentId, {
      status: 'active',
      blockchainTxHash,
    });
    await loadConsents();
  }

  useEffect(() => {
    loadConsents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, statusFilter]);

  return {
    consents,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    createNewConsent,
    activateConsent,
    refresh: loadConsents,
  };
}
