
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';

import Sidebar from '../components/Sidebar.jsx';
import Header from '../components/Header.jsx';
import ClaimsTable from '../components/ClaimsTable.jsx';
import { getClaims } from '../services/api.js';

function Claims() {
  const navigate = useNavigate();

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getClaims()
      .then((response) => setClaims(response.data))
      .catch((err) => {
        setError(err.response?.data?.message || 'Unable to load claims.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="dashboard-content">
          <div className="page-heading">
            <div>
              <h1>Claims Management</h1>
              <p>Manage and monitor all product claims.</p>
            </div>

            <button
              className="create-claim-button"
              onClick={() => navigate('/claims/new')}
            >
              <Plus size={19} />
              Create New Claim
            </button>
          </div>

          <div className="page-summary-card">
            <FileText size={25} />
            <div>
              <h2>{claims.length}</h2>
              <p>Total registered claims</p>
            </div>
          </div>

          {loading ? (
            <p>Loading claims...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : claims.length === 0 ? (
            <p>No claims found. Create your first claim.</p>
          ) : (
            <ClaimsTable claims={claims} />
          )}
        </section>
      </main>
    </div>
  );
}

export default Claims;
