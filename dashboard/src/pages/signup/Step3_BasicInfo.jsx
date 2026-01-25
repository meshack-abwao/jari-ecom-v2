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
    <div style={styles.container}>
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
              borderColor: errors.storeName ? '#ef4444' : 'rgba(0, 0, 0, 0.08)',
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
              borderColor: errors.ownerName ? '#ef4444' : 'rgba(0, 0, 0, 0.08)',
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
              borderColor: errors.email ? '#ef4444' : 'rgba(0, 0, 0, 0.08)',
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
              borderColor: errors.phone ? '#ef4444' : 'rgba(0, 0, 0, 0.08)',
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
                borderColor: errors.password ? '#ef4444' : 'rgba(0, 0, 0, 0.08)',
                paddingRight: '48px',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                style={{ width: '20px', height: '20px' }}
              >
                {showPassword ? (
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
                ) : (
                  <>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </>
                )}
              </svg>
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
    </div>
  );
}

const PHI = 1.618; // Golden ratio

const styles = {
  container: {
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '0 clamp(20px, 5vw, 32px) clamp(40px, 8vh, 64px)', // Golden ratio padding
  },

  form: {
    width: '100%',
  },

  fieldGroup: {
    marginBottom: `${Math.round(24 * PHI)}px`, // ~39px
  },

  label: {
    display: 'block',
    fontSize: '15px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '10px',
    letterSpacing: '-0.01em',
  },

  input: {
    width: '100%',
    padding: `${Math.round(16 * PHI)}px 20px`, // ~26px vertical
    fontSize: '16px',
    border: '1px solid',
    borderRadius: '16px', // Rounded (Why Fonts Matter - friendly)
    outline: 'none',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
    backgroundColor: 'white',
    boxSizing: 'border-box',
  },

  passwordContainer: {
    position: 'relative',
  },

  eyeButton: {
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    color: '#86868b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s ease',
  },

  error: {
    display: 'block',
    fontSize: '13px',
    color: '#ef4444',
    marginTop: '8px',
    fontWeight: 500,
  },

  hint: {
    display: 'block',
    fontSize: '13px',
    color: '#86868b',
    marginTop: '8px',
  },

  buttonGroup: {
    display: 'flex',
    gap: '16px',
    marginTop: `${Math.round(40 * PHI)}px`, // ~65px
  },

  backButton: {
    flex: 1,
    padding: '16px 28px',
    fontSize: '16px',
    fontWeight: 500,
    border: 'none',
    borderRadius: '980px', // Pill (Why Fonts Matter)
    background: '#f5f5f7',
    color: '#1d1d1f',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
  },

  nextButton: {
    flex: 2,
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '980px', // Pill
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
  },
};
