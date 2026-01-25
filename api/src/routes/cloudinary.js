import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { generateUploadSignature, deleteFolder } from '../config/cloudinary.js';
import db from '../config/database.js';

const router = Router();

/**
 * Get upload signature for organized folder structure
 * POST /api/cloudinary/signature
 * 
 * Body:
 * - contentType: 'products' | 'verification' | 'branding' | 'temp'
 * - productId: (optional) for product-specific galleries
 */
router.post('/signature', auth, async (req, res, next) => {
  try {
    const { contentType = 'products', productId } = req.body;
    
    const validTypes = ['products', 'verification', 'branding', 'temp'];
    if (!validTypes.includes(contentType)) {
      return res.status(400).json({ error: 'Invalid content type' });
    }
    
    // Get store ID from user
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const storeId = storeResult.rows[0].id;
    
    // Generate upload parameters with organized folder
    const uploadParams = generateUploadSignature(storeId, contentType, productId);
    
    res.json({
      success: true,
      uploadParams
    });
    
  } catch (err) {
    next(err);
  }
});

/**
 * Delete product gallery folder
 * DELETE /api/cloudinary/product/:productId
 */
router.delete('/product/:productId', auth, async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    // Get store ID
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const storeId = storeResult.rows[0].id;
    
    // Verify product belongs to this store
    const productResult = await db.query(
      'SELECT id FROM products WHERE id = $1 AND store_id = $2',
      [productId, storeId]
    );
    
    if (productResult.rows.length === 0) {
      return res.status(403).json({ error: 'Product not found or unauthorized' });
    }
    
    // Delete Cloudinary folder
    await deleteFolder(storeId, 'products', productId);
    
    res.json({
      success: true,
      message: 'Product images deleted from Cloudinary'
    });
    
  } catch (err) {
    next(err);
  }
});

export default router;
