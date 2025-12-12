import React, { useState, useEffect } from 'react';
import './PatientList.css';
import { apiService } from '../services/apiService';

const PatientList = ({ onSelectPatient }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Implement the fetchPatients function
  const fetchPatients = async () => {
    setLoading(true);
    setError(null);

    try {
      // Call API and update state
      const data = await apiService.getPatients(currentPage, 10, searchTerm);

      setPatients(data.patients || []);
      setPagination({
        total: data.total,
        page: currentPage,
        limit: 10,
        totalPages: Math.ceil((data.total || 0) / 10),
      });
    } catch (err) {
      setError(err.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [currentPage, searchTerm]);

  // Implement search functionality
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // reset to first page on new search
  };

  if (loading) {
    return (
      <div className="patient-list-container">
        <div className="loading">Loading patients...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="patient-list-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="patient-list-container">
      <div className="patient-list-header">
        <h2>Patients</h2>

        {/* Search input field */}
        <input
          type="text"
          placeholder="Search patients..."
          className="search-input"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {/* Patient list display */}
      <div className="patient-list">
        {patients.length === 0 ? (
          <div className="placeholder">
            <p>No patients found</p>
          </div>
        ) : (
          patients.map((patient) => (
            <div
              key={patient.id}
              className="patient-card"
              onClick={() => onSelectPatient(patient.id)}
            >
              <h3>{patient.name}</h3>
              <p>{patient.email}</p>
              <p>{patient.gender}</p>
              <p>{patient.phone}</p>
            </div>
          ))
        )}
      </div>

      {/* Pagination controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Previous
          </button>

          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            disabled={currentPage === pagination.totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientList;
