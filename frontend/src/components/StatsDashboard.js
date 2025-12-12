import React, { useState, useEffect } from 'react';
import './StatsDashboard.css';
import { apiService } from '../services/apiService';

const StatsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Implement fetchStats function
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        // Call apiService.getStats()
        const data = await apiService.getStats();

        // Update stats state
        setStats(data);
      } catch (err) {
        setError(err.message || 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="stats-dashboard-container">
        <div className="loading">Loading statistics...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="stats-dashboard-container">
        <div className="error">
          Error loading statistics: {error || 'No data available'}
        </div>
      </div>
    );
  }

  return (
    <div className="stats-dashboard-container">
      <h2>Platform Statistics</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.totalPatients}</h3>
          <p>Total Patients</p>
        </div>

        <div className="stat-card">
          <h3>{stats.totalRecords}</h3>
          <p>Total Records</p>
        </div>

        <div className="stat-card">
          <h3>{stats.totalConsents}</h3>
          <p>Total Consents</p>
        </div>

        <div className="stat-card">
          <h3>{stats.activeConsents}</h3>
          <p>Active Consents</p>
        </div>

        <div className="stat-card">
          <h3>{stats.pendingConsents}</h3>
          <p>Pending Consents</p>
        </div>

        <div className="stat-card">
          <h3>{stats.totalTransactions}</h3>
          <p>Total Transactions</p>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
