
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
} from 'lucide-react';

import { getClaims } from '../services/api.js';
import Sidebar from '../components/Sidebar.jsx';
import Header from '../components/Header.jsx';
import StatCard from '../components/StatCard.jsx';
import ClaimsTable from '../components/ClaimsTable.jsx';

function Dashboard() {
  const navigate = useNavigate();

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getClaims()
      .then((response) => setClaims(response.data))
      .catch((err) => {
        setError(
          err.response?.data?.message || 'Unable to load claims'
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const total = claims.length;

  const pending = claims.filter(
    (c) => ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW'].includes(c.status)
  ).length;

  const assessed = claims.filter(
    (c) => c.status === 'ASSESSED'
  ).length;

  const rejected = claims.filter(
    (c) => c.status === 'REJECTED'
  ).length;

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="dashboard-content">

          {/* Dashboard heading and Create Claim button */}
          <div className="welcome dashboard-welcome">
            <div>
              <h1>Welcome to Claims Intelligence</h1>
              <p>
                Monitor product claims and clinical evidence assessments.
              </p>
            </div>

            <button
              className="create-claim-button"
              onClick={() => navigate('/claims/new')}
            >
              <Plus size={19} />
              Create New Claim
            </button>
          </div>

          {loading ? (
            <p>Loading dashboard...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : (
            <>
              <div className="stats-grid">
                <StatCard
                  title="Total Claims"
                  value={total}
                  description="All registered claims"
                  icon={FileText}
                />

                <StatCard
                  title="Pending Review"
                  value={pending}
                  description="Awaiting assessment"
                  icon={Clock}
                />

                <StatCard
                  title="Assessed Claims"
                  value={assessed}
                  description="Assessment completed"
                  icon={CheckCircle}
                />

                <StatCard
                  title="Rejected Claims"
                  value={rejected}
                  description="Rejected submissions"
                  icon={AlertCircle}
                />
              </div>

              <ClaimsTable claims={claims} />
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
