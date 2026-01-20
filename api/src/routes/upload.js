import { Router } from 'express';
import cloudinary from '../config/cloudinary.js';
import { auth } from '../middleware/auth.js';
import db from '../config/database.js';

const router = Router();

// ===========================================
// GET SIGNATURE FOR CLIENT-SIDE UPLOAD
// ===========================================
// This generates a signed upload URL so the client can upload
// directly to Cloudinary without exposing API secrets
router.post('/signature', auth, async (req, res, next) => {
  try {
    const { folder, publicId } = req.body;
    
    // Get user's store ID for folder organization
    const storeResult = await db.query(
      'SELECT id, slug FROM stores WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const store = storeResult.rows[0];
    
    // Build folder path: jari/{store_id}/{subfolder}
    // e.g., jari/store_123/products or jari/store_123/stories
    const uploadFolder = `jari/store_${store.id}/${folder || 'general'}`;
    
    // Generate timestamp (required for signature)
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Parameters to sign
    const paramsToSign = {
      timestamp,
      folder: uploadFolder,
    };
    
    // Add public_id if provided (for replacing existing images)
    if (publicId) {
      paramsToSign.public_id = publicId;
    }
    
    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );
    
    res.json({
      success: true,
      signature,
      timestamp,
      folder: uploadFolder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (err) {
    next(err);
  }
});

// ===========================================
// DELETE IMAGE
// ===========================================
router.delete('/:publicId', auth, async (req, res, next) => {
  try {
    const { publicId } = req.params;
    
    // Verify the image belongs to user's store (check folder prefix)
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const storeId = storeResult.rows[0].id;
    const expectedPrefix = `jari/store_${storeId}/`;
    
    // Security: Only allow deleting images from user's own store folder
    if (!publicId.startsWith(expectedPrefix)) {
      return res.status(403).json({ error: 'Not authorized to delete this image' });
    }
    
    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    
    res.json({
      success: true,
      result
    });
  } catch (err) {
    next(err);
  }
});

// ===========================================
// GET UPLOAD STATS (for monitoring usage)
// ===========================================
router.get('/stats', auth, async (req, res, next) => {
  try {
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const storeId = storeResult.rows[0].id;
    const folder = `jari/store_${storeId}`;
    
    // Get folder resources count
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder,
      max_results: 1
    });
    
    res.json({
      success: true,
      folder,
      totalImages: result.total_count || 0
    });
  } catch (err) {
    // If folder doesn't exist yet, return 0
    if (err.error?.http_code === 404) {
      return res.json({ success: true, totalImages: 0 });
    }
    next(err);
  }
});

export default router;
