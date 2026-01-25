import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Generate organized folder structure per merchant
 * 
 * Structure:
 * cloudinary://jari-ecom/
 * ├── store-123/
 * │   ├── products/           - Product images
 * │   │   ├── product-456.jpg
 * │   │   └── galleries/      - Product galleries
 * │   │       └── product-456/
 * │   ├── verification/       - KYC documents
 * │   │   ├── national-id-front.jpg
 * │   │   ├── business-reg.pdf
 * │   │   └── kra-pin.pdf
 * │   ├── branding/           - Logo, banners
 * │   │   ├── logo.png
 * │   │   └── hero-banner.jpg
 * │   └── temp/               - Temporary uploads (auto-delete)
 */
export const generateUploadSignature = (storeId, contentType = 'products', productId = null) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  
  // Build folder path
  let folder = `jari-ecom/store-${storeId}/${contentType}`;
  
  // For product galleries, add product-specific subfolder
  if (contentType === 'products' && productId) {
    folder = `jari-ecom/store-${storeId}/products/galleries/product-${productId}`;
  }
  
  // Generate signature
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder,
      upload_preset: 'jari_uploads'
    },
    process.env.CLOUDINARY_API_SECRET
  );
  
  return {
    signature,
    timestamp,
    folder,
    api_key: process.env.CLOUDINARY_API_KEY,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    upload_preset: 'jari_uploads'
  };
};

/**
 * Delete files from Cloudinary by folder
 * Useful for cleanup when merchant deletes products/account
 */
export const deleteFolder = async (storeId, contentType = 'products', productId = null) => {
  try {
    let prefix = `jari-ecom/store-${storeId}/${contentType}`;
    
    if (contentType === 'products' && productId) {
      prefix = `jari-ecom/store-${storeId}/products/galleries/product-${productId}`;
    }
    
    // Delete all resources in folder
    const result = await cloudinary.api.delete_resources_by_prefix(prefix);
    
    // Delete the folder itself
    await cloudinary.api.delete_folder(prefix);
    
    return result;
  } catch (error) {
    console.error('Cloudinary folder deletion error:', error);
    throw error;
  }
};

/**
 * Get all images for a store (for migration/backup)
 */
export const listStoreImages = async (storeId) => {
  try {
    const prefix = `jari-ecom/store-${storeId}`;
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix,
      max_results: 500
    });
    
    return result.resources;
  } catch (error) {
    console.error('Cloudinary list error:', error);
    throw error;
  }
};

export default cloudinary;
