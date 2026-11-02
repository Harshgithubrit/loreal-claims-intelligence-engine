
import { useEffect, useState } from 'react';
import { ClipboardCheck } from 'lucide-react';

import Sidebar from '../components/Sidebar.jsx';
import Header from '../components/Header.jsx';
import {
  getClaims,
  getAssessmentHistory,
} from '../services/api.js';

function Assessments() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAssessments() {
      try {
        const claimsResponse = await getClaims();

        const results = await Promise.all(
          claimsResponse.data.map(async (claim) => {
            const response = await getAssessmentHistory(claim.id);

console.log('Claim ID:', claim.id);
console.log('Assessment API Response:', response.data);

const assessmentList = Array.isArray(response.data)
  ? response.data
  : response.data?.assessments ||
    response.data?.data ||
    response.data?.items ||
    [];

if (!Array.isArray(assessmentList)) {
  throw new Error('Unexpected assessment API response format');
}

return assessmentList.map((item) => ({
  ...item,
  productName: claim.productName,
  claimText: claim.claimText,
}));
          })
        );

        setAssessments(results.flat());
      } catch (err) {
  console.error('Assessment API Error:', err);
  console.error('Response:', err.response?.data);
  console.error('Status:', err.response?.status);

  setError(
    err.response?.data?.message ||
    err.message ||
    'Unable to load assessments.'
  );
}finally {
        setLoading(false);
      }
    }

    loadAssessments();
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="dashboard-content">
          <h1>AI Assessments</h1>
          <p>Review AI-powered product claim evaluations.</p>

          <div className="page-summary-card">
            <ClipboardCheck size={25} />
            <div>
              <h2>{assessments.length}</h2>
              <p>Total assessments</p>
            </div>
          </div>

          {loading ? (
            <p>Loading assessments...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : assessments.length === 0 ? (
            <p>No assessments available yet.</p>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Claim</th>
                    <th>Status</th>
                    <th>Confidence</th>
                    <th>Recommendation</th>
                  </tr>
                </thead>

                <tbody>
                  {assessments.map((item) => (
                    <tr key={item.id}>
                      <td>{item.productName}</td>
                      <td>{item.claimText}</td>
                      <td>{item.status}</td>
                      <td>
                        {item.confidenceScore != null
                          ? `${(Number(item.confidenceScore) * 100).toFixed(1)}%`
                          : '-'}
                      </td>
                      <td>{item.recommendation || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Assessments;
