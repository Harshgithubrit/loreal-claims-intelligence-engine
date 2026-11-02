
import { Routes, Route, Navigate } from 'react-router-dom';

import Dashboard from './pages/Dashboard.jsx';
import Claims from './pages/Claims.jsx';
import ClaimDetails from './pages/ClaimDetails.jsx';
import CreateClaim from './pages/CreateClaim.jsx';
import ClinicalEvidence from './pages/ClinicalEvidence.jsx';
import Assessments from './pages/Assessments.jsx';
import Settings from './pages/Settings.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />

      <Route path="/claims" element={<Claims />} />
      <Route path="/claims/new" element={<CreateClaim />} />
      <Route path="/claims/:id" element={<ClaimDetails />} />

      <Route path="/clinical-evidence" element={<ClinicalEvidence />} />
      <Route path="/assessments" element={<Assessments />} />
      <Route path="/settings" element={<Settings />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
