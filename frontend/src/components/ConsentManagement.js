import React, { useState, useEffect } from 'react';
import './ConsentManagement.css';
import { apiService } from '../services/apiService';
import { useWeb3 } from '../hooks/useWeb3';

const ConsentManagement = ({ account }) => {
  const { signMessage } = useWeb3();
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    purpose: '',
  });

  // Implement fetchConsents function
  useEffect(() => {
    const fetchConsents = async () => {
      setLoading(true);
      setError(null);

      try {
        // Call apiService.getConsents with appropriate filters
        const status =
          filterStatus === 'all' ? null : filterStatus;

        const data = await apiService.getConsents(null, status);

        // Update consents state
        setConsents(data.consents || data || []);
      } catch (err) {
        setError(err.message || 'Failed to load consents');
      } finally {
        setLoading(false);
      }
    };

    fetchConsents();
  }, [filterStatus]);

  // Implement createConsent function
  const handleCreateConsent = async (e) => {
    e.preventDefault();

    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const { patientId, purpose } = formData;

      // 1. Create message to sign
      const message = `I consent to: ${purpose} for patient: ${patientId}`;

      // 2. Sign the message
      const signature = await signMessage(message);

      // 3. Call apiService.createConsent
      await apiService.createConsent({
        patientId,
        purpose,
        walletAddress: account,
        signature,
      });

      // 4. Refresh consents and reset form
      setFormData({ patientId: '', purpose: '' });
      setShowCreateForm(false);

      // reload consents
      const refreshed = await apiService.getConsents(
        null,
        filterStatus === 'all' ? null : filterStatus
      );
      setConsents(refreshed.consents || refreshed || []);
    } catch (err) {
      alert('Failed to create consent: ' + err.message);
    }
  };

  // Implement updateConsentStatus function
  const handleUpdateStatus = async (consentId, newStatus) => {
    try {
      await apiService.updateConsent(consentId, {
        status: newStatus,
        blockchainTxHash: '0x-mock-tx-hash', // backend expects a hash
      });

      // Refresh consents list
      const refreshed = await apiService.getConsents(
        null,
        filterStatus === 'all' ? null : filterStatus
      );
      setConsents(refreshed.consents || refreshed || []);
    } catch (err) {
      alert('Failed to update consent: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="consent-management-container">
        <div className="loading">Loading consents...</div>
      </div>
    );
  }

  return (
    <div className="consent-management-container">
      <div className="consent-header">
        <h2>Consent Management</h2>
        <button
          className="create-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
          disabled={!account}
        >
          {showCreateForm ? 'Cancel' : 'Create New Consent'}
        </button>
      </div>

      {!account && (
        <div className="warning">
          Please connect your MetaMask wallet to manage consents
        </div>
      )}

      {showCreateForm && account && (
        <div className="create-consent-form">
          <h3>Create New Consent</h3>
          <form onSubmit={handleCreateConsent}>
            <div className="form-group">
              <label>Patient ID</label>
              <input
                type="text"
                value={formData.patientId}
                onChange={(e) =>
                  setFormData({ ...formData, patientId: e.target.value })
                }
                required
                placeholder="e.g., patient-001"
              />
            </div>
            <div className="form-group">
              <label>Purpose</label>
              <select
                value={formData.purpose}
                onChange={(e) =>
                  setFormData({ ...formData, purpose: e.target.value })
                }
                required
              >
                <option value="">Select purpose...</option>
                <option value="Research Study Participation">
                  Research Study Participation
                </option>
                <option value="Data Sharing with Research Institution">
                  Data Sharing with Research Institution
                </option>
                <option value="Third-Party Analytics Access">
                  Third-Party Analytics Access
                </option>
                <option value="Insurance Provider Access">
                  Insurance Provider Access
                </option>
              </select>
            </div>
            <button type="submit" className="submit-btn">
              Sign & Create Consent
            </button>
          </form>
        </div>
      )}

      <div className="consent-filters">
        <button
          className={filterStatus === 'all' ? 'active' : ''}
          onClick={() => setFilterStatus('all')}
        >
          All
        </button>
        <button
          className={filterStatus === 'active' ? 'active' : ''}
          onClick={() => setFilterStatus('active')}
        >
          Active
        </button>
        <button
          className={filterStatus === 'pending' ? 'active' : ''}
          onClick={() => setFilterStatus('pending')}
        >
          Pending
        </button>
      </div>

      {/* Display consents list */}
      <div className="consents-list">
        {consents.length === 0 ? (
          <div className="placeholder">
            <p>No consents found</p>
          </div>
        ) : (
          consents.map((consent) => (
            <div key={consent.id} className="consent-card">
              <p><strong>Patient:</strong> {consent.patientId}</p>
              <p><strong>Purpose:</strong> {consent.purpose}</p>
              <p><strong>Status:</strong> {consent.status}</p>
              <p><strong>Created:</strong> {new Date(consent.createdAt).toLocaleString()}</p>

              {consent.blockchainTxHash && (
                <p className="hash">
                  <strong>Tx Hash:</strong> {consent.blockchainTxHash}
                </p>
              )}

              {consent.status === 'pending' && (
                <button
                  className="activate-btn"
                  onClick={() => handleUpdateStatus(consent.id, 'active')}
                >
                  Activate
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConsentManagement;
