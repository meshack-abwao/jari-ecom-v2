import { useState } from 'react';

export default function Step3_BasicInfo({ data, updateData, nextStep, prevStep }) {
  const [formData, setFormData] = useState({
    storeName: data.storeName || '',
    ownerName: data.ownerName || '',
    email: data.email || '',
    phone: data.phone || '',
    password: data.password || '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.storeName.trim()) {
      newErrors.storeName = 'Store name is required';
    }

    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'Your name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+254|0)[17]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Kenyan phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Normalize phone number
    let normalizedPhone = formData.phone.replace(/\s/g, '');
    if (normalizedPhone.startsWith('0')) {
      normalizedPhone = '+254' + normalizedPhone.slice(1);
    }

    updateData({
      ...formData,
      phone: normalizedPhone,
    });

    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {/* Store Name */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Store Name</label>
        <input
          type="text"
          value={formData.storeName}
          onChange={(e) => handleChange('storeName', e.target.value)}
          placeholder="e.g., Nairobi Cafe"
          style={{
            ...styles.input,
            borderColor: errors.storeName ? '#ef4444' : '#d2d2d7',
          }}
        />
        {errors.storeName && <span style={styles.error}>{errors.storeName}</span>}
      </div>

      {/* Owner Name */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Your Name</label>
        <input
          type="text"
          value={formData.ownerName}
          onChange={(e) => handleChange('ownerName', e.target.value)}
          placeholder="e.g., John Kamau"
          style={{
            ...styles.input,
            borderColor: errors.ownerName ? '#ef4444' : '#d2d2d7',
          }}
        />
        {errors.ownerName && <span style={styles.error}>{errors.ownerName}</span>}
      </div>

      {/* Email */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Email Address</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="your@email.com"
          style={{
            ...styles.input,
            borderColor: errors.email ? '#ef4444' : '#d2d2d7',
          }}
        />
        {errors.email && <span style={styles.error}>{errors.email}</span>}
      </div>

      {/* Phone */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Phone Number (M-Pesa)</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="+254712345678 or 0712345678"
          style={{
            ...styles.input,
            borderColor: errors.phone ? '#ef4444' : '#d2d2d7',
          }}
        />
        {errors.phone && <span style={styles.error}>{errors.phone}</span>}
        <span style={styles.hint}>This will be your M-Pesa payment number</span>
      </div>

      {/* Password */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Password</label>
        <div style={styles.passwordContainer}>
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="At least 6 characters"
            style={{
              ...styles.input,
              borderColor: errors.password ? '#ef4444' : '#d2d2d7',
              marginBottom: 0,
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {errors.password && <span style={styles.error}>{errors.password}</span>}
      </div>

      {/* Buttons */}
      <div style={styles.buttonGroup}>
        <button
          type="button"
          onClick={prevStep}
          style={styles.backButton}
        >
          ← Back
        </button>
        <button type="submit" style={styles.nextButton}>
          Continue →
        </button>
      </div>
    </form>
  );
}

const styles = {
  form: {
    width: '100%',
    maxWidth: '480px',
    margin: '0 auto',
  },

  fieldGroup: {
    marginBottom: '24px',
  },

  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '8px',
    letterSpacing: '-0.01em',
  },

  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '16px',
    border: '2px solid #d2d2d7',
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
    backgroundColor: 'white',
  },

  passwordContainer: {
    position: 'relative',
  },

  eyeButton: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '20px',
    padding: '4px',
  },

  error: {
    display: 'block',
    fontSize: '12px',
    color: '#ef4444',
    marginTop: '6px',
  },

  hint: {
    display: 'block',
    fontSize: '12px',
    color: '#86868b',
    marginTop: '6px',
  },

  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '32px',
  },

  backButton: {
    flex: 1,
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: 500,
    border: '2px solid #d2d2d7',
    borderRadius: '12px',
    background: 'white',
    color: '#1d1d1f',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
  },

  nextButton: {
    flex: 2,
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: 500,
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
    boxShadow: '0 4px 12px rgba(249, 115, 22, 0.25)',
  },
};
