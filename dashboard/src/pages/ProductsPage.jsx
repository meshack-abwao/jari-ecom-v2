import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI, settingsAPI } from '../api/client';
import { Plus, Edit, Trash2, X, Eye, EyeOff, ExternalLink, Image, Tag } from 'lucide-react';

const TEMPLATE_CONFIG = {
  'quick-decision': { name: 'Quick Decision', price: 250, description: 'Perfect for single products or quick impulse buys' },
  'portfolio-booking': { name: 'Portfolio + Booking', price: 500, description: 'For service providers with packages and booking' },
  'visual-menu': { name: 'Visual Menu', price: 600, description: 'For restaurants and food businesses' },
  'deep-dive': { name: 'Deep Dive', price: 800, description: 'For high-ticket items needing detailed specs' },
  'event-landing': { name: 'Event Landing', price: 700, description: 'For events, workshops, and courses' },
};

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const initialTemplate = searchParams.get('template') || 'quick-decision';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [storeUrl, setStoreUrl] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate);
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryEmoji, setNewCategoryEmoji] = useState('📦');
  
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', imageUrl: '', stockQuantity: 1000, isActive: true,
    templateType: initialTemplate, category: '',
    galleryImages: ['', '', '', '', '', ''],
    storyMedia: [{ url: '', type: 'image' }, { url: '', type: 'image' }, { url: '', type: 'image' }, { url: '', type: 'image' }],
    storyTitle: 'See it in Action',
    testimonials: [{ name: '', role: '', quote: '', avatar: '' }],
  });

  useEffect(() => { loadProducts(); loadStoreUrl(); loadCategories(); }, []);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data?.products || []);
    } catch (error) { console.error('Failed to load products:', error); }
    finally { setLoading(false); }
  };

  const loadStoreUrl = async () => {
    try {
      const response = await settingsAPI.getAll();
      const subdomain = response.data?.settings?.subdomain;
      if (subdomain) {
        const baseUrl = import.meta.env.VITE_STORE_URL || 'https://jariecommstore.netlify.app';
        setStoreUrl(`${baseUrl}/s/${subdomain}`);
      }
    } catch (error) { console.error('Failed to load store URL:', error); }
  };

  const loadCategories = async () => {
    try {
      const response = await settingsAPI.getAll();
      setCategories(response.data?.settings?.categories || []);
    } catch (error) { console.error('Failed to load categories:', error); }
  };

  const viewProduct = (productId) => { if (storeUrl) window.open(`${storeUrl}?product=${productId}`, '_blank'); };
  const viewCollections = () => { if (storeUrl) window.open(storeUrl, '_blank'); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        templateType: selectedTemplate,
        galleryImages: formData.galleryImages.filter(url => url?.trim()),
        storyMedia: formData.storyMedia.filter(s => s.url?.trim()),
        testimonials: formData.testimonials.filter(t => t.name?.trim() && t.quote?.trim()),
      };
      
      if (editingProduct) {
        await productsAPI.update(editingProduct.id, submitData);
      } else {
        await productsAPI.create(submitData);
      }
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product. Please try again.');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setSelectedTemplate(product.template_type || 'quick-decision');
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      imageUrl: product.image_url || '',
      stockQuantity: product.stock_quantity || 1000,
      isActive: product.is_active !== false,
      templateType: product.template_type || 'quick-decision',
      category: product.category || '',
      galleryImages: parseArray(product.gallery_images, 6),
      storyMedia: parseStoryMedia(product.story_media),
      storyTitle: product.story_title || 'See it in Action',
      testimonials: parseTestimonials(product.testimonials),
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productsAPI.delete(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) { alert('Failed to delete product.'); loadProducts(); }
  };

  const toggleActive = async (product) => {
    try {
      await productsAPI.update(product.id, { ...product, isActive: !product.is_active });
      setProducts(products.map(p => p.id === product.id ? { ...p, is_active: !p.is_active } : p));
    } catch (error) { alert('Failed to update product.'); }
  };

  const resetForm = () => {
    setFormData({
      name: '', description: '', price: '', imageUrl: '', stockQuantity: 1000, isActive: true,
      templateType: 'quick-decision', category: '',
      galleryImages: ['', '', '', '', '', ''],
      storyMedia: [{ url: '', type: 'image' }, { url: '', type: 'image' }, { url: '', type: 'image' }, { url: '', type: 'image' }],
      storyTitle: 'See it in Action',
      testimonials: [{ name: '', role: '', quote: '', avatar: '' }],
    });
    setEditingProduct(null);
    setSelectedTemplate('quick-decision');
    setShowModal(false);
  };

  const parseArray = (json, length) => {
    try { const arr = Array.isArray(json) ? json : JSON.parse(json || '[]'); return [...arr, ...Array(length).fill('')].slice(0, length); }
    catch { return Array(length).fill(''); }
  };

  const parseStoryMedia = (json) => {
    const defaults = [{ url: '', type: 'image' }, { url: '', type: 'image' }, { url: '', type: 'image' }, { url: '', type: 'image' }];
    try { const arr = Array.isArray(json) ? json : JSON.parse(json || '[]'); return [...arr, ...defaults].slice(0, 4).map(s => ({ url: s?.url || '', type: s?.type || 'image' })); }
    catch { return defaults; }
  };

  const parseTestimonials = (json) => {
    const def = [{ name: '', role: '', quote: '', avatar: '' }];
    try { const arr = Array.isArray(json) ? json : JSON.parse(json || '[]'); return arr.length > 0 ? arr : def; }
    catch { return def; }
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    setCategories([...categories, { name: newCategoryName.trim(), emoji: newCategoryEmoji }]);
    setNewCategoryName(''); setNewCategoryEmoji('📦');
  };

  const saveCategories = async () => {
    try {
      await settingsAPI.update({ categories });
      alert('Categories saved!');
      setShowCategoryModal(false);
    } catch (error) { alert('Failed to save categories'); }
  };

  if (loading) return <div style={styles.loadingContainer}><div style={styles.spinner}></div><p>Loading products...</p></div>;

  return (
    <div className="fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Products</h1>
          <p style={styles.subtitle}>Manage your product catalog</p>
        </div>
        <div style={styles.headerActions}>
          <button onClick={() => setShowCategoryModal(true)} style={styles.categoryBtn}><Tag size={18} /> Categories</button>
          {products.length > 0 && storeUrl && (
            <button onClick={viewCollections} style={styles.viewCollectionsBtn}><Eye size={18} /> View Store</button>
          )}
          <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus size={20} /> Add Product</button>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCategoryModal(false)}>
          <div style={styles.categoryModal} className="glass-card" onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}><h2 style={styles.modalTitle}>Manage Categories</h2><button onClick={() => setShowCategoryModal(false)} style={styles.closeBtn}><X size={24} /></button></div>
            <div style={styles.formGroup}>
              <label style={styles.label}>ADD CATEGORY</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" value={newCategoryEmoji} onChange={(e) => setNewCategoryEmoji(e.target.value)} placeholder="📦" style={{ width: '60px', textAlign: 'center' }} className="dashboard-input" />
                <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Category name" style={{ flex: 1 }} className="dashboard-input" onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())} />
                <button onClick={addCategory} className="btn btn-primary" style={{ padding: '10px 16px' }}><Plus size={18} /></button>
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>CATEGORIES ({categories.length})</label>
              {categories.length === 0 ? <p style={styles.hint}>No categories yet</p> : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {categories.map((cat, idx) => (
                    <div key={idx} style={styles.categoryTag}><span>{cat.emoji} {cat.name}</span><button onClick={() => setCategories(categories.filter((_, i) => i !== idx))} style={styles.categoryRemoveBtn}>×</button></div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => setShowCategoryModal(false)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={saveCategories} className="btn btn-primary" style={{ flex: 1 }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={resetForm}>
          <div style={styles.modal} className="glass-card" onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}><h2 style={styles.modalTitle}>{editingProduct ? 'Edit Product' : 'Add Product'}</h2><button onClick={resetForm} style={styles.closeBtn}><X size={24} /></button></div>
            <form onSubmit={handleSubmit} style={styles.form}>
              {/* Template Selector */}
              <div style={styles.templateSelector}>
                <label style={styles.label}>TEMPLATE</label>
                <div style={styles.templateGrid}>
                  {Object.entries(TEMPLATE_CONFIG).map(([key, config]) => (
                    <div key={key} onClick={() => setSelectedTemplate(key)} style={{ ...styles.templateCard, border: selectedTemplate === key ? '2px solid var(--accent-color)' : '1px solid var(--border-color)', background: selectedTemplate === key ? 'var(--accent-light)' : 'var(--bg-tertiary)' }}>
                      <div style={styles.templateCardHeader}><span style={styles.templateName}>{config.name}</span><span style={styles.templatePrice}>KES {config.price}</span></div>
                      <p style={styles.templateDesc}>{config.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Basic Fields */}
              <div style={styles.formGroup}><label style={styles.label}>PRODUCT NAME</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Premium Ankara Dress" required className="dashboard-input" /></div>
              
              {categories.length > 0 && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>CATEGORY</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="dashboard-input dashboard-select">
                    <option value="">-- No Category --</option>
                    {categories.map((cat, idx) => <option key={idx} value={cat.name}>{cat.emoji} {cat.name}</option>)}
                  </select>
                </div>
              )}

              <div style={styles.formGroup}><label style={styles.label}>DESCRIPTION</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Beautiful handcrafted dress..." rows="3" className="dashboard-input" /></div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}><label style={styles.label}>PRICE (KES)</label><input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="2500" required className="dashboard-input" /></div>
                <div style={styles.formGroup}><label style={styles.label}>STOCK</label><input type="number" value={formData.stockQuantity} onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })} placeholder="1000" className="dashboard-input" /></div>
              </div>

              <div style={styles.formGroup}><label style={styles.label}>MAIN IMAGE URL</label><input type="url" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="https://example.com/image.jpg" className="dashboard-input" /></div>

              {/* Gallery */}
              <div style={styles.imagesSection}>
                <label style={styles.label}>GALLERY IMAGES (Up to 6)</label>
                <div style={styles.galleryGrid}>
                  {formData.galleryImages.map((img, idx) => (
                    <input key={idx} type="url" value={img} onChange={(e) => { const newImgs = [...formData.galleryImages]; newImgs[idx] = e.target.value; setFormData({ ...formData, galleryImages: newImgs }); }} placeholder={`Image ${idx + 1}`} className="dashboard-input" />
                  ))}
                </div>
              </div>

              {/* Story Media */}
              <div style={styles.storySection}>
                <label style={styles.label}>STORY MEDIA (Instagram-style circles)</label>
                <input type="text" value={formData.storyTitle} onChange={(e) => setFormData({ ...formData, storyTitle: e.target.value })} placeholder="See it in Action" className="dashboard-input" style={{ marginBottom: '12px' }} />
                <div style={styles.storyGrid}>
                  {formData.storyMedia.map((story, idx) => (
                    <div key={idx} style={styles.storyInput}>
                      <input type="url" value={story.url} onChange={(e) => { const newStories = [...formData.storyMedia]; newStories[idx] = { ...newStories[idx], url: e.target.value }; setFormData({ ...formData, storyMedia: newStories }); }} placeholder={`Story ${idx + 1} URL`} className="dashboard-input" />
                      <select value={story.type} onChange={(e) => { const newStories = [...formData.storyMedia]; newStories[idx] = { ...newStories[idx], type: e.target.value }; setFormData({ ...formData, storyMedia: newStories }); }} className="dashboard-input dashboard-select" style={{ marginTop: '4px' }}>
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Testimonials */}
              <div style={styles.testimonialsSection}>
                <label style={styles.label}>TESTIMONIALS</label>
                {formData.testimonials.map((testimonial, idx) => (
                  <div key={idx} style={styles.testimonialCard}>
                    <div style={styles.formRow}>
                      <input type="text" value={testimonial.name} onChange={(e) => { const newTest = [...formData.testimonials]; newTest[idx] = { ...newTest[idx], name: e.target.value }; setFormData({ ...formData, testimonials: newTest }); }} placeholder="Name" className="dashboard-input" />
                      <input type="text" value={testimonial.role} onChange={(e) => { const newTest = [...formData.testimonials]; newTest[idx] = { ...newTest[idx], role: e.target.value }; setFormData({ ...formData, testimonials: newTest }); }} placeholder="Role (optional)" className="dashboard-input" />
                    </div>
                    <textarea value={testimonial.quote} onChange={(e) => { const newTest = [...formData.testimonials]; newTest[idx] = { ...newTest[idx], quote: e.target.value }; setFormData({ ...formData, testimonials: newTest }); }} placeholder="Their testimonial..." rows="2" className="dashboard-input" style={{ marginTop: '8px' }} />
                  </div>
                ))}
                <button type="button" onClick={() => setFormData({ ...formData, testimonials: [...formData.testimonials, { name: '', role: '', quote: '', avatar: '' }] })} style={styles.addBtn}>+ Add Testimonial</button>
              </div>

              <div style={styles.formActions}>
                <button type="button" onClick={resetForm} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingProduct ? 'Update' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {products.length === 0 ? (
        <div style={styles.empty} className="glass-card">
          <div style={styles.emptyIcon}>📦</div>
          <h3 style={styles.emptyTitle}>No products yet</h3>
          <p style={styles.emptyDesc}>Click "Add Product" to create your first product</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {products.map((product) => (
            <div key={product.id} style={styles.card} className="glass-card">
              <div style={styles.productImage}>
                {product.image_url ? <img src={product.image_url} alt={product.name} style={styles.image} /> : <div style={styles.placeholder}>📸</div>}
                <div style={{ ...styles.badge, background: product.is_active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: product.is_active ? '#22c55e' : '#ef4444' }}>
                  {product.is_active ? '● Live' : '● Draft'}
                </div>
                {product.template_type && <div style={styles.templateBadge}>{TEMPLATE_CONFIG[product.template_type]?.name?.split(' ')[0] || 'Quick'}</div>}
              </div>
              <div style={styles.cardContent}>
                <h3 style={styles.productName}>{product.name}</h3>
                <p style={styles.productDesc}>{product.description || 'No description'}</p>
                <div style={styles.productFooter}>
                  <div>
                    <p style={styles.price}>KES {parseInt(product.price).toLocaleString()}</p>
                    <p style={styles.stock}>Stock: {product.stock_quantity}</p>
                  </div>
                  <div style={styles.actions}>
                    <button onClick={() => toggleActive(product)} style={{ ...styles.iconBtn, background: product.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: product.is_active ? '#22c55e' : '#ef4444' }} title={product.is_active ? 'Hide' : 'Show'}>
                      {product.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    {storeUrl && <button onClick={() => viewProduct(product.id)} style={styles.iconBtn} title="View"><ExternalLink size={16} /></button>}
                    <button onClick={() => handleEdit(product)} style={styles.iconBtn} title="Edit"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(product.id)} style={styles.deleteBtn} title="Delete"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--text-muted)' },
  spinner: { width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' },
  
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' },
  title: { fontSize: '34px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)', letterSpacing: '-0.025em' },
  subtitle: { fontSize: '15px', color: 'var(--text-muted)' },
  headerActions: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' },
  categoryBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  viewCollectionsBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--accent-light)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--accent-color)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '32px' },
  categoryModal: { width: '100%', maxWidth: '500px', padding: '32px' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  modalTitle: { fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' },
  closeBtn: { background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' },
  
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  label: { fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  hint: { fontSize: '12px', color: 'var(--text-muted)' },
  
  templateSelector: { padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '12px' },
  templateGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', marginTop: '10px' },
  templateCard: { padding: '12px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' },
  templateCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  templateName: { fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' },
  templatePrice: { fontSize: '11px', fontWeight: '600', color: 'var(--accent-color)' },
  templateDesc: { fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' },
  
  imagesSection: { display: 'flex', flexDirection: 'column', gap: '10px' },
  galleryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' },
  storySection: { display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', background: 'var(--accent-light)', borderRadius: '12px' },
  storyGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' },
  storyInput: { display: 'flex', flexDirection: 'column' },
  testimonialsSection: { display: 'flex', flexDirection: 'column', gap: '12px' },
  testimonialCard: { padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '10px' },
  addBtn: { padding: '10px', background: 'var(--bg-tertiary)', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer' },
  
  formActions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' },
  cancelBtn: { padding: '12px 24px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer' },
  
  categoryTag: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--accent-light)', border: '1px solid var(--border-color)', borderRadius: '20px', color: 'var(--text-secondary)', fontSize: '13px' },
  categoryRemoveBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px', fontWeight: '700', padding: '0 4px' },
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
  card: { overflow: 'hidden', borderRadius: '14px' },
  productImage: { position: 'relative', height: '180px', background: 'var(--bg-tertiary)' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' },
  badge: { position: 'absolute', top: '10px', right: '10px', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' },
  templateBadge: { position: 'absolute', top: '10px', left: '10px', padding: '4px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: '700', background: 'var(--accent-color)', color: 'white' },
  cardContent: { padding: '14px 16px' },
  productName: { fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  productDesc: { fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: '1.5', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' },
  productFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
  price: { fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '2px' },
  stock: { fontSize: '11px', color: 'var(--text-muted)' },
  actions: { display: 'flex', gap: '6px' },
  iconBtn: { padding: '7px', borderRadius: '7px', background: 'var(--icon-btn-bg)', border: '1px solid var(--icon-btn-border)', color: 'var(--icon-btn-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { padding: '7px', borderRadius: '7px', background: 'var(--delete-btn-bg)', border: '1px solid var(--delete-btn-border)', color: 'var(--delete-btn-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  
  empty: { textAlign: 'center', padding: '80px 20px' },
  emptyIcon: { fontSize: '64px', marginBottom: '16px' },
  emptyTitle: { fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' },
  emptyDesc: { fontSize: '14px', color: 'var(--text-muted)' },
};
