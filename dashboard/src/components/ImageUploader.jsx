import { useState, useRef } from 'react';
import { Upload, X, Loader, Image as ImageIcon } from 'lucide-react';
import { uploadAPI } from '../api/client';

/**
 * ImageUploader - Reusable component for uploading images to Cloudinary
 * 
 * @param {string} value - Current image URL (for preview)
 * @param {function} onChange - Callback when image URL changes
 * @param {string} folder - Cloudinary folder (products, stories, gallery, etc.)
 * @param {string} placeholder - Placeholder text
 * @param {boolean} allowUrl - Allow pasting URLs (hybrid mode)
 */
export default function ImageUploader({ 
  value = '', 
  onChange, 
  folder = 'products',
  placeholder = 'Upload image or paste URL',
  allowUrl = true 
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }
    
    setError('');
    setUploading(true);
    setProgress(0);
    
    try {
      const result = await uploadAPI.uploadToCloudinary(
        file, 
        folder,
        (pct) => setProgress(pct)
      );
      onChange(result.url);
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handlePaste = (e) => {
    // Handle pasted files
    const items = e.clipboardData?.items;
    if (items) {
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          handleFileSelect(file);
          return;
        }
      }
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    onChange(url);
  };

  const handleClear = () => {
    onChange('');
    setError('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onPaste={handlePaste}
        onClick={() => !uploading && fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? '#2a8d9c' : '#e5e7eb'}`,
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          backgroundColor: dragOver ? 'rgba(42, 141, 156, 0.05)' : '#fafafa',
          transition: 'all 0.2s ease'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files[0])}
          style={{ display: 'none' }}
        />
        
        {uploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '14px', color: '#666' }}>Uploading... {progress}%</span>
            <div style={{ 
              width: '100%', 
              height: '4px', 
              backgroundColor: '#e5e7eb', 
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${progress}%`, 
                height: '100%', 
                backgroundColor: '#2a8d9c',
                transition: 'width 0.2s ease'
              }} />
            </div>
          </div>
        ) : value ? (
          <div style={{ position: 'relative' }}>
            <img 
              src={value} 
              alt="Preview" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '120px', 
                borderRadius: '8px',
                objectFit: 'cover'
              }} 
            />
            <button
              onClick={(e) => { e.stopPropagation(); handleClear(); }}
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: '#ef4444',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Upload size={24} color="#9ca3af" />
            <span style={{ fontSize: '14px', color: '#666' }}>
              Drop image here or click to upload
            </span>
            <span style={{ fontSize: '12px', color: '#9ca3af' }}>
              PNG, JPG, WebP up to 10MB
            </span>
          </div>
        )}
      </div>
      
      {/* URL Input (hybrid mode) */}
      {allowUrl && !uploading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>or</span>
          <input
            type="url"
            value={value}
            onChange={handleUrlChange}
            placeholder={placeholder}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <span style={{ fontSize: '12px', color: '#ef4444' }}>{error}</span>
      )}
      
      {/* Spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
