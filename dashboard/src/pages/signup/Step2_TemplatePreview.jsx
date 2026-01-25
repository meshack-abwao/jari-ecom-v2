import { useEffect } from 'react';

export default function Step2_TemplatePreview({ data, nextStep }) {
  // Auto-skip this step for now - we'll configure templates later
  useEffect(() => {
    // Immediately advance to next step
    nextStep();
  }, [nextStep]);

  // Show brief loading state
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.spinner}></div>
        <p style={styles.text}>Preparing your store...</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
  },

  content: {
    textAlign: 'center',
  },

  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #f5f5f7',
    borderTop: '3px solid #667eea',
    borderRadius: '50%',
    margin: '0 auto 16px',
    animation: 'spin 0.8s linear infinite',
  },

  text: {
    fontSize: '14px',
    color: '#86868b',
  },
};

// Add keyframe animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
