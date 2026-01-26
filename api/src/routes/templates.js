// ============================================================================
// TEMPLATES API - Template Management
// Phase C2: Template Assignment System
// ============================================================================

import express from 'express';
import db from '../config/database.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Template definitions with pricing (matches dashboard + pricing doc)
const TEMPLATES = {
  'quick-decision': { name: 'Quick Decision', price: 500, description: 'Simple products, impulse buys' },
  'visual-menu': { name: 'Visual Menu', price: 600, description: 'Restaurants and food businesses' },
  'portfolio-booking': { name: 'Portfolio + Booking', price: 800, description: 'Service providers with packages' },
  'deep-dive': { name: 'Deep Dive', price: 800, description: 'High-ticket items needing specs' },
  'event-landing': { name: 'Event Landing', price: 1000, description: 'Events, workshops, courses' }
};

// ============================================================================
// GET /api/templates/available - Get available templates for store
// ============================================================================
router.get('/available', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get store with unlocked_themes
    const storeResult = await db.query(
      `SELECT id, business_type, unlocked_themes FROM stores WHERE user_id = $1`,
      [userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const store = storeResult.rows[0];
    const unlockedThemes = store.unlocked_themes || [];
    const businessType = store.business_type;
    
    // First template is free based on business type
    const defaultTemplate = getDefaultTemplate(businessType);
    
    // Build template list with unlock status
    const templates = Object.entries(TEMPLATES).map(([id, template]) => ({
      id,
      ...template,
      unlocked: unlockedThemes.includes(id) || id === defaultTemplate,
      isDefault: id === defaultTemplate
    }));
    
    res.json({ templates, defaultTemplate });
  } catch (error) {
    console.error('Error getting templates:', error);
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

// ============================================================================
// POST /api/templates/unlock - Purchase/unlock a template
// ============================================================================
router.post('/unlock', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { templateId, paymentRef } = req.body;
    
    // Validate template
    const template = TEMPLATES[templateId];
    if (!template) {
      return res.status(400).json({ error: 'Invalid template' });
    }
    
    // Get store
    const storeResult = await db.query(
      `SELECT id, unlocked_themes FROM stores WHERE user_id = $1`,
      [userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const store = storeResult.rows[0];
    const unlockedThemes = store.unlocked_themes || [];
    
    // Check if already unlocked
    if (unlockedThemes.includes(templateId)) {
      return res.status(400).json({ error: 'Template already unlocked' });
    }
    
    // Record purchase
    await db.query(
      `INSERT INTO theme_purchases 
       (store_id, theme_id, theme_name, amount_paid, total_paid, payment_ref, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, 'completed')`,
      [store.id, templateId, template.name, template.price, template.price, paymentRef]
    );
    
    // Update store's unlocked themes
    const newUnlocked = [...unlockedThemes, templateId];
    await db.query(
      `UPDATE stores SET unlocked_themes = $1 WHERE id = $2`,
      [JSON.stringify(newUnlocked), store.id]
    );
    
    res.json({
      success: true,
      templateId,
      unlockedThemes: newUnlocked,
      message: `Successfully unlocked ${template.name}!`
    });
  } catch (error) {
    console.error('Error unlocking template:', error);
    res.status(500).json({ error: 'Failed to unlock template' });
  }
});

// ============================================================================
// PUT /api/templates/assign/:productId - Assign template to product
// ============================================================================
router.put('/assign/:productId', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;
    const { templateId } = req.body;
    
    // Validate template
    if (!TEMPLATES[templateId]) {
      return res.status(400).json({ error: 'Invalid template' });
    }
    
    // Get store
    const storeResult = await db.query(
      `SELECT id, unlocked_themes, business_type FROM stores WHERE user_id = $1`,
      [userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const store = storeResult.rows[0];
    const unlockedThemes = store.unlocked_themes || [];
    const defaultTemplate = getDefaultTemplate(store.business_type);
    
    // Check if template is unlocked
    if (!unlockedThemes.includes(templateId) && templateId !== defaultTemplate) {
      return res.status(403).json({ 
        error: 'Template not unlocked',
        requiresUnlock: true,
        templateId,
        price: TEMPLATES[templateId].price
      });
    }
    
    // Verify product belongs to store
    const productResult = await db.query(
      `SELECT id FROM products WHERE id = $1 AND store_id = $2`,
      [productId, store.id]
    );
    
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Update product template
    await db.query(
      `UPDATE products SET template = $1, updated_at = NOW() WHERE id = $2`,
      [templateId, productId]
    );
    
    res.json({
      success: true,
      productId,
      templateId,
      message: `Template changed to ${TEMPLATES[templateId].name}`
    });
  } catch (error) {
    console.error('Error assigning template:', error);
    res.status(500).json({ error: 'Failed to assign template' });
  }
});

// Helper: Get default template based on business type
function getDefaultTemplate(businessType) {
  const mapping = {
    food: 'visual-menu',
    services: 'portfolio-booking',
    products: 'quick-decision',
    premium: 'deep-dive',
    events: 'event-landing'
  };
  return mapping[businessType] || 'quick-decision';
}

export default router;
