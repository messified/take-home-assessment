import React, { useState, useEffect } from 'react';
import './TransactionHistory.css';
import { apiService } from '../services/apiService';

const TransactionHistory = ({ account }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Implement fetchTransactions
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);

      try {
        // Call apiService.getTransactions with account address if available
        const data = await apiService.getTransactions(account || null, 20);

        // Update transactions state
        setTransactions(data.transactions || data || []);
      } catch (err) {
        setError(err.message || 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [account]);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return isNaN(date.getTime())
      ? timestamp
      : date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="transaction-history-container">
        <div className="loading">Loading transactions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="transaction-history-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="transaction-history-container">
      <div className="transaction-header">
        <h2>Transaction History</h2>
        {account && (
          <div className="wallet-filter">
            Filtering for: {formatAddress(account)}
          </div>
        )}
      </div>

      <div className="transactions-list">
        {transactions.length === 0 ? (
          <div className="placeholder">
            <p>No transactions found</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="transaction-card">
              <div className="transaction-row">
                <span className="label">Type:</span>
                <span>{tx.type}</span>
              </div>

              <div className="transaction-row">
                <span className="label">From:</span>
                <span>{formatAddress(tx.from)}</span>
              </div>

              <div className="transaction-row">
                <span className="label">To:</span>
                <span>{formatAddress(tx.to)}</span>
              </div>

              <div className="transaction-row">
                <span className="label">Amount:</span>
                <span>{tx.amount} {tx.currency}</span>
              </div>

              <div className="transaction-row">
                <span className="label">Status:</span>
                <span>{tx.status}</span>
              </div>

              <div className="transaction-row">
                <span className="label">Date:</span>
                <span>{formatDate(tx.timestamp)}</span>
              </div>

              {tx.blockchainTxHash && (
                <div className="transaction-row">
                  <span className="label">Hash:</span>
                  <span className="hash">{tx.blockchainTxHash}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
