import { Router } from 'express';
import db from '../config/database.js';
import crypto from 'crypto';
import { auth } from '../middleware/auth.js';

const router = Router();

// ============================================
// NETLIFY CONFIGURATION
// ============================================
const NETLIFY_ACCESS_TOKEN = process.env.NETLIFY_ACCESS_TOKEN || 'nfp_js9pV3BYWUzCWYGxQBuugJyp5AMqkNgB35d3';
const NETLIFY_SITE_ID = process.env.NETLIFY_SITE_ID || 'cf6a58bd-1b7d-437a-a854-1a01c4f26fc9';

// ============================================
// HELPER FUNCTIONS
// ============================================

// Add domain to Netlify (auto-provisioning)
async function addDomainToNetlify(domain) {
  try {
    const response = await fetch(
      `https://api.netlify.com/api/v1/sites/${NETLIFY_SITE_ID}/domain_aliases`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NETLIFY_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ domain })
      }
    );
    
    if (response.ok) {
      console.log(`✅ Domain added to Netlify: ${domain}`);
      return { success: true };
    } else {
      const error = await response.json();
      // Domain might already exist - that's okay
      if (error.message?.includes('already exists') || error.code === 422) {
        console.log(`ℹ️ Domain already exists in Netlify: ${domain}`);
        return { success: true, alreadyExists: true };
      }
      console.error(`❌ Netlify error: ${JSON.stringify(error)}`);
      return { success: false, error: error.message };
    }
  } catch (err) {
    console.error(`❌ Failed to add domain to Netlify: ${err.message}`);
    return { success: false, error: err.message };
  }
}

// Remove domain from Netlify
async function removeDomainFromNetlify(domain) {
  try {
    const response = await fetch(
      `https://api.netlify.com/api/v1/sites/${NETLIFY_SITE_ID}/domain_aliases/${domain}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${NETLIFY_ACCESS_TOKEN}`
        }
      }
    );
    
    if (response.ok || response.status === 404) {
      console.log(`✅ Domain removed from Netlify: ${domain}`);
      return { success: true };
    } else {
      const error = await response.json();
      console.error(`❌ Netlify removal error: ${JSON.stringify(error)}`);
      return { success: false, error: error.message };
    }
  } catch (err) {
    console.error(`❌ Failed to remove domain from Netlify: ${err.message}`);
    return { success: false, error: err.message };
  }
}

// Generate verification token
function generateVerificationToken() {
  return `jari-verify-${crypto.randomBytes(16).toString('hex')}`;
}

