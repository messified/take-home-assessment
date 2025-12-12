import React, { useState, useEffect } from 'react';
import './PatientDetail.css';
import { apiService } from '../services/apiService';

const PatientDetail = ({ patientId, onBack }) => {
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Implement fetchPatientData function
  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch patient data
        const patientData = await apiService.getPatient(patientId);

        // Fetch patient records
        const recordsData = await apiService.getPatientRecords(patientId);

        // Update state with fetched data
        setPatient(patientData);
        setRecords(recordsData.records || recordsData || []);
      } catch (err) {
        setError(err.message || 'Failed to load patient data');
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  if (loading) {
    return (
      <div className="patient-detail-container">
        <div className="loading">Loading patient details...</div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="patient-detail-container">
        <div className="error">
          Error loading patient: {error || 'Patient not found'}
        </div>
        <button onClick={onBack} className="back-btn">Back to List</button>
      </div>
    );
  }

  return (
    <div className="patient-detail-container">
      <div className="patient-detail-header">
        <button onClick={onBack} className="back-btn">← Back to List</button>
      </div>

      <div className="patient-detail-content">
        {/* Patient information */}
        <div className="patient-info-section">
          <h2>Patient Information</h2>

          <p><strong>Name:</strong> {patient.name}</p>
          <p><strong>Email:</strong> {patient.email}</p>
          <p><strong>Date of Birth:</strong> {patient.dateOfBirth}</p>
          <p><strong>Gender:</strong> {patient.gender}</p>
          <p><strong>Phone:</strong> {patient.phone}</p>
          <p><strong>Address:</strong> {patient.address}</p>
          <p><strong>Wallet:</strong> {patient.walletAddress}</p>
        </div>

        {/* Patient records */}
        <div className="patient-records-section">
          <h2>Medical Records ({records.length})</h2>

          {records.length === 0 ? (
            <div className="placeholder">
              <p>No medical records found</p>
            </div>
          ) : (
            records.map((record) => (
              <div key={record.id} className="record-card">
                <p><strong>Type:</strong> {record.type}</p>
                <p><strong>Title:</strong> {record.title}</p>
                <p><strong>Date:</strong> {new Date(record.date).toLocaleDateString()}</p>
                <p><strong>Doctor:</strong> {record.doctor}</p>
                <p><strong>Hospital:</strong> {record.hospital}</p>
                <p><strong>Status:</strong> {record.status}</p>

                {record.blockchainHash && (
                  <p className="hash">
                    <strong>Blockchain Hash:</strong> {record.blockchainHash}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
