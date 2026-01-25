export default function Step7_Success({ data, goToDashboard }) {
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(data.storeUrl);
    alert('Store URL copied to clipboard!');
  };

  const handleShareWhatsApp = () => {
    const text = `Check out my new online store: ${data.storeUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Success animation */}
        <div style={styles.successIcon}>
          <span style={styles.checkmark}>✓</span>
        </div>

        <h1 style={styles.heading}>Your Store is Live! 🎉</h1>
        <p style={styles.subheading}>
          Welcome to Jari! Your store is ready to accept orders.
        </p>

        {/* Store URL Card */}
        <div style={styles.urlCard}>
          <label style={styles.urlLabel}>Your Store URL:</label>
          <div style={styles.urlBox}>
            <input
              type="text"
              value={data.storeUrl}
              readOnly
              style={styles.urlInput}
            />
            <button onClick={handleCopyUrl} style={styles.copyButton}>
              📋 Copy
            </button>
          </div>
          <button onClick={handleShareWhatsApp} style={styles.shareButton}>
            <span style={styles.whatsappIcon}>💬</span> Share on WhatsApp
          </button>
        </div>

        {/* Next Steps */}
        <div style={styles.nextSteps}>
          <h3 style={styles.nextStepsTitle}>What's Next?</h3>
          
          <div style={styles.stepCard}>
            <span style={styles.stepNumber}>1</span>
            <div>
              <h4 style={styles.stepTitle}>Add Your Products</h4>
              <p style={styles.stepDescription}>
                Upload photos, set prices, and write descriptions
              </p>
            </div>
          </div>

          <div style={styles.stepCard}>
            <span style={styles.stepNumber}>2</span>
            <div>
              <h4 style={styles.stepTitle}>Customize Your Store</h4>
              <p style={styles.stepDescription}>
                Change colors, fonts, and add your branding
              </p>
            </div>
          </div>

          <div style={styles.stepCard}>
            <span style={styles.stepNumber}>3</span>
            <div>
              <h4 style={styles.stepTitle}>Start Selling!</h4>
              <p style={styles.stepDescription}>
                Share your store link and start receiving orders
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.actions}>
          <button onClick={goToDashboard} style={styles.dashboardButton}>
            Go to Dashboard →
          </button>
          
          <a href={data.storeUrl} target="_blank" rel="noopener noreferrer" style={styles.previewLink}>
            Preview My Store
          </a>
        </div>

        {/* Help */}
        <div style={styles.helpSection}>
          <p style={styles.helpText}>
            Need help getting started? Check out our{' '}
            <a href="/guides" style={styles.helpLink}>Quick Start Guide</a>
          </p>
        </div>
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
    maxWidth: '600px',
    textAlign: 'center',
  },
  
  successIcon: {
    width: '80px',
    height: '80px',
    backgroundColor: '#10b981',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 2rem',
    animation: 'scale-in 0.5s ease',
  },
  
  checkmark: {
    fontSize: '3rem',
    color: 'white',
    fontWeight: 'bold',
  },
  
  heading: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '0.5rem',
  },
  
  subheading: {
    fontSize: '1.25rem',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: '2rem',
  },
  
  urlCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    padding: '2rem',
    marginBottom: '2rem',
  },
  
  urlLabel: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: '0.5rem',
    textAlign: 'left',
  },
  
  urlBox: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  
  urlInput: {
    flex: 1,
    padding: '0.75rem',
    border: '2px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.875rem',
    backgroundColor: '#f9fafb',
  },
  
  copyButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  
  shareButton: {
    width: '100%',
    backgroundColor: '#25d366',
    color: 'white',
    border: 'none',
    padding: '0.75rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  
  whatsappIcon: {
    fontSize: '1.25rem',
  },
  
  nextSteps: {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    padding: '2rem',
    marginBottom: '2rem',
    textAlign: 'left',
  },
  
  nextStepsTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '1.5rem',
  },
  
  stepCard: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'start',
    marginBottom: '1.5rem',
  },
  
  stepNumber: {
    width: '32px',
    height: '32px',
    backgroundColor: '#10b981',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '0.875rem',
    flexShrink: 0,
  },
  
  stepTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.25rem',
  },
  
  stepDescription: {
    fontSize: '0.875rem',
    color: '#6b7280',
    lineHeight: '1.4',
  },
  
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '2rem',
  },
  
  dashboardButton: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '1rem',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  
  previewLink: {
    color: 'white',
    fontSize: '0.875rem',
    textDecoration: 'underline',
  },
  
  helpSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '1rem',
  },
  
  helpText: {
    color: 'white',
    fontSize: '0.875rem',
  },
  
  helpLink: {
    color: 'white',
    fontWeight: '600',
    textDecoration: 'underline',
  },
};
