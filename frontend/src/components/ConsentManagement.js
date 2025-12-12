import React, { useState, useEffect } from 'react';
import './ConsentManagement.css';
import { apiService } from '../services/apiService';
import { useWeb3 } from '../hooks/useWeb3';

const ConsentManagement = ({ account }) => {
  const { signMessage } = useWeb3();

  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [formData, setFormData] = useState({
    patientId: '',
    purpose: '',
  });

  /**
   * Fetch consents (centralized so it can be reused)
   */
  const fetchConsents = async () => {
    setLoading(true);
    setError(null);

    try {
      const status = filterStatus === 'all' ? null : filterStatus;
      const response = await apiService.getConsents(null, status);

      const list = response.consents || response || [];

      // The API returns consents chronologically, so I apply a simple descending sort on createdAt client-side to present the most recent activity first, which aligns better with user expectations.
      const sorted = [...list].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setConsents(sorted);
    } catch (err) {
      setError(err.message || 'Failed to load consents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsents();
  }, [filterStatus]);

  /**
   * Create new consent with MetaMask signature
   */
  const handleCreateConsent = async (e) => {
    e.preventDefault();

    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    if (!formData.patientId || !formData.purpose) {
      alert('Please complete all fields');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const message = `I consent to: ${formData.purpose} for patient: ${formData.patientId}`;
      const signature = await signMessage(message);

      await apiService.createConsent({
        patientId: formData.patientId,
        purpose: formData.purpose,
        walletAddress: account,
        signature,
      });

      setFormData({ patientId: '', purpose: '' });
      setShowCreateForm(false);

      await fetchConsents();
    } catch (err) {
      alert('Failed to create consent: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Update consent status
   */
  const handleUpdateStatus = async (consentId, newStatus) => {
    try {
      await apiService.updateConsent(consentId, {
        status: newStatus,
        blockchainTxHash: '0x-mock-tx-hash',
      });

      await fetchConsents();
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
                <option value="Research Study Participation">Research Study Participation</option>
                <option value="Data Sharing with Research Institution">Data Sharing with Research Institution</option>
                <option value="Third-Party Analytics Access">Third-Party Analytics Access</option>
                <option value="Insurance Provider Access">Insurance Provider Access</option>
              </select>
            </div>

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? 'Signing...' : 'Sign & Create Consent'}
            </button>
          </form>
        </div>
      )}

      <div className="consent-filters">
        {['all', 'active', 'pending'].map((status) => (
          <button
            key={status}
            className={filterStatus === status ? 'active' : ''}
            onClick={() => setFilterStatus(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="consents-list">
        {consents.length === 0 ? (
          <div className="placeholder">No consents found</div>
        ) : (
          consents.map((consent) => (
            <div key={consent.id} className="consent-card">
              <div className="consent-header-info">
                <span className="consent-purpose">{consent.purpose}</span>
                <span className={`consent-status ${consent.status}`}>
                  {consent.status}
                </span>
              </div>

              <div className="consent-details">
                <div className="consent-detail-item">
                  <strong>Patient:</strong> {consent.patientId}
                </div>
                <div className="consent-detail-item">
                  <strong>Created:</strong>{' '}
                  {new Date(consent.createdAt).toLocaleString()}
                </div>
                {consent.blockchainTxHash && (
                  <div className="consent-tx-hash">
                    {consent.blockchainTxHash}
                  </div>
                )}
              </div>

              {consent.status === 'pending' && (
                <div className="consent-actions">
                  <button
                    className="action-btn primary"
                    onClick={() => handleUpdateStatus(consent.id, 'active')}
                  >
                    Activate
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConsentManagement;
