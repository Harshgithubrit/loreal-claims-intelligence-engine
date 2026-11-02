
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import {
  ArrowLeft,
  FileText,
  Microscope,
  ClipboardCheck,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

import {
  getClaimById,
  getClinicalEvidence,
  getAssessmentHistory,
  runAssessment,
  addClinicalEvidence,
} from '../services/api.js';

function ClaimDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Claim and evidence state
  const [claim, setClaim] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [assessments, setAssessments] = useState([]);

  // Loading and message state
  const [loading, setLoading] = useState(true);
  const [assessing, setAssessing] = useState(false);
  const [savingEvidence, setSavingEvidence] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Evidence form state
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);

  const initialEvidenceForm = {
    studyTitle: '',
    studyDesign: 'Randomized, double-blind, placebo-controlled',
    population: '',
    sampleSize: '',
    durationWeeks: '',
    methodology: '',
    endpoint: '',
    baselineMean: '',
    followUpMean: '',
    controlBaselineMean: '',
    controlFollowUpMean: '',
    pValue: '',
    confidenceIntervalLower: '',
    confidenceIntervalUpper: '',
    limitations: 'Synthetic data for software testing',
    isSynthetic: true,
  };

  const [evidenceForm, setEvidenceForm] = useState(
    initialEvidenceForm
  );

  // Load claim, evidence and assessment history
  const loadDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        claimResponse,
        evidenceResponse,
        historyResponse,
      ] = await Promise.all([
        getClaimById(id),
        getClinicalEvidence(id),
        getAssessmentHistory(id),
      ]);

      setClaim(claimResponse.data);

      setEvidence(
        Array.isArray(evidenceResponse.data)
          ? evidenceResponse.data
          : []
      );

      setAssessments(
        historyResponse.data.assessments ?? []
      );
    } catch (err) {
      console.error('Claim details error:', err);

      const message = err.response?.data?.message;

      setError(
        Array.isArray(message)
          ? message.join(', ')
          : message || 'Unable to load claim details.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  // Handle evidence form changes
  const handleEvidenceChange = (e) => {
    const { name, value, type, checked } = e.target;

    setEvidenceForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Submit clinical evidence
  const handleEvidenceSubmit = async (e) => {
    e.preventDefault();

    try {
      setSavingEvidence(true);
      setError('');
      setSuccess('');

      const sampleSize = Number(evidenceForm.sampleSize);
      const durationWeeks = Number(evidenceForm.durationWeeks);

      if (
        !Number.isInteger(sampleSize) ||
        sampleSize < 1 ||
        !Number.isInteger(durationWeeks) ||
        durationWeeks < 1
      ) {
        setError(
          'Sample size and duration must be positive whole numbers.'
        );
        return;
      }

      const numericFields = [
        'baselineMean',
        'followUpMean',
        'controlBaselineMean',
        'controlFollowUpMean',
        'pValue',
        'confidenceIntervalLower',
        'confidenceIntervalUpper',
      ];

      const payload = {
        studyTitle: evidenceForm.studyTitle.trim(),
        studyDesign: evidenceForm.studyDesign.trim(),
        population: evidenceForm.population.trim(),
        sampleSize,
        durationWeeks,
        methodology: evidenceForm.methodology.trim(),
        endpoint: evidenceForm.endpoint.trim(),
        limitations: evidenceForm.limitations
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
        isSynthetic: evidenceForm.isSynthetic,
      };

      // Convert optional numeric fields.
      for (const field of numericFields) {
        const value = evidenceForm[field];

        if (value !== '') {
          const numericValue = Number(value);

          if (!Number.isFinite(numericValue)) {
            setError(`Invalid numeric value for ${field}.`);
            return;
          }

          payload[field] = numericValue;
        }
      }

      // Validate p-value if supplied.
      if (
        payload.pValue !== undefined &&
        (payload.pValue < 0 || payload.pValue > 1)
      ) {
        setError('P-value must be between 0 and 1.');
        return;
      }

      await addClinicalEvidence(id, payload);

      setSuccess('Clinical evidence saved successfully.');

      setShowEvidenceForm(false);
      setEvidenceForm({ ...initialEvidenceForm });

      // Refresh claim details and evidence from backend.
      await loadDetails();
    } catch (err) {
      console.error('Evidence submission error:', err);

      const message = err.response?.data?.message;

      setError(
        Array.isArray(message)
          ? message.join(', ')
          : message || 'Unable to save clinical evidence.'
      );
    } finally {
      setSavingEvidence(false);
    }
  };

  // Run assessment
  const handleAssessment = async () => {
    try {
      setAssessing(true);
      setError('');
      setSuccess('');

      await runAssessment(id);

      setSuccess('Assessment completed and saved successfully.');

      await loadDetails();
    } catch (err) {
      console.error('Assessment error:', err);

      const message = err.response?.data?.message;

      setError(
        Array.isArray(message)
          ? message.join(', ')
          : message || 'Unable to run assessment.'
      );
    } finally {
      setAssessing(false);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="page-message">
        Loading claim details...
      </div>
    );
  }

  // Error screen
  if (error && !claim) {
    return (
      <div className="page-message error-message">
        {error}

        <button onClick={() => navigate('/')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!claim) return null;

  const latestAssessment = assessments[0];

  const canAssess = [
    'SUBMITTED',
    'UNDER_REVIEW',
  ].includes(claim.status);

  return (
    <div className="details-page">

      {/* Back navigation */}
      <button
        className="back-button"
        onClick={() => navigate('/')}
      >
        <ArrowLeft size={17} />
        Back to Dashboard
      </button>

      {/* Claim heading */}
      <div className="details-heading">
        <div>
          <p className="eyebrow">CLAIM DETAILS</p>

          <h1>{claim.productName}</h1>

          <p>{claim.claimText}</p>
        </div>

        <span className={`status ${claim.status.toLowerCase()}`}>
          {claim.status}
        </span>
      </div>

      {/* Notifications */}
      {error && (
        <div className="alert error-alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert success-alert">
          {success}
        </div>
      )}

      {/* Claim information */}
      <section className="details-card">
        <h2>
          <FileText size={20} />
          Claim Information
        </h2>

        <div className="detail-grid">

          <div>
            <label>Product name</label>
            <p>{claim.productName}</p>
          </div>

          <div>
            <label>Category</label>
            <p>{claim.claimCategory}</p>
          </div>

          <div>
            <label>Target metric</label>
            <p>{claim.targetMetric || 'Not specified'}</p>
          </div>

          <div>
            <label>Target value</label>
            <p>{claim.targetValue ?? 'Not specified'}</p>
          </div>

          <div>
            <label>Duration</label>
            <p>
              {claim.durationWeeks
                ? `${claim.durationWeeks} weeks`
                : 'Not specified'}
            </p>
          </div>

          <div>
            <label>Claim ID</label>
            <p className="small-id">{claim.id}</p>
          </div>

        </div>
      </section>

      {/* Clinical evidence */}
      <section className="details-card">

        <div className="section-heading">
          <h2>
            <Microscope size={20} />
            Clinical Evidence ({evidence.length})
          </h2>

          <button
            type="button"
            className="assessment-button"
            onClick={() =>
              setShowEvidenceForm((previous) => !previous)
            }
          >
            {showEvidenceForm ? 'Cancel' : '+ Add Evidence'}
          </button>
        </div>

        {/* Evidence submission form */}
        {showEvidenceForm && (
          <form
            className="evidence-form"
            onSubmit={handleEvidenceSubmit}
          >

            <h3>Submit Clinical Study</h3>

            <div className="form-field">
              <label>Study title *</label>

              <input
                name="studyTitle"
                value={evidenceForm.studyTitle}
                onChange={handleEvidenceChange}
                required
              />
            </div>

            <div className="form-field">
              <label>Study design *</label>

              <input
                name="studyDesign"
                value={evidenceForm.studyDesign}
                onChange={handleEvidenceChange}
                required
              />
            </div>

            <div className="form-field">
              <label>Study population *</label>

              <textarea
                name="population"
                value={evidenceForm.population}
                onChange={handleEvidenceChange}
                rows={2}
                required
              />
            </div>

            <div className="form-grid">

              <div className="form-field">
                <label>Sample size *</label>

                <input
                  type="number"
                  name="sampleSize"
                  min="1"
                  step="1"
                  value={evidenceForm.sampleSize}
                  onChange={handleEvidenceChange}
                  required
                />
              </div>

              <div className="form-field">
                <label>Duration (weeks) *</label>

                <input
                  type="number"
                  name="durationWeeks"
                  min="1"
                  step="1"
                  value={evidenceForm.durationWeeks}
                  onChange={handleEvidenceChange}
                  required
                />
              </div>

            </div>

            <div className="form-field">
              <label>Methodology *</label>

              <textarea
                name="methodology"
                value={evidenceForm.methodology}
                onChange={handleEvidenceChange}
                rows={3}
                required
              />
            </div>

            <div className="form-field">
              <label>Study endpoint *</label>

              <input
                name="endpoint"
                value={evidenceForm.endpoint}
                onChange={handleEvidenceChange}
                required
              />
            </div>

            <h3>Study Measurements</h3>

            <div className="form-grid">

              {[
                ['baselineMean', 'Treatment baseline mean'],
                ['followUpMean', 'Treatment follow-up mean'],
                ['controlBaselineMean', 'Control baseline mean'],
                ['controlFollowUpMean', 'Control follow-up mean'],
                ['pValue', 'P-value'],
                ['confidenceIntervalLower', 'Confidence interval lower'],
                ['confidenceIntervalUpper', 'Confidence interval upper'],
              ].map(([name, label]) => (
                <div className="form-field" key={name}>

                  <label>{label}</label>

                  <input
                    type="number"
                    step="any"
                    name={name}
                    value={evidenceForm[name]}
                    onChange={handleEvidenceChange}
                  />

                </div>
              ))}

            </div>

            <div className="form-field">
              <label>Limitations (one per line)</label>

              <textarea
                name="limitations"
                value={evidenceForm.limitations}
                onChange={handleEvidenceChange}
                rows={3}
              />
            </div>

            <label className="synthetic-checkbox">

              <input
                type="checkbox"
                name="isSynthetic"
                checked={evidenceForm.isSynthetic}
                onChange={handleEvidenceChange}
              />

              This is synthetic test evidence

            </label>

            <button
              type="submit"
              className="assessment-button"
              disabled={savingEvidence}
            >
              {savingEvidence
                ? 'Saving Evidence...'
                : 'Save Clinical Evidence'}
            </button>

          </form>
        )}

        {/* Saved evidence list */}
        {evidence.length === 0 ? (

          <p>No clinical evidence submitted yet.</p>

        ) : (

          evidence.map((study) => (

            <div className="study-card" key={study.id}>

              <h3>{study.studyTitle}</h3>

              <p className="study-design">
                {study.studyDesign}
              </p>

              <div className="detail-grid">

                <div>
                  <label>Sample size</label>
                  <p>{study.sampleSize} participants</p>
                </div>

                <div>
                  <label>Study duration</label>
                  <p>{study.durationWeeks} weeks</p>
                </div>

                <div>
                  <label>Endpoint</label>
                  <p>{study.endpoint}</p>
                </div>

                <div>
                  <label>P-value</label>
                  <p>{study.pValue ?? 'Not reported'}</p>
                </div>

                <div>
                  <label>Baseline mean</label>
                  <p>{study.baselineMean ?? 'N/A'}</p>
                </div>

                <div>
                  <label>Follow-up mean</label>
                  <p>{study.followUpMean ?? 'N/A'}</p>
                </div>

              </div>

              <p className="study-population">
                <strong>Population:</strong> {study.population}
              </p>

              {study.isSynthetic && (
                <div className="synthetic-notice">
                  <AlertCircle size={16} />
                  Synthetic test evidence — not real clinical data.
                </div>
              )}

            </div>

          ))
        )}

      </section>

      {/* AI assessment */}
      <section className="details-card">

        <h2>
          <ClipboardCheck size={20} />
          AI Assessment
        </h2>

        {latestAssessment ? (

          <div className="assessment-result">

            <div className="assessment-summary">

              <div>
                <label>Assessment status</label>

                <h3
                  className={`result-${latestAssessment.status.toLowerCase()}`}
                >
                  {latestAssessment.status.replaceAll('_', ' ')}
                </h3>
              </div>

              <div>
                <label>Confidence score</label>

                <h3>
                  {(latestAssessment.confidenceScore * 100).toFixed(0)}%
                </h3>
              </div>

              <div>
                <label>Evaluation model</label>

                <h3>{latestAssessment.modelName}</h3>
              </div>

            </div>

            <div className="assessment-text">
              <h3>Reasoning</h3>
              <p>{latestAssessment.reasoning}</p>
            </div>

            <div className="assessment-text">
              <h3>Limitations</h3>

              <ul>
                {(Array.isArray(latestAssessment.limitations)
                  ? latestAssessment.limitations
                  : []
                ).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="assessment-text">
              <h3>Recommendation</h3>
              <p>{latestAssessment.recommendation}</p>
            </div>

          </div>

        ) : (

          <p>No assessment has been generated yet.</p>

        )}

        <button
          className="assessment-button"
          onClick={handleAssessment}
          disabled={
            !canAssess ||
            assessing ||
            evidence.length === 0
          }
        >
          <RefreshCw size={17} />

          {assessing
            ? 'Running assessment...'
            : 'Run Assessment'}
        </button>

        {!canAssess && (
          <p className="helper-text">
            This claim must be submitted or under review before a new
            assessment can be generated.
          </p>
        )}

      </section>

      {/* Assessment history */}
      <section className="details-card">

        <h2>
          Assessment History ({assessments.length})
        </h2>

        {assessments.length === 0 ? (

          <p>No previous assessments found.</p>

        ) : (

          assessments.map((assessment) => (

            <div className="history-row" key={assessment.id}>

              <div>
                <strong>
                  {assessment.status.replaceAll('_', ' ')}
                </strong>

                <p>{assessment.modelName}</p>
              </div>

              <div>
                <strong>
                  {(assessment.confidenceScore * 100).toFixed(0)}%
                </strong>

                <p>
                  {new Date(
                    assessment.createdAt
                  ).toLocaleString()}
                </p>
              </div>

            </div>

          ))

        )}

      </section>

    </div>
  );
}

export default ClaimDetails;