// Normalize domain (lowercase, remove protocol/path)
function normalizeDomain(domain) {
  if (!domain) return null;
  
  // Remove protocol if present
  let normalized = domain.toLowerCase().trim();
  normalized = normalized.replace(/^https?:\/\//, '');
  
  // Remove trailing slashes and paths
  normalized = normalized.split('/')[0];
  
  // Remove www. prefix (optional - we treat www and non-www as same)
  // normalized = normalized.replace(/^www\./, '');
  
  return normalized;
}

// Detect domain type (subdomain vs root)
function detectDomainType(domain) {
  const parts = domain.split('.');
  // shop.example.com = 3 parts = subdomain
  // example.com = 2 parts = root
  // example.co.ke = 3 parts but .co.ke is TLD = root
  
  // Common multi-part TLDs
  const multiPartTLDs = ['co.ke', 'co.uk', 'com.au', 'co.za', 'ac.ke', 'or.ke'];
  
  for (const tld of multiPartTLDs) {
    if (domain.endsWith(`.${tld}`)) {
      // e.g., lanixkenya.co.ke = root, shop.lanixkenya.co.ke = subdomain
      const withoutTLD = domain.slice(0, -(tld.length + 1));
      return withoutTLD.includes('.') ? 'subdomain' : 'root';
    }
  }
  
  // Standard TLDs (.com, .net, etc.)
  return parts.length > 2 ? 'subdomain' : 'root';
}

// ============================================
// PUBLIC ENDPOINTS (No Auth Required)
// ============================================

// Lookup store by custom domain (used by storefront)
router.get('/lookup/:domain', async (req, res) => {
  try {
    const domain = normalizeDomain(req.params.domain);
    
    if (!domain) {
      return res.status(400).json({ error: 'Invalid domain' });
    }
    
    const result = await db.query(
      `SELECT slug, config->>'store_name' as name, config->>'logo_url' as logo
       FROM stores 
       WHERE custom_domain = $1 AND domain_verified = true`,
      [domain]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Domain not configured or not verified' });
    }
    
    res.json({
      slug: result.rows[0].slug,
      name: result.rows[0].name,
      logo: result.rows[0].logo
    });
    
  } catch (err) {
    console.error('Domain lookup error:', err);
    res.status(500).json({ error: 'Failed to lookup domain' });
  }
});

// ============================================
// AUTHENTICATED ENDPOINTS
// ============================================

// Get current domain settings for user's store
router.get('/settings', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const result = await db.query(
      `SELECT 
        custom_domain,
        domain_verified,
        domain_ssl_status,
        domain_type,
        domain_added_at,
        domain_verified_at,
        slug
       FROM stores 
       WHERE user_id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const store = result.rows[0];
    
    // Get verification record if exists
    let verification = null;
    if (store.custom_domain && !store.domain_verified) {
      const verifyResult = await db.query(
        `SELECT verification_token, verification_method, status, attempts, last_attempt_at, error_message
         FROM domain_verifications
         WHERE store_id = (SELECT id FROM stores WHERE user_id = $1)
         AND domain = $2
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId, store.custom_domain]
      );
      if (verifyResult.rows.length > 0) {
        verification = verifyResult.rows[0];
      }
    }
    
    res.json({
      custom_domain: store.custom_domain,
      domain_verified: store.domain_verified,
      domain_ssl_status: store.domain_ssl_status,
      domain_type: store.domain_type,
      domain_added_at: store.domain_added_at,
      domain_verified_at: store.domain_verified_at,
      store_slug: store.slug,
      verification
    });
    
  } catch (err) {
    console.error('Get domain settings error:', err);
    res.status(500).json({ error: 'Failed to get domain settings' });
  }
});

// Setup/add a custom domain
router.post('/setup', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const { domain } = req.body;
    
    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }
    
    const normalizedDomain = normalizeDomain(domain);
    
    if (!normalizedDomain) {
      return res.status(400).json({ error: 'Invalid domain format' });
    }
    
    // Basic domain format validation
    const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;
    if (!domainRegex.test(normalizedDomain)) {
      return res.status(400).json({ error: 'Invalid domain format. Example: shop.yourdomain.com or yourdomain.com' });
    }
    
    // Check if domain is already in use by another store
    const existingResult = await db.query(
      `SELECT s.slug, u.id as owner_id
       FROM stores s
       JOIN users u ON s.user_id = u.id
       WHERE s.custom_domain = $1`,
      [normalizedDomain]
    );
    
    if (existingResult.rows.length > 0) {
      if (existingResult.rows[0].owner_id !== userId) {
        return res.status(409).json({ error: 'This domain is already in use by another store' });
      }
      // Same user, domain already set - just return current state
    }
    
    // Get store ID
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const storeId = storeResult.rows[0].id;
    const domainType = detectDomainType(normalizedDomain);
    const verificationToken = generateVerificationToken();
    
    // Update store with new domain (unverified)
    await db.query(
      `UPDATE stores SET 
        custom_domain = $1,
        domain_verified = false,
        domain_ssl_status = 'pending',
        domain_type = $2,
        domain_added_at = NOW(),
        domain_verified_at = NULL
       WHERE id = $3`,
      [normalizedDomain, domainType, storeId]
    );
    
    // Create verification record
    await db.query(
      `INSERT INTO domain_verifications (store_id, domain, verification_token, verification_method)
       VALUES ($1, $2, $3, 'dns_txt')
       ON CONFLICT (store_id, domain) DO UPDATE SET
         verification_token = $3,
         status = 'pending',
         attempts = 0,
         error_message = NULL,
         created_at = NOW()`,
      [storeId, normalizedDomain, verificationToken]
    );
    
    // Generate DNS instructions
    const dnsInstructions = generateDNSInstructions(normalizedDomain, domainType, verificationToken);
    
    res.json({
      success: true,
      domain: normalizedDomain,
      domain_type: domainType,
      verification_token: verificationToken,
      dns_instructions: dnsInstructions,
      message: 'Domain added. Please configure your DNS records and then verify.'
    });
    
  } catch (err) {
    console.error('Domain setup error:', err);
    res.status(500).json({ error: 'Failed to setup domain' });
  }
});

