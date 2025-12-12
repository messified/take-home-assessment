import { useEffect, useState } from 'react';
import { apiService } from '../services/apiService';

/**
 * Hook to fetch a single patient and their records
 */
export function usePatientDetail(patientId) {
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!patientId) return;

    let cancelled = false;

    async function loadPatient() {
      setLoading(true);
      setError(null);

      try {
        const [patientData, recordData] = await Promise.all([
          apiService.getPatient(patientId),
          apiService.getPatientRecords(patientId),
        ]);

        if (!cancelled) {
          setPatient(patientData);
          setRecords(recordData.records || recordData || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load patient details');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPatient();

    return () => {
      cancelled = true;
    };
  }, [patientId]);

  return {
    patient,
    records,
    loading,
    error,
  };
}
