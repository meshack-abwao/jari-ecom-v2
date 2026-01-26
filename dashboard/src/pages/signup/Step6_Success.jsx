import { useState, useEffect } from 'react';

// ========================================
// STEP 6: SUCCESS - ACCOUNT CREATED
// Premium Apple-Inspired Celebration
// ========================================

export default function Step6_Success({ data, goToDashboard }) {
  const [copied, setCopied] = useState(false);
  const [confettiVisible, setConfettiVisible] = useState(true);

  useEffect(() => {
    // Hide confetti after animation
    const timer = setTimeout(() => setConfettiVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(data.storeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = data.storeUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `Check out my new online store! 🛍️\n\n${data.storeUrl}\n\nPowered by Jari.Ecom`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div style={styles.container}>
      {/* Confetti Animation */}
      {confettiVisible && <div style={styles.confetti} />}

      {/* Success Hero */}
      <div style={styles.heroSection}>
        <div style={styles.successBadge}>
          <svg style={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        
        <h1 style={styles.title}>Your store is live!</h1>
        <p style={styles.subtitle}>
          Congratulations, {data.ownerName?.split(' ')[0] || 'there'}! Your professional online store is ready to accept orders.
        </p>
      </div>

      {/* Store URL Card */}
      <div style={styles.urlCard}>
        <label style={styles.urlLabel}>Your store link</label>
        <div style={styles.urlRow}>
          <div style={styles.urlDisplay}>
            <svg style={styles.linkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            <span style={styles.urlText}>{data.storeUrl}</span>
          </div>
          <button onClick={handleCopyUrl} style={styles.copyButton}>
            {copied ? (
              <>
                <svg style={styles.buttonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg style={styles.buttonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
        
        <button onClick={handleShareWhatsApp} style={styles.whatsappButton}>
          <svg style={styles.whatsappIcon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Share on WhatsApp
        </button>
      </div>

      {/* Next Steps */}
      <div style={styles.nextStepsCard}>
        <h3 style={styles.nextStepsTitle}>What's next?</h3>
        
        <div style={styles.stepsList}>
          <div style={styles.stepItem}>
            <div style={styles.stepNumber}>1</div>
            <div style={styles.stepContent}>
              <h4 style={styles.stepTitle}>Add your products</h4>
              <p style={styles.stepDescription}>Upload photos, set prices, and write descriptions that sell.</p>
            </div>
          </div>

          <div style={styles.stepItem}>
            <div style={styles.stepNumber}>2</div>
            <div style={styles.stepContent}>
              <h4 style={styles.stepTitle}>Customize your store</h4>
              <p style={styles.stepDescription}>Add your logo, choose colors, and make it yours.</p>
            </div>
          </div>

          <div style={styles.stepItem}>
            <div style={styles.stepNumber}>3</div>
            <div style={styles.stepContent}>
              <h4 style={styles.stepTitle}>Share and start selling</h4>
              <p style={styles.stepDescription}>Post your link on Instagram, WhatsApp, and watch orders come in.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={styles.actions}>
        <button onClick={goToDashboard} style={styles.dashboardButton}>
          Go to your dashboard
          <svg style={styles.arrowIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
        
        <a href={data.storeUrl} target="_blank" rel="noopener noreferrer" style={styles.previewLink}>
          <svg style={styles.previewIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Preview your store
        </a>
      </div>

      {/* Help Section */}
      <div style={styles.helpSection}>
        <p style={styles.helpText}>
          Need help getting started?{' '}
          <a href="https://wa.me/254751433625?text=Hi!%20I%20just%20created%20my%20store%20and%20need%20help" style={styles.helpLink} target="_blank" rel="noopener noreferrer">
            Chat with us on WhatsApp
          </a>
        </p>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes confettiFall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '48px 24px 64px',
    position: 'relative',
    animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
  },

  confetti: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 1000,
    background: `
      radial-gradient(circle at 20% 50%, #667eea 2px, transparent 2px),
      radial-gradient(circle at 80% 30%, #764ba2 2px, transparent 2px),
      radial-gradient(circle at 40% 70%, #34c759 2px, transparent 2px),
      radial-gradient(circle at 60% 20%, #f59e0b 2px, transparent 2px),
      radial-gradient(circle at 10% 80%, #ec4899 2px, transparent 2px),
      radial-gradient(circle at 90% 60%, #667eea 2px, transparent 2px)
    `,
    backgroundSize: '100% 100%',
    animation: 'confettiFall 3s ease-out forwards',
    opacity: 0.6,
  },

  // Hero Section
  heroSection: {
    textAlign: 'center',
    marginBottom: '40px',
  },

  successBadge: {
    width: '80px',
    height: '80px',
    background: 'linear-gradient(135deg, #34c759 0%, #30d158 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
    boxShadow: '0 8px 32px rgba(52, 199, 89, 0.35)',
    animation: 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  checkIcon: {
    width: '40px',
    height: '40px',
    color: '#fff',
  },

  title: {
    fontSize: 'clamp(32px, 6vw, 48px)',
    fontWeight: 700,
    color: '#1d1d1f',
    marginBottom: '12px',
    letterSpacing: '-0.03em',
    lineHeight: 1.1,
  },

  subtitle: {
    fontSize: 'clamp(16px, 2.5vw, 19px)',
    color: '#86868b',
    lineHeight: 1.5,
    maxWidth: '440px',
    margin: '0 auto',
  },

  // URL Card
  urlCard: {
    background: '#fff',
    borderRadius: '20px',
    padding: '28px',
    marginBottom: '24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
  },

  urlLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#86868b',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },

  urlRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
  },

  urlDisplay: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    background: '#f5f5f7',
    borderRadius: '12px',
    overflow: 'hidden',
  },

  linkIcon: {
    width: '18px',
    height: '18px',
    color: '#667eea',
    flexShrink: 0,
  },

  urlText: {
    fontSize: '14px',
    color: '#1d1d1f',
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  copyButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '14px 20px',
    fontSize: '14px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    whiteSpace: 'nowrap',
  },

  buttonIcon: {
    width: '16px',
    height: '16px',
  },

  whatsappButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '14px 24px',
    fontSize: '15px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '12px',
    background: '#25d366',
    color: '#fff',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },

  whatsappIcon: {
    width: '20px',
    height: '20px',
  },

  // Next Steps Card
  nextStepsCard: {
    background: '#fff',
    borderRadius: '20px',
    padding: '28px',
    marginBottom: '32px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
  },

  nextStepsTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '24px',
    letterSpacing: '-0.01em',
  },

  stepsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  stepItem: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
  },

  stepNumber: {
    width: '32px',
    height: '32px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 700,
    flexShrink: 0,
  },

  stepContent: {
    flex: 1,
  },

  stepTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '4px',
  },

  stepDescription: {
    fontSize: '14px',
    color: '#86868b',
    lineHeight: 1.5,
    margin: 0,
  },

  // Actions
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '32px',
  },

  dashboardButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '18px 32px',
    fontSize: '17px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '980px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 4px 14px rgba(102, 126, 234, 0.35)',
  },

  arrowIcon: {
    width: '20px',
    height: '20px',
  },

  previewLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '16px 24px',
    fontSize: '16px',
    fontWeight: 500,
    color: '#667eea',
    textDecoration: 'none',
    borderRadius: '12px',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    background: 'rgba(102, 126, 234, 0.04)',
    transition: 'all 0.2s ease',
  },

  previewIcon: {
    width: '18px',
    height: '18px',
  },

  // Help Section
  helpSection: {
    textAlign: 'center',
    padding: '20px',
    background: 'rgba(102, 126, 234, 0.06)',
    borderRadius: '16px',
  },

  helpText: {
    fontSize: '14px',
    color: '#424245',
    margin: 0,
  },

  helpLink: {
    color: '#667eea',
    fontWeight: 600,
    textDecoration: 'none',
  },
};
