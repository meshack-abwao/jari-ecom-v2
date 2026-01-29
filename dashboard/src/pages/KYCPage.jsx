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
      setKycStatus(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Load KYC status error:', error);
      setLoading(false);
    }
  };

  const uploadToCloudinary = async (file, field) => {
    setUploading(prev => ({ ...prev, [field]: true }));
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'jari_kyc'); // You'll need to create this preset
    formData.append('folder', `jari/kyc`);

    try {
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dmfrtzgkv/image/upload',
        {
          method: 'POST',
          body: formData
        }
      );
      
      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        [field]: data.secure_url
      }));
      
      setUploading(prev => ({ ...prev, [field]: false }));
      return data.secure_url;
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(prev => ({ ...prev, [field]: false }));
      alert('Upload failed. Please try again.');
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
    
    // Required for all
    const requiredPersonal = [
      'national_id_front', 'national_id_back', 'kra_pin_cert',
      'owner_full_name', 'owner_id_number', 'owner_kra_pin',
      'physical_address', 'city', 'county'
    ];
    
    for (const field of requiredPersonal) {
      if (!formData[field]) {
        alert(`Please fill in: ${field.replace(/_/g, ' ')}`);
        return false;
      }
    }
    
    // Required for limited companies
    if (business_type === 'limited_company') {
      const requiredBusiness = [
        'business_registration_cert', 'business_name',
        'directors_list', 'board_resolution_letter'
      ];
      
      for (const field of requiredBusiness) {
        if (!formData[field]) {
          alert(`Please fill in: ${field.replace(/_/g, ' ')}`);
          return false;
        }
      }
    }
    
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

  // Form view (draft, docs_uploaded, or rejected)
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">KYC Verification</h1>
      <p className="text-gray-600 mb-6">
        Complete KYC verification to activate M-Pesa STK Push auto-checkout.
      </p>
      
      <StatusBanner />

      <div className="bg-white rounded-lg shadow p-6 space-y-8">
        
        {/* Business Type Selection */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Business Type</h2>
          <select
            name="business_type"
            value={formData.business_type}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="sole_proprietor">Sole Proprietor</option>
            <option value="partnership">Partnership</option>
            <option value="limited_company">Limited Company</option>
          </select>
        </div>

        {/* Personal KYC */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Personal Identification</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">National ID (Front) *</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange(e, 'national_id_front')}
                className="w-full p-2 border border-gray-300 rounded"
                disabled={uploading.national_id_front}
              />
              {uploading.national_id_front && <p className="text-sm text-blue-600 mt-1">Uploading...</p>}
              {formData.national_id_front && <p className="text-sm text-green-600 mt-1">✓ Uploaded</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">National ID (Back) *</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange(e, 'national_id_back')}
                className="w-full p-2 border border-gray-300 rounded"
                disabled={uploading.national_id_back}
              />
              {uploading.national_id_back && <p className="text-sm text-blue-600 mt-1">Uploading...</p>}
              {formData.national_id_back && <p className="text-sm text-green-600 mt-1">✓ Uploaded</p>}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">KRA PIN Certificate *</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleFileChange(e, 'kra_pin_cert')}
              className="w-full p-2 border border-gray-300 rounded"
              disabled={uploading.kra_pin_cert}
            />
            {uploading.kra_pin_cert && <p className="text-sm text-blue-600 mt-1">Uploading...</p>}
            {formData.kra_pin_cert && <p className="text-sm text-green-600 mt-1">✓ Uploaded</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              name="owner_full_name"
              value={formData.owner_full_name}
              onChange={handleInputChange}
              placeholder="Full Name *"
              className="p-3 border border-gray-300 rounded"
            />
            <input
              type="text"
              name="owner_id_number"
              value={formData.owner_id_number}
              onChange={handleInputChange}
              placeholder="ID Number *"
              className="p-3 border border-gray-300 rounded"
            />
            <input
              type="text"
              name="owner_kra_pin"
              value={formData.owner_kra_pin}
              onChange={handleInputChange}
              placeholder="KRA PIN *"
              className="p-3 border border-gray-300 rounded"
            />
          </div>
        </div>

        {/* Business Documents (Limited Company only) */}
        {formData.business_type === 'limited_company' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Business Documents</h2>
            
            <div className="mb-4">
              <input
                type="text"
                name="business_name"
                value={formData.business_name}
                onChange={handleInputChange}
                placeholder="Registered Business Name *"
                className="w-full p-3 border border-gray-300 rounded"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Business Registration Certificate *</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, 'business_registration_cert')}
                  className="w-full p-2 border border-gray-300 rounded"
                  disabled={uploading.business_registration_cert}
                />
                {uploading.business_registration_cert && <p className="text-sm text-blue-600 mt-1">Uploading...</p>}
                {formData.business_registration_cert && <p className="text-sm text-green-600 mt-1">✓ Uploaded</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Directors List *</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, 'directors_list')}
                  className="w-full p-2 border border-gray-300 rounded"
                  disabled={uploading.directors_list}
                />
                {uploading.directors_list && <p className="text-sm text-blue-600 mt-1">Uploading...</p>}
                {formData.directors_list && <p className="text-sm text-green-600 mt-1">✓ Uploaded</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Board Resolution Letter *</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(e, 'board_resolution_letter')}
                className="w-full p-2 border border-gray-300 rounded"
                disabled={uploading.board_resolution_letter}
              />
              {uploading.board_resolution_letter && <p className="text-sm text-blue-600 mt-1">Uploading...</p>}
              {formData.board_resolution_letter && <p className="text-sm text-green-600 mt-1">✓ Uploaded</p>}
              <p className="text-sm text-gray-500 mt-1">
                Download template: <a href="#" className="text-blue-600 hover:underline">Board Resolution Template</a>
              </p>
            </div>
          </div>
        )}

        {/* Physical Address */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Physical Address</h2>
          
          <div className="space-y-4">
            <input
              type="text"
              name="physical_address"
              value={formData.physical_address}
              onChange={handleInputChange}
              placeholder="Street Address *"
              className="w-full p-3 border border-gray-300 rounded"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="City/Town *"
                className="p-3 border border-gray-300 rounded"
              />
              
              <select
                name="county"
                value={formData.county}
                onChange={handleInputChange}
                className="p-3 border border-gray-300 rounded"
              >
                <option value="">Select County *</option>
                {KENYA_COUNTIES.map(county => (
                  <option key={county} value={county}>{county}</option>
                ))}
              </select>
              
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleInputChange}
                placeholder="Postal Code"
                className="p-3 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={handleSubmit}
            disabled={submitting || Object.values(uploading).some(v => v)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : kycStatus?.status === 'rejected' ? 'Resubmit Documents' : 'Submit for Verification'}
          </button>
        </div>
      </div>
    </div>
  );
}
