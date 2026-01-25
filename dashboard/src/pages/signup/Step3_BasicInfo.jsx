import { useState } from 'react';

export default function Step3_BasicInfo({ data, updateData, nextStep, prevStep }) {
  const [formData, setFormData] = useState({
    storeName: data.storeName || '',
    ownerName: data.ownerName || '',
    email: data.email || '',
    phone: data.phone || '',
    password: data.password || '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.storeName || formData.storeName.length < 3) {
      newErrors.storeName = 'Store name must be at least 3 characters';
    }

    if (!formData.ownerName || formData.ownerName.length < 2) {
      newErrors.ownerName = 'Your name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    const phoneRegex = /^\+254[17]\d{8}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Format: +254712345678 or +254112345678';
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Update signup data (remove confirmPassword)
      const { confirmPassword, ...dataToSave } = formData;
      updateData(dataToSave);
      nextStep();
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Generate slug preview
  const slugPreview = formData.storeName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 30);

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <button onClick={prevStep} style={styles.backButton}>
          ← Back
        </button>

        <h2 style={styles.heading}>Let's set up your store</h2>
        <p style={styles.subheading}>Quick details - takes less than a minute</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Store Name */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Store Name *</label>
            <input
              type="text"
              value={formData.storeName}
              onChange={(e) => handleChange('storeName', e.target.value)}
              placeholder="Jari Solutions"
              style={{
                ...styles.input,
                borderColor: errors.storeName ? '#ef4444' : '#d1d5db',
              }}
            />
            {errors.storeName && <span style={styles.error}>{errors.storeName}</span>}
            {slugPreview && !errors.storeName && (
              <span style={styles.hint}>
                Your store URL: jarisolutionsecom.store/?store={slugPreview}
              </span>
            )}
          </div>

          {/* Owner Name */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Your Name *</label>
            <input
              type="text"
              value={formData.ownerName}
              onChange={(e) => handleChange('ownerName', e.target.value)}
              placeholder="John Doe"
              style={{
                ...styles.input,
                borderColor: errors.ownerName ? '#ef4444' : '#d1d5db',
              }}
            />
            {errors.ownerName && <span style={styles.error}>{errors.ownerName}</span>}
          </div>

          {/* Email */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="you@example.com"
              style={{
                ...styles.input,
                borderColor: errors.email ? '#ef4444' : '#d1d5db',
              }}
            />
            {errors.email && <span style={styles.error}>{errors.email}</span>}
          </div>

          {/* Phone */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Phone Number (M-Pesa) *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+254712345678"
              style={{
                ...styles.input,
                borderColor: errors.phone ? '#ef4444' : '#d1d5db',
              }}
            />
            {errors.phone && <span style={styles.error}>{errors.phone}</span>}
            {!errors.phone && (
              <span style={styles.hint}>We'll send an OTP to verify this number</span>
            )}
          </div>

          {/* Password */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Password *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="••••••••"
              style={{
                ...styles.input,
                borderColor: errors.password ? '#ef4444' : '#d1d5db',
              }}
            />
            {errors.password && <span style={styles.error}>{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password *</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              placeholder="••••••••"
              style={{
                ...styles.input,
                borderColor: errors.confirmPassword ? '#ef4444' : '#d1d5db',
              }}
            />
            {errors.confirmPassword && <span style={styles.error}>{errors.confirmPassword}</span>}
          </div>

          <button type="submit" style={styles.submitButton} disabled={loading}>
            {loading ? 'Saving...' : 'Continue →'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
  },
  
  content: {
    width: '100%',
    maxWidth: '500px',
  },
  
  backButton: {
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  
  heading: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: '0.5rem',
  },
  
  subheading: {
    fontSize: '1.125rem',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  
  form: {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    padding: '2rem',
  },
  
  formGroup: {
    marginBottom: '1.5rem',
  },
  
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem',
  },
  
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'border-color 0.3s ease',
    boxSizing: 'border-box',
  },
  
  error: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#ef4444',
    marginTop: '0.25rem',
  },
  
  hint: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#6b7280',
    marginTop: '0.25rem',
  },
  
  submitButton: {
    width: '100%',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '1rem',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '1rem',
  },
};