// Generate DNS setup instructions
function generateDNSInstructions(domain, domainType, verificationToken) {
  const instructions = {
    domain,
    domain_type: domainType,
    verification: {
      type: 'TXT',
      name: '_jari-verify',
      value: verificationToken,
      description: 'Add this TXT record to verify domain ownership'
    },
    routing: []
  };
  
  if (domainType === 'subdomain') {
    // For subdomains like shop.example.com
    const subdomain = domain.split('.')[0];
    instructions.routing.push({
      type: 'CNAME',
      name: subdomain,
      value: 'jarisolutionsecom.store',
      description: `Point ${subdomain} to our servers`
    });
  } else {
    // For root domains like example.com
    instructions.routing.push({
      type: 'A',
      name: '@',
      value: '75.2.60.5',
      description: 'Point root domain to Netlify (IP 1)'
    });
    instructions.routing.push({
      type: 'A',
      name: '@',
      value: '99.83.190.102',
      description: 'Point root domain to Netlify (IP 2)'
    });
    // Also recommend www CNAME
    instructions.routing.push({
      type: 'CNAME',
      name: 'www',
      value: 'jarisolutionsecom.store',
      description: 'Point www to our servers (recommended)'
    });
  }
  
  return instructions;
}

// Verify domain DNS records
router.post('/verify', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get store and current domain
    const storeResult = await db.query(
      `SELECT id, custom_domain, domain_verified, slug
       FROM stores 
       WHERE user_id = $1`,
      [userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const store = storeResult.rows[0];
    
    if (!store.custom_domain) {
      return res.status(400).json({ error: 'No domain configured. Please setup a domain first.' });
    }
    
    if (store.domain_verified) {
      return res.json({ 
        success: true, 
        already_verified: true,
        message: 'Domain is already verified' 
      });
    }
    
    // Get verification token
    const verifyResult = await db.query(
      `SELECT verification_token, attempts
       FROM domain_verifications
       WHERE store_id = $1 AND domain = $2
       ORDER BY created_at DESC
       LIMIT 1`,
      [store.id, store.custom_domain]
    );
    
    if (verifyResult.rows.length === 0) {
      return res.status(400).json({ error: 'No verification record found. Please setup domain again.' });
    }
    
    const verification = verifyResult.rows[0];
    
    // Update attempt count
    await db.query(
      `UPDATE domain_verifications 
       SET attempts = attempts + 1, last_attempt_at = NOW()
       WHERE store_id = $1 AND domain = $2`,
      [store.id, store.custom_domain]
    );
    
    // Perform DNS verification
    // In production, you'd use dns.resolveTxt() to check for the TXT record
    // For now, we'll do a simplified check or trust the user
    
    let verified = false;
    let errorMessage = null;
    
    try {
      // Dynamic import for dns (Node.js built-in)
      const dns = await import('dns');
      const { promisify } = await import('util');
      const resolveTxt = promisify(dns.resolveTxt);
      
      // Check for TXT record: _jari-verify.domain.com
      const txtHost = `_jari-verify.${store.custom_domain}`;
      
      try {
        const records = await resolveTxt(txtHost);
        // records is array of arrays, flatten and check
        const flatRecords = records.flat();
        verified = flatRecords.includes(verification.verification_token);
        
        if (!verified) {
          errorMessage = `TXT record found but value doesn't match. Expected: ${verification.verification_token}`;
        }
      } catch (dnsErr) {
        if (dnsErr.code === 'ENODATA' || dnsErr.code === 'ENOTFOUND') {
          errorMessage = 'TXT record not found. Please add the DNS record and wait up to 48 hours for propagation.';
        } else {
          errorMessage = `DNS lookup failed: ${dnsErr.message}`;
        }
      }
    } catch (importErr) {
      // If DNS module fails, allow manual verification for now
      console.log('DNS verification not available, allowing manual verification');
      // In production, you'd want to handle this differently
      // For beta, we can manually verify domains
      errorMessage = 'Automatic verification not available. Contact support for manual verification.';
    }
    
    if (verified) {
      // AUTO-PROVISION: Add domain to Netlify
      const netlifyResult = await addDomainToNetlify(store.custom_domain);
      if (!netlifyResult.success) {
        console.error('Warning: Failed to add domain to Netlify, but continuing with verification');
      }
      
      // Update store as verified
      await db.query(
        `UPDATE stores SET 
          domain_verified = true,
          domain_ssl_status = 'active',
          domain_verified_at = NOW()
         WHERE id = $1`,
        [store.id]
      );
      
      // Update verification record
      await db.query(
        `UPDATE domain_verifications 
         SET status = 'verified', verified_at = NOW(), error_message = NULL
         WHERE store_id = $1 AND domain = $2`,
        [store.id, store.custom_domain]
      );
      
      res.json({
        success: true,
        verified: true,
        domain: store.custom_domain,
        netlifyProvisioned: netlifyResult.success,
        message: `🎉 Domain verified! Your store is now accessible at https://${store.custom_domain}`
      });
    } else {
      // Update verification record with error
      await db.query(
        `UPDATE domain_verifications 
         SET status = 'failed', error_message = $1
         WHERE store_id = $2 AND domain = $3`,
        [errorMessage, store.id, store.custom_domain]
      );
      
      res.json({
        success: false,
        verified: false,
        error: errorMessage,
        attempts: verification.attempts + 1,
        message: 'Verification failed. Please check your DNS settings.'
      });
    }
    
  } catch (err) {
    console.error('Domain verify error:', err);
    res.status(500).json({ error: 'Failed to verify domain' });
  }
});

