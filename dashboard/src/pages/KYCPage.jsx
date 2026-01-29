import { useState, useEffect } from 'react';
import { kycAPI } from '../api/client';

const KENYA_COUNTIES = [
  'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita-Taveta', 'Garissa', 'Wajir',
  'Mandera', 'Marsabit', 'Isiolo', 'Meru', 'Tharaka-Nithi', 'Embu', 'Kitui', 'Machakos',
  'Makueni', 'Nyandarua', 'Nyeri', 'Kirinyaga', 'Murang\'a', 'Kiambu', 'Turkana', 'West Pokot',
  'Samburu', 'Trans-Nzoia', 'Uasin Gishu', 'Elgeyo-Marakwet', 'Nandi', 'Baringo', 'Laikipia',
  'Nakuru', 'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma', 'Busia',
  'Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira', 'Nairobi'
];

export default function KYCPage() {
  const [loading, setLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState(null);
  const [formData, setFormData] = useState({
    business_type: 'sole_proprietor',
    national_id_front: '',
    national_id_back: '',
    kra_pin_cert: '',
    owner_full_name: '',
    owner_id_number: '',
    owner_kra_pin: '',
    business_registration_cert: '',
    business_name: '',
    physical_address: '',
    city: '',
    county: '',
    postal_code: '',
    directors_list: '',
    board_resolution_letter: ''
  });
  const [uploading, setUploading] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadKYCStatus();
  }, []);

  const loadKYCStatus = async () => {
    try {
      const response = await kycAPI.getStatus();
      const status = response.data;
      setKycStatus(status);
      
      // Pre-populate form if KYC exists
      if (status.exists && status.kyc_data) {
        setFormData({
          business_type: status.kyc_data.business_type || 'sole_proprietor',
          national_id_front: status.kyc_data.national_id_front || '',
          national_id_back: status.kyc_data.national_id_back || '',
          kra_pin_cert: status.kyc_data.kra_pin_cert || '',
          owner_full_name: status.kyc_data.owner_full_name || '',
          owner_id_number: status.kyc_data.owner_id_number || '',
          owner_kra_pin: status.kyc_data.owner_kra_pin || '',
          business_registration_cert: status.kyc_data.business_registration_cert || '',
          business_name: status.kyc_data.business_name || '',
          physical_address: status.kyc_data.physical_address || '',
          city: status.kyc_data.city || '',
          county: status.kyc_data.county || '',
          postal_code: status.kyc_data.postal_code || '',
          directors_list: status.kyc_data.directors_list || '',
          board_resolution_letter: status.kyc_data.board_resolution_letter || ''
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Load KYC status error:', error);
      setLoading(false);
    }
  };

  const uploadToCloudinary = async (file, field) => {
    setUploading(prev => ({ ...prev, [field]: true }));
    
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('upload_preset', 'jari_kyc'); // Using our custom KYC preset
    uploadFormData.append('folder', `jari/kyc`);

    try {
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dmfrtzgkv/image/upload',
        {
          method: 'POST',
          body: uploadFormData
        }
      );
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.secure_url) {
        throw new Error('No URL returned from Cloudinary');
      }
      
      console.log(`✅ Uploaded ${field}:`, data.secure_url);
      
      setFormData(prev => ({
        ...prev,
        [field]: data.secure_url
      }));
      
      setUploading(prev => ({ ...prev, [field]: false }));
      return data.secure_url;
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(prev => ({ ...prev, [field]: false }));
      alert(`Upload failed for ${field.replace(/_/g, ' ')}. Please try again. Error: ${error.message}`);
      return null;
    }
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File too large. Maximum size is 5MB.');
        return;
      }
      uploadToCloudinary(file, field);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const { business_type } = formData;
    
    // Check if any uploads are in progress
    const uploadingFields = Object.entries(uploading).filter(([_, isUploading]) => isUploading);
    if (uploadingFields.length > 0) {
      alert('Please wait for uploads to complete before submitting.');
      return false;
    }
    
    // Required for all
    const requiredPersonal = [
      { field: 'national_id_front', label: 'National ID (Front)' },
      { field: 'national_id_back', label: 'National ID (Back)' },
      { field: 'kra_pin_cert', label: 'KRA PIN Certificate' },
      { field: 'owner_full_name', label: 'Full Name' },
      { field: 'owner_id_number', label: 'ID Number' },
      { field: 'owner_kra_pin', label: 'KRA PIN' },
      { field: 'physical_address', label: 'Street Address' },
      { field: 'city', label: 'City/Town' },
      { field: 'county', label: 'County' }
    ];
    
    for (const { field, label } of requiredPersonal) {
      if (!formData[field] || formData[field].trim() === '') {
        console.log('Missing field:', field, 'Value:', formData[field]);
        alert(`Please fill in: ${label}`);
        return false;
      }
    }
    
    // Required for limited companies
    if (business_type === 'limited_company') {
      const requiredBusiness = [
        { field: 'business_registration_cert', label: 'Business Registration Certificate' },
        { field: 'business_name', label: 'Business Name' },
        { field: 'directors_list', label: 'Directors List' },
        { field: 'board_resolution_letter', label: 'Board Resolution Letter' }
      ];
      
      for (const { field, label } of requiredBusiness) {
        if (!formData[field] || formData[field].trim() === '') {
          console.log('Missing business field:', field, 'Value:', formData[field]);
          alert(`Please fill in: ${label}`);
          return false;
        }
      }
    }
    
    console.log('✅ Validation passed! FormData:', formData);
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      await kycAPI.submit(formData);
      alert('KYC documents submitted successfully! We will review and get back to you within 3-7 business days.');
      loadKYCStatus();
    } catch (error) {
      console.error('Submit KYC error:', error);
      alert('Failed to submit KYC. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading KYC status...</p>
        </div>
      </div>
    );
  }

  // Status banner component
  const StatusBanner = () => {
    if (!kycStatus?.exists) return null;
    
    const statusConfig = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', icon: '📝', message: 'Draft - Complete your documents' },
      docs_uploaded: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '📄', message: 'Documents uploaded - Ready for submission' },
      submitted_to_intasend: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳', message: 'Under review - Please wait 3-7 days' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: '✅', message: 'Approved! M-Pesa STK Push is now active' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: '❌', message: 'Rejected - Please review and resubmit' }
    };
    
    const config = statusConfig[kycStatus.status] || statusConfig.draft;
    
    return (
      <div className={`${config.bg} ${config.text} rounded-lg p-4 mb-6`}>
        <div className="flex items-center">
          <span className="text-2xl mr-3">{config.icon}</span>
          <div className="flex-1">
            <p className="font-semibold">{config.message}</p>
            {kycStatus.status === 'rejected' && kycStatus.rejection_reason && (
              <p className="text-sm mt-1">Reason: {kycStatus.rejection_reason}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Approved view
  if (kycStatus?.status === 'approved') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">KYC Verification</h1>
        <StatusBanner />
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">KYC Approved!</h2>
            <p className="text-gray-600 mb-6">
              Your M-Pesa STK Push is now active. Customers can pay directly on your store.
            </p>
            <p className="text-sm text-gray-500">
              Wallet ID: {kycStatus.intasend_wallet_id}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Under review view
  if (kycStatus?.status === 'submitted_to_intasend') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">KYC Verification</h1>
        <StatusBanner />
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold mb-2">Under Review</h2>
            <p className="text-gray-600 mb-4">
              Your documents are being reviewed by IntaSend.
            </p>
            <p className="text-sm text-gray-500">
              This typically takes 3-7 business days. We'll notify you once approved.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Upload form
  return (
    <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>KYC Verification</h1>
          <p style={styles.subtitle}>
            Complete KYC verification to enable M-Pesa STK Push auto-checkout
          </p>
        </div>
      </div>
      
      <StatusBanner />
      
      <div style={styles.formContainer}>
        {/* Business Type Selection */}
        <div className="glass-card" style={styles.section}>
          <h2 style={styles.sectionTitle}>Business Type</h2>
          <select
            name="business_type"
            value={formData.business_type}
            onChange={handleInputChange}
            className="dashboard-input"
          >
            <option value="sole_proprietor">Sole Proprietor</option>
            <option value="partnership">Partnership</option>
            <option value="limited_company">Limited Company</option>
          </select>
        </div>

        {/* Personal KYC */}
        <div className="glass-card" style={styles.section}>
          <h2 style={styles.sectionTitle}>Personal Identification</h2>
          
          <div style={styles.gridTwo}>
            <div style={styles.formGroup}>
              <label style={styles.label}>NATIONAL ID (FRONT) *</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange(e, 'national_id_front')}
                className="dashboard-input"
                disabled={uploading.national_id_front}
                style={styles.fileInput}
              />
              {uploading.national_id_front && <p style={styles.uploadingText}>Uploading...</p>}
              {formData.national_id_front && <p style={styles.successText}>✓ Uploaded</p>}
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>NATIONAL ID (BACK) *</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange(e, 'national_id_back')}
                className="dashboard-input"
                disabled={uploading.national_id_back}
                style={styles.fileInput}
              />
              {uploading.national_id_back && <p style={styles.uploadingText}>Uploading...</p>}
              {formData.national_id_back && <p style={styles.successText}>✓ Uploaded</p>}
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>KRA PIN CERTIFICATE *</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleFileChange(e, 'kra_pin_cert')}
              className="dashboard-input"
              disabled={uploading.kra_pin_cert}
              style={styles.fileInput}
            />
            {uploading.kra_pin_cert && <p style={styles.uploadingText}>Uploading...</p>}
            {formData.kra_pin_cert && <p style={styles.successText}>✓ Uploaded</p>}
          </div>

          <div style={styles.gridThree}>
            <div style={styles.formGroup}>
              <label style={styles.label}>FULL NAME *</label>
              <input
                type="text"
                name="owner_full_name"
                value={formData.owner_full_name}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="dashboard-input"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>ID NUMBER *</label>
              <input
                type="text"
                name="owner_id_number"
                value={formData.owner_id_number}
                onChange={handleInputChange}
                placeholder="12345678"
                className="dashboard-input"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>KRA PIN *</label>
              <input
                type="text"
                name="owner_kra_pin"
                value={formData.owner_kra_pin}
                onChange={handleInputChange}
                placeholder="A001234567X"
                className="dashboard-input"
              />
            </div>
          </div>
        </div>

        {/* Business Documents (Limited Company only) */}
        {formData.business_type === 'limited_company' && (
          <div className="glass-card" style={styles.section}>
            <h2 style={styles.sectionTitle}>Business Documents</h2>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>REGISTERED BUSINESS NAME *</label>
              <input
                type="text"
                name="business_name"
                value={formData.business_name}
                onChange={handleInputChange}
                placeholder="Company Ltd"
                className="dashboard-input"
              />
            </div>

            <div style={styles.gridTwo}>
              <div style={styles.formGroup}>
                <label style={styles.label}>BUSINESS REGISTRATION CERT *</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, 'business_registration_cert')}
                  className="dashboard-input"
                  disabled={uploading.business_registration_cert}
                  style={styles.fileInput}
                />
                {uploading.business_registration_cert && <p style={styles.uploadingText}>Uploading...</p>}
                {formData.business_registration_cert && <p style={styles.successText}>✓ Uploaded</p>}
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>DIRECTORS LIST *</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, 'directors_list')}
                  className="dashboard-input"
                  disabled={uploading.directors_list}
                  style={styles.fileInput}
                />
                {uploading.directors_list && <p style={styles.uploadingText}>Uploading...</p>}
                {formData.directors_list && <p style={styles.successText}>✓ Uploaded</p>}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>BOARD RESOLUTION LETTER *</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(e, 'board_resolution_letter')}
                className="dashboard-input"
                disabled={uploading.board_resolution_letter}
                style={styles.fileInput}
              />
              {uploading.board_resolution_letter && <p style={styles.uploadingText}>Uploading...</p>}
              {formData.board_resolution_letter && <p style={styles.successText}>✓ Uploaded</p>}
              <p style={styles.hint}>
                Download template: <a href="#" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>Board Resolution Template</a>
              </p>
            </div>
          </div>
        )}

        {/* Physical Address */}
        <div className="glass-card" style={styles.section}>
          <h2 style={styles.sectionTitle}>Physical Address</h2>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>STREET ADDRESS *</label>
            <input
              type="text"
              name="physical_address"
              value={formData.physical_address}
              onChange={handleInputChange}
              placeholder="123 Main Street, Building Name"
              className="dashboard-input"
            />
          </div>
          
          <div style={styles.gridThree}>
            <div style={styles.formGroup}>
              <label style={styles.label}>CITY/TOWN *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Nairobi"
                className="dashboard-input"
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>COUNTY *</label>
              <select
                name="county"
                value={formData.county}
                onChange={handleInputChange}
                className="dashboard-input"
              >
                <option value="">Select County</option>
                {KENYA_COUNTIES.map(county => (
                  <option key={county} value={county}>{county}</option>
                ))}
              </select>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>POSTAL CODE</label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleInputChange}
                placeholder="00100"
                className="dashboard-input"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div style={styles.submitSection}>
          <button
            onClick={handleSubmit}
            disabled={submitting || Object.values(uploading).some(v => v)}
            className="btn btn-primary"
            style={styles.submitBtn}
          >
            {submitting ? 'Submitting...' : kycStatus?.status === 'rejected' ? 'Resubmit Documents' : 'Submit for Verification'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  header: { marginBottom: '32px' },
  title: { fontSize: '34px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)', letterSpacing: '-0.025em' },
  subtitle: { fontSize: '15px', color: 'var(--text-muted)' },
  formContainer: { display: 'flex', flexDirection: 'column', gap: '20px' },
  section: { padding: '24px' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' },
  label: { fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  fileInput: { cursor: 'pointer' },
  uploadingText: { fontSize: '12px', color: 'var(--accent-color)', marginTop: '4px' },
  successText: { fontSize: '12px', color: '#22c55e', marginTop: '4px', fontWeight: '600' },
  hint: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' },
  gridTwo: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', '@media (max-width: 768px)': { gridTemplateColumns: '1fr' } },
  gridThree: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', '@media (max-width: 768px)': { gridTemplateColumns: '1fr' } },
  submitSection: { display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' },
  submitBtn: { padding: '14px 32px', fontSize: '15px', fontWeight: '600' },
};
