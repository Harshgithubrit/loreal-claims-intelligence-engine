
import { Link } from 'react-router-dom';

function ClaimsTable({ claims }) {
  return (
    <div className="table-container">
      <div className="table-heading">
        <h3>Recent Claims</h3>
        <span>{claims.length} total claims</span>
      </div>

      <table>
        <thead>
          <tr>
            <th>PRODUCT</th>
            <th>CLAIM</th>
            <th>CATEGORY</th>
            <th>STATUS</th>
          </tr>
        </thead>

        <tbody>
          {claims.map((claim) => (
            <tr key={claim.id}>
              <td>
                <Link
                  to={`/claims/${claim.id}`}
                  className="claim-link"
                >
                  {claim.productName}
                </Link>
              </td>

              <td>{claim.claimText}</td>
              <td>{claim.claimCategory}</td>

              <td>
                <span className={`status ${claim.status.toLowerCase()}`}>
                  {claim.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {claims.length === 0 && (
        <p className="empty-state">No claims available.</p>
      )}
    </div>
  );
}

export default ClaimsTable;
