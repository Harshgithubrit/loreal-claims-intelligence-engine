
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { createClaim } from '../services/api.js';

function CreateClaim() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    productName: '',
    claimText: '',
    claimCategory: '',
    targetMetric: '',
    targetValue: '',
    durationWeeks: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (
      !form.productName.trim() ||
      !form.claimText.trim() ||
      !form.claimCategory.trim() ||
      !form.targetMetric.trim() ||
      form.targetValue === '' ||
      form.durationWeeks === ''
    ) {
      setError('Please complete all fields.');
      return;
    }

    const targetValue = Number(form.targetValue);
    const durationWeeks = Number(form.durationWeeks);

    if (
      !Number.isFinite(targetValue) ||
      targetValue <= 0 ||
      !Number.isInteger(durationWeeks) ||
      durationWeeks < 1
    ) {
      setError('Enter a positive target value and a valid duration.');
      return;
    }

    try {
      setLoading(true);

      const response = await createClaim({
        productName: form.productName.trim(),
        claimText: form.claimText.trim(),
        claimCategory: form.claimCategory.trim(),
        targetMetric: form.targetMetric.trim(),
        targetValue,
        durationWeeks,
      });

      const newClaim = response.data;

      // Redirect to the newly created claim
      navigate(`/claims/${newClaim.id}`);
    } catch (err) {
      console.error('Create claim error:', err);

      setError(
        err.response?.data?.message ||
        'Unable to create claim. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-content">
      <button
        className="back-button"
        onClick={() => navigate('/')}
      >
        <ArrowLeft size={17} />
        Back to Dashboard
      </button>

      <div className="welcome">
        <h1>Create Product Claim</h1>
        <p>Register a new cosmetic product claim for review.</p>
      </div>

      <form className="details-card create-claim-form" onSubmit={handleSubmit}>
        {error && (
          <div className="alert error-alert">
            {Array.isArray(error) ? error.join(', ') : error}
          </div>
        )}

        <div className="form-field">
          <label>Product Name *</label>
          <input
            name="productName"
            value={form.productName}
            onChange={handleChange}
            maxLength={150}
            placeholder="e.g. Hydra Fresh Moisturizer"
            required
          />
        </div>

        <div className="form-field">
          <label>Claim Statement *</label>
          <textarea
            name="claimText"
            value={form.claimText}
            onChange={handleChange}
            placeholder="e.g. Improves skin hydration by 25% in 4 weeks"
            rows={3}
            required
          />
        </div>

        <div className="form-field">
          <label>Claim Category *</label>
          <input
            name="claimCategory"
            value={form.claimCategory}
            onChange={handleChange}
            placeholder="e.g. Hydration"
            required
          />
        </div>

        <div className="form-field">
          <label>Target Metric *</label>
          <input
            name="targetMetric"
            value={form.targetMetric}
            onChange={handleChange}
            placeholder="e.g. Skin hydration improvement"
            required
          />
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>Target Value (%) *</label>
            <input
              type="number"
              name="targetValue"
              value={form.targetValue}
              onChange={handleChange}
              min="0.01"
              step="any"
              placeholder="25"
              required
            />
          </div>

          <div className="form-field">
            <label>Duration (weeks) *</label>
            <input
              type="number"
              name="durationWeeks"
              value={form.durationWeeks}
              onChange={handleChange}
              min="1"
              step="1"
              placeholder="4"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="assessment-button"
          disabled={loading}
        >
          <Save size={17} />
          {loading ? 'Creating Claim...' : 'Create Claim'}
        </button>
      </form>
    </div>
  );
}

export default CreateClaim;