// Remove custom domain
router.delete('/remove', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get store
    const storeResult = await db.query(
      'SELECT id, custom_domain FROM stores WHERE user_id = $1',
      [userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const store = storeResult.rows[0];
    const removedDomain = store.custom_domain;
    
    if (!removedDomain) {
      return res.json({ success: true, message: 'No domain to remove' });
    }
    
    // Remove domain from Netlify
    await removeDomainFromNetlify(removedDomain);
    
    // Clear domain from store
    await db.query(
      `UPDATE stores SET 
        custom_domain = NULL,
        domain_verified = false,
        domain_ssl_status = 'pending',
        domain_type = 'subdomain',
        domain_added_at = NULL,
        domain_verified_at = NULL
       WHERE id = $1`,
      [store.id]
    );
    
    // Delete verification records
    await db.query(
      'DELETE FROM domain_verifications WHERE store_id = $1',
      [store.id]
    );
    
    res.json({
      success: true,
      removed_domain: removedDomain,
      message: 'Custom domain removed. Your store is now only accessible via the default URL.'
    });
    
  } catch (err) {
    console.error('Domain remove error:', err);
    res.status(500).json({ error: 'Failed to remove domain' });
  }
});

// Manual verification (admin/support use)
router.post('/manual-verify', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get store
    const storeResult = await db.query(
      `SELECT id, custom_domain, domain_verified
       FROM stores 
       WHERE user_id = $1`,
      [userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const store = storeResult.rows[0];
    
    if (!store.custom_domain) {
      return res.status(400).json({ error: 'No domain configured' });
    }
    
    // AUTO-PROVISION: Add domain to Netlify
    const netlifyResult = await addDomainToNetlify(store.custom_domain);
    
    // For beta: Allow manual verification
    // In production, this should be admin-only
    await db.query(
      `UPDATE stores SET 
        domain_verified = true,
        domain_ssl_status = 'active',
        domain_verified_at = NOW()
       WHERE id = $1`,
      [store.id]
    );
    
    await db.query(
      `UPDATE domain_verifications 
       SET status = 'verified', verified_at = NOW(), error_message = 'Manual verification'
       WHERE store_id = $1 AND domain = $2`,
      [store.id, store.custom_domain]
    );
    
    res.json({
      success: true,
      domain: store.custom_domain,
      netlifyProvisioned: netlifyResult.success,
      message: 'Domain manually verified'
    });
    
  } catch (err) {
    console.error('Manual verify error:', err);
    res.status(500).json({ error: 'Failed to manually verify domain' });
  }
});

export default router;
