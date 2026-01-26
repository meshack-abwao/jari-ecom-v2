// ============================================================================
// TEMPLATES API - Template Management
// Phase C2: Template Assignment System
// ============================================================================

import express from 'express';
import db from '../config/database.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Template definitions with pricing (v2.0 - matches pricing doc)
const TEMPLATES = {
  'quick-decision': { name: 'Quick Sell', price: 500, description: 'Simple products, impulse buys', checkoutStyle: 'Minimal steps, fast checkout' },
  'visual-menu': { name: 'Visual Menu', price: 600, description: 'Food, bakery, restaurants', checkoutStyle: 'Grid display, cart checkout' },
  'deep-dive': { name: 'Deep Dive', price: 800, description: 'Premium, complex products', checkoutStyle: 'Gallery, specs, storytelling' },
  'portfolio-booking': { name: 'Services', price: 800, description: 'Coaching, consulting, freelance', checkoutStyle: 'Packages, inquiry flow' },
  'event-landing': { name: 'Events/Booking', price: 1000, description: 'Classes, appointments, tickets', checkoutStyle: 'Date/time picker, capacity' },
  'catalog': { name: 'Catalog', price: 400, description: 'Browse-only, WhatsApp inquiry', checkoutStyle: 'No direct checkout' }
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
    
    // Get all templates currently in use by this store's products (grandfathered)
    const productsResult = await db.query(
      `SELECT DISTINCT template FROM products WHERE store_id = $1 AND template IS NOT NULL`,
      [store.id]
    );
    const grandfatheredTemplates = productsResult.rows.map(r => r.template);
    
    // Build template list with unlock status
    // Template is unlocked if: explicitly unlocked, default for business, OR grandfathered
    const templates = Object.entries(TEMPLATES).map(([id, template]) => ({
      id,
      ...template,
      unlocked: unlockedThemes.includes(id) || id === defaultTemplate || grandfatheredTemplates.includes(id),
      isDefault: id === defaultTemplate,
      isGrandfathered: grandfatheredTemplates.includes(id) && !unlockedThemes.includes(id) && id !== defaultTemplate
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
    
    // Get current product template (for grandfathering)
    const productResult = await db.query(
      `SELECT id, template FROM products WHERE id = $1 AND store_id = $2`,
      [productId, store.id]
    );
    
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const currentTemplate = productResult.rows[0].template;
    
    // Check if template is accessible:
    // 1. It's in unlocked_themes
    // 2. It's the default template for business type
    // 3. It's the CURRENT template (grandfathering - don't lock users out of existing assignments)
    const isUnlocked = unlockedThemes.includes(templateId);
    const isDefault = templateId === defaultTemplate;
    const isCurrentTemplate = templateId === currentTemplate;
    
    if (!isUnlocked && !isDefault && !isCurrentTemplate) {
      return res.status(403).json({ 
        error: 'Template not unlocked',
        requiresUnlock: true,
        templateId,
        price: TEMPLATES[templateId].price
      });
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
