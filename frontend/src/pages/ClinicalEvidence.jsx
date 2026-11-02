
import { useEffect, useState } from 'react';
import {
  Microscope,
  Plus,
  X,
  RefreshCw,
} from 'lucide-react';

import Sidebar from '../components/Sidebar.jsx';
import Header from '../components/Header.jsx';

import {
  getClaims,
  getClinicalEvidence,
  addClinicalEvidence,
} from '../services/api.js';

const initialForm = {
  claimId: '',
  studyTitle: '',
  studyDesign: 'Randomized Controlled Trial',
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
  limitations: '',
  isSynthetic: true,
};

function ClinicalEvidence() {
  const [evidence, setEvidence] = useState([]);
  const [claims, setClaims] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);

  async function loadEvidence() {
    setLoading(true);
    setError('');

    try {
      const claimsResponse = await getClaims();
      const claimsData = claimsResponse.data;

      if (!Array.isArray(claimsData)) {
        throw new Error('Unexpected claims API response.');
      }

      setClaims(claimsData);

      const evidenceResponses = await Promise.all(
        claimsData.map(async (claim) => {
          const response = await getClinicalEvidence(claim.id);

          if (!Array.isArray(response.data)) {
            throw new Error(
              `Unexpected evidence response for ${claim.productName}.`
            );
          }

          return response.data.map((item) => ({
            ...item,
            claimId: claim.id,
            productName: claim.productName,
            claimText: claim.claimText,
          }));
        })
      );

      setEvidence(evidenceResponses.flat());
    } catch (err) {
      console.error('Clinical Evidence API Error:', err);

      setError(
        err.response?.data?.message ||
        err.message ||
        'Unable to load clinical evidence.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvidence();
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }));

    setError('');
    setSuccess('');
  }

  function optionalNumber(value) {
    if (value === '') return undefined;
    return Number(value);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!form.claimId) {
      setError('Please select a product claim.');
      return;
    }

    const payload = {
      studyTitle: form.studyTitle.trim(),
      studyDesign: form.studyDesign,
      population: form.population.trim(),
      sampleSize: Number(form.sampleSize),
      durationWeeks: Number(form.durationWeeks),
      methodology: form.methodology.trim(),
      endpoint: form.endpoint.trim(),

      isSynthetic: form.isSynthetic,

      limitations: form.limitations
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    };

    const optionalFields = [
      'baselineMean',
      'followUpMean',
      'controlBaselineMean',
      'controlFollowUpMean',
      'pValue',
      'confidenceIntervalLower',
      'confidenceIntervalUpper',
    ];

    optionalFields.forEach((field) => {
      const value = optionalNumber(form[field]);

      if (value !== undefined) {
        payload[field] = value;
      }
    });

    if (
      !Number.isInteger(payload.sampleSize) ||
      payload.sampleSize < 1 ||
      !Number.isInteger(payload.durationWeeks) ||
      payload.durationWeeks < 1
    ) {
      setError('Sample size and duration must be positive whole numbers.');
      return;
    }

    if (
      payload.pValue !== undefined &&
      (payload.pValue < 0 || payload.pValue > 1)
    ) {
      setError('p-value must be between 0 and 1.');
      return;
    }

    if (
      payload.confidenceIntervalLower !== undefined &&
      payload.confidenceIntervalUpper !== undefined &&
      payload.confidenceIntervalLower > payload.confidenceIntervalUpper
    ) {
      setError('Confidence interval lower bound cannot exceed upper bound.');
      return;
    }

    try {
      setSubmitting(true);

      await addClinicalEvidence(form.claimId, payload);

      setSuccess('Clinical evidence added successfully.');

      setForm(initialForm);
      setShowForm(false);

      await loadEvidence();
    } catch (err) {
      console.error('Add Evidence Error:', err);

      const message = err.response?.data?.message;

      setError(
        Array.isArray(message)
          ? message.join(', ')
          : message || 'Unable to add clinical evidence.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="dashboard-content">

          {/* Page heading */}
          <div className="page-heading">
            <div>
              <h1>Clinical Evidence</h1>
              <p>
                Review clinical studies linked to product claims.
              </p>
            </div>

            <div className="evidence-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={loadEvidence}
                disabled={loading}
              >
                <RefreshCw size={17} />
                Refresh
              </button>

              <button
                type="button"
                className="create-claim-button"
                onClick={() => {
                  setError('');
                  setSuccess('');
                  setShowForm(true);
                }}
              >
                <Plus size={19} />
                Add Clinical Evidence
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="page-summary-card">
            <Microscope size={25} />

            <div>
              <h2>{evidence.length}</h2>
              <p>Total clinical studies</p>
            </div>
          </div>

          {success && (
            <p className="success-message">{success}</p>
          )}

          {error && (
            <p className="error-message">{error}</p>
          )}

          {/* Evidence table */}
          {loading ? (
            <p>Loading clinical evidence...</p>
          ) : evidence.length === 0 ? (
            <p>No clinical evidence has been added yet.</p>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Study Title</th>
                    <th>Product</th>
                    <th>Study Design</th>
                    <th>Sample Size</th>
                    <th>Duration</th>
                    <th>p-value</th>
                    <th>Data Type</th>
                  </tr>
                </thead>

                <tbody>
                  {evidence.map((item) => (
                    <tr key={item.id}>
                      <td>{item.studyTitle || '-'}</td>
                      <td>{item.productName || '-'}</td>
                      <td>{item.studyDesign || '-'}</td>
                      <td>{item.sampleSize ?? '-'}</td>

                      <td>
                        {item.durationWeeks != null
                          ? `${item.durationWeeks} weeks`
                          : '-'}
                      </td>

                      <td>{item.pValue ?? '-'}</td>

                      <td>
                        <span
                          className={`status-badge ${
                            item.isSynthetic
                              ? 'inconclusive'
                              : 'justified'
                          }`}
                        >
                          {item.isSynthetic
                            ? 'Synthetic'
                            : 'Non-synthetic'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add Evidence Form */}
          {showForm && (
            <div className="modal-overlay">
              <div className="evidence-modal">

                <div className="modal-heading">
                  <div>
                    <h2>Add Clinical Evidence</h2>
                    <p>
                      Register a clinical study against a product claim.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="close-modal-button"
                    onClick={() => setShowForm(false)}
                  >
                    <X size={22} />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>

                  {/* Claim selection */}
                  <div className="settings-field">
                    <label>Product Claim *</label>

                    <select
                      name="claimId"
                      value={form.claimId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a claim</option>

                      {claims.map((claim) => (
                        <option key={claim.id} value={claim.id}>
                          {claim.productName} - {claim.claimText}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Study information */}
                  <h3 className="form-section-title">
                    Study Information
                  </h3>

                  <div className="settings-field">
                    <label>Study Title *</label>

                    <input
                      name="studyTitle"
                      value={form.studyTitle}
                      onChange={handleChange}
                      maxLength={255}
                      required
                      placeholder="Enter study title"
                    />
                  </div>

                  <div className="evidence-form-grid">

                    <div className="settings-field">
                      <label>Study Design *</label>

                      <select
                        name="studyDesign"
                        value={form.studyDesign}
                        onChange={handleChange}
                        required
                      >
                        <option value="Randomized Controlled Trial">
                          Randomized Controlled Trial
                        </option>
                        <option value="Observational Study">
                          Observational Study
                        </option>
                        <option value="Clinical Instrumental Study">
                          Clinical Instrumental Study
                        </option>
                        <option value="Open Label Study">
                          Open Label Study
                        </option>
                        <option value="Split Face Study">
                          Split Face Study
                        </option>
                      </select>
                    </div>

                    <div className="settings-field">
                      <label>Population *</label>

                      <input
                        name="population"
                        value={form.population}
                        onChange={handleChange}
                        required
                        placeholder="e.g. 80 adults aged 25-55"
                      />
                    </div>

                    <div className="settings-field">
                      <label>Sample Size *</label>

                      <input
                        type="number"
                        name="sampleSize"
                        value={form.sampleSize}
                        onChange={handleChange}
                        min="1"
                        step="1"
                        required
                        placeholder="80"
                      />
                    </div>

                    <div className="settings-field">
                      <label>Duration (weeks) *</label>

                      <input
                        type="number"
                        name="durationWeeks"
                        value={form.durationWeeks}
                        onChange={handleChange}
                        min="1"
                        step="1"
                        required
                        placeholder="4"
                      />
                    </div>
                  </div>

                  <div className="settings-field">
                    <label>Methodology *</label>

                    <textarea
                      name="methodology"
                      value={form.methodology}
                      onChange={handleChange}
                      required
                      rows="3"
                      placeholder="Describe how the clinical study was conducted..."
                    />
                  </div>

                  <div className="settings-field">
                    <label>Primary Endpoint *</label>

                    <input
                      name="endpoint"
                      value={form.endpoint}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Skin hydration improvement"
                    />
                  </div>

                  {/* Clinical measurements */}
                  <h3 className="form-section-title">
                    Clinical Measurements
                  </h3>

                  <div className="evidence-form-grid">
                    <div className="settings-field">
                      <label>Baseline Mean</label>

                      <input
                        type="number"
                        step="any"
                        name="baselineMean"
                        value={form.baselineMean}
                        onChange={handleChange}
                        placeholder="40"
                      />
                    </div>

                    <div className="settings-field">
                      <label>Follow-up Mean</label>

                      <input
                        type="number"
                        step="any"
                        name="followUpMean"
                        value={form.followUpMean}
                        onChange={handleChange}
                        placeholder="50"
                      />
                    </div>

                    <div className="settings-field">
                      <label>Control Baseline Mean</label>

                      <input
                        type="number"
                        step="any"
                        name="controlBaselineMean"
                        value={form.controlBaselineMean}
                        onChange={handleChange}
                        placeholder="40"
                      />
                    </div>

                    <div className="settings-field">
                      <label>Control Follow-up Mean</label>

                      <input
                        type="number"
                        step="any"
                        name="controlFollowUpMean"
                        value={form.controlFollowUpMean}
                        onChange={handleChange}
                        placeholder="42"
                      />
                    </div>

                    <div className="settings-field">
                      <label>p-value</label>

                      <input
                        type="number"
                        step="any"
                        min="0"
                        max="1"
                        name="pValue"
                        value={form.pValue}
                        onChange={handleChange}
                        placeholder="0.03"
                      />
                    </div>

                    <div className="settings-field">
                      <label>Confidence Interval Lower</label>

                      <input
                        type="number"
                        step="any"
                        name="confidenceIntervalLower"
                        value={form.confidenceIntervalLower}
                        onChange={handleChange}
                        placeholder="1.2"
                      />
                    </div>

                    <div className="settings-field">
                      <label>Confidence Interval Upper</label>

                      <input
                        type="number"
                        step="any"
                        name="confidenceIntervalUpper"
                        value={form.confidenceIntervalUpper}
                        onChange={handleChange}
                        placeholder="2.8"
                      />
                    </div>
                  </div>

                  {/* Limitations */}
                  <div className="settings-field">
                    <label>Study Limitations</label>

                    <textarea
                      name="limitations"
                      value={form.limitations}
                      onChange={handleChange}
                      rows="2"
                      placeholder="Small sample size, short duration, limited population..."
                    />

                    <small>
                      Separate multiple limitations using commas.
                    </small>
                  </div>

                  {/* Synthetic data */}
                  <div className="settings-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        name="isSynthetic"
                        checked={form.isSynthetic}
                        onChange={handleChange}
                      />

                      This is synthetic / simulated study data
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="modal-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setShowForm(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="create-claim-button"
                      disabled={submitting}
                    >
                      <Plus size={18} />
                      {submitting
                        ? 'Saving...'
                        : 'Save Clinical Evidence'}
                    </button>
                  </div>

                </form>
              </div>
            </div>
          )}

        </section>
      </main>
    </div>
  );
}

export default ClinicalEvidence;
