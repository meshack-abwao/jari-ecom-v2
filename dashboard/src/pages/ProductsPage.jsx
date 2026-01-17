import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI, settingsAPI } from '../api/client';
import { Plus, Edit, Trash2, X, Eye, EyeOff, ExternalLink, Tag, ChevronDown, ChevronUp } from 'lucide-react';

// ===========================================
// TEMPLATE DEFINITIONS
// ===========================================
const TEMPLATES = {
  'quick-decision': {
    name: 'Quick Decision',
    price: 250,
    description: 'Perfect for single products or impulse buys',
    icon: '⚡',
    fields: ['basic', 'gallery', 'stories', 'testimonials']
  },
  'portfolio-booking': {
    name: 'Portfolio + Booking',
    price: 500,
    description: 'For service providers with packages',
    icon: '📋',
    fields: ['basic', 'gallery', 'stories', 'showcase', 'packages', 'testimonials']
  },
  'visual-menu': {
    name: 'Visual Menu',
    price: 600,
    description: 'For restaurants and food businesses',
    icon: '🍽️',
    fields: ['basic', 'gallery', 'stories', 'dietary', 'testimonials']
  },
  'deep-dive': {
    name: 'Deep Dive',
    price: 800,
    description: 'For high-ticket items needing specs',
    icon: '🔍',
    fields: ['basic', 'gallery', 'stories', 'specifications', 'warranty', 'testimonials']
  },
  'event-landing': {
    name: 'Event Landing',
    price: 700,
    description: 'For events, workshops, courses',
    icon: '🎪',
    fields: ['basic', 'gallery', 'eventDetails', 'tickets', 'testimonials']
  },
};

// ===========================================
// INITIAL FORM DATA
// ===========================================
const getInitialFormData = () => ({
  // Basic (all templates)
  name: '',
  description: '',
  price: '',
  stock: 999,
  category: '',
  
  // Gallery (most templates)
  images: ['', '', '', '', '', ''],
  
  // Stories (quick-decision, portfolio, deep-dive)
  stories: [
    { url: '', type: 'image', caption: '' },
    { url: '', type: 'image', caption: '' },
    { url: '', type: 'image', caption: '' },
    { url: '', type: 'image', caption: '' },
  ],
  storyTitle: 'See it in Action',
  
  // Testimonials (all templates)
  testimonials: [{ text: '', author: '', rating: 5, image: '', role: '' }],
  
  // Packages (portfolio-booking)
  packages: [{ name: '', description: '', price: '', duration: '' }],
  bookingNote: '',
  whyChooseUs: [''],
  whatsIncluded: [''],
  galleryTitle: 'Gallery',
  
  // Dietary (visual-menu)
  dietaryTags: [],
  prepTime: '',
  calories: '',
  ingredients: '',
  allergens: '',
  
  // Specifications (deep-dive)
  specifications: [{ label: '', value: '' }],
  warranty: '',
  showcaseImages: [{ url: '', caption: '', description: '' }],
  showcaseVideo: '',
  showcaseTitle: 'Gallery',
  
  // Event (event-landing)
  eventDate: '',
  eventTime: '',
  venue: '',
  venueAddress: '',
  tickets: [{ name: '', price: '', description: '', available: 100 }],
  
  // Policies (all)
  deliveryInfo: '',
  returnPolicy: '',
  paymentInfo: '',
});

// ===========================================
// MAIN COMPONENT
// ===========================================
export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [storeUrl, setStoreUrl] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  
  // Categories feature
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryEmoji, setNewCategoryEmoji] = useState('📦');
  const [collectionTitle, setCollectionTitle] = useState('Shop All Products');
  const [collectionSubtitle, setCollectionSubtitle] = useState('');
  
  const [selectedTemplate, setSelectedTemplate] = useState(searchParams.get('template') || 'quick-decision');
  const [formData, setFormData] = useState(getInitialFormData());
  const [expandedSections, setExpandedSections] = useState({
    basic: true, gallery: false, stories: false, testimonials: false,
    packages: false, dietary: false, specifications: false, showcase: false, warranty: false, eventDetails: false, tickets: false, policies: false
  });

  useEffect(() => { loadProducts(); loadStoreInfo(); loadCategories(); }, []);

  // ===========================================
  // CATEGORIES
  // ===========================================
  const loadCategories = async () => {
    try {
      const response = await settingsAPI.getAll();
      const config = response.data?.config || {};
      setCategories(config.categories || []);
      setCollectionTitle(config.collection_title || 'Shop All Products');
      setCollectionSubtitle(config.collection_subtitle || '');
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const saveCategories = async () => {
    try {
      await settingsAPI.update({
        categories: categories,
        collection_title: collectionTitle,
        collection_subtitle: collectionSubtitle
      });
      alert('Categories saved!');
      setShowCategoryModal(false);
    } catch (error) {
      console.error('Failed to save categories:', error);
      alert('Failed to save categories');
    }
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCat = { name: newCategoryName.trim(), emoji: newCategoryEmoji };
    setCategories([...categories, newCat]);
    setNewCategoryName('');
    setNewCategoryEmoji('📦');
  };

  const removeCategory = (index) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  // ===========================================
  // DATA LOADING
  // ===========================================
  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      const prods = response.data?.products || response.data || [];
      setProducts(Array.isArray(prods) ? prods : []);
    } catch (error) { 
      console.error('Failed to load products:', error);
      setProducts([]);
    } finally { 
      setLoading(false); 
    }
  };

  const loadStoreInfo = async () => {
    try {
      const response = await settingsAPI.getAll();
      const store = response.data;
      if (store?.slug) {
        setStoreSlug(store.slug);
        const baseUrl = window.location.hostname === 'localhost' 
          ? 'http://localhost:5173' 
          : 'https://jariecommstore.netlify.app';
        setStoreUrl(`${baseUrl}?store=${store.slug}`);
      }
    } catch (error) { 
      console.error('Failed to load store info:', error); 
    }
  };

  // ===========================================
  // FORM HANDLERS
  // ===========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Build V2 JSONB structure
      const productPayload = {
        template: selectedTemplate,
        status: 'active',
        data: {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price) || 0,
          stock: parseInt(formData.stock) || 999,
          category: formData.category,
          
          // Stories title
          storyTitle: formData.storyTitle,
          
          // Testimonials (filtered)
          testimonials: formData.testimonials.filter(t => t.text?.trim() && t.author?.trim()),
          
          // Policies
          policies: {
            delivery: formData.deliveryInfo,
            returns: formData.returnPolicy,
            payment: formData.paymentInfo,
          },
          
          // Template-specific data
          ...(selectedTemplate === 'portfolio-booking' && {
            packages: formData.packages.filter(p => p.name?.trim()),
            bookingNote: formData.bookingNote,
            whyChooseUs: formData.whyChooseUs.filter(item => item?.trim()),
            whatsIncluded: formData.whatsIncluded.filter(item => item?.trim()),
            galleryTitle: formData.galleryTitle || 'Gallery',
          }),
          
          ...(selectedTemplate === 'visual-menu' && {
            dietaryTags: formData.dietaryTags.filter(t => t.trim()),
            prepTime: formData.prepTime,
            calories: formData.calories,
            ingredients: formData.ingredients,
            allergens: formData.allergens,
          }),
          
          ...(selectedTemplate === 'deep-dive' && {
            specifications: formData.specifications.filter(s => s.label?.trim()),
            warranty: formData.warranty,
            showcaseTitle: formData.showcaseTitle || 'Gallery',
          }),
          
          ...(selectedTemplate === 'event-landing' && {
            eventDate: formData.eventDate,
            eventTime: formData.eventTime,
            venue: formData.venue,
            venueAddress: formData.venueAddress,
            tickets: formData.tickets.filter(t => t.name?.trim()),
          }),
        },
        media: {
          images: formData.images.filter(url => url?.trim()),
          stories: formData.stories.filter(s => s.url?.trim()),
          ...((selectedTemplate === 'deep-dive' || selectedTemplate === 'portfolio-booking') && {
            showcaseImages: (formData.showcaseImages || []).filter(img => img.url?.trim()),
            showcaseVideo: formData.showcaseVideo || '',
          }),
        },
      };

      if (editingProduct) {
        await productsAPI.update(editingProduct.id, productPayload);
      } else {
        await productsAPI.create(productPayload);
      }
      
      resetForm();
      loadProducts();
      alert('✅ Product saved successfully!');
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product. Please try again.');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setSelectedTemplate(product.template || 'quick-decision');
    
    const data = product.data || {};
    const media = product.media || {};
    const policies = data.policies || {};
    
    setFormData({
      ...getInitialFormData(),
      // Basic
      name: data.name || '',
      description: data.description || '',
      price: data.price || '',
      stock: data.stock || 999,
      category: data.category || '',
      
      // Media
      images: [...(media.images || []), '', '', '', '', '', ''].slice(0, 6),
      stories: [...(media.stories || []), 
        { url: '', type: 'image', caption: '' },
        { url: '', type: 'image', caption: '' },
        { url: '', type: 'image', caption: '' },
        { url: '', type: 'image', caption: '' }
      ].slice(0, 4),
      storyTitle: data.storyTitle || 'See it in Action',
      
      // Testimonials
      testimonials: data.testimonials?.length > 0 
        ? data.testimonials.map(t => ({ text: t.text || '', author: t.author || '', rating: t.rating || 5, image: t.image || '', role: t.role || '' }))
        : [{ text: '', author: '', rating: 5, image: '', role: '' }],
      
      // Policies
      deliveryInfo: policies.delivery || '',
      returnPolicy: policies.returns || '',
      paymentInfo: policies.payment || '',
      
      // Template-specific
      packages: data.packages?.length > 0 
        ? data.packages 
        : [{ name: '', description: '', price: '', duration: '' }],
      bookingNote: data.bookingNote || '',
      whyChooseUs: data.whyChooseUs?.length > 0 ? data.whyChooseUs : [''],
      whatsIncluded: data.whatsIncluded?.length > 0 ? data.whatsIncluded : [''],
      galleryTitle: data.galleryTitle || 'Gallery',
      
      dietaryTags: data.dietaryTags || [],
      prepTime: data.prepTime || '',
      calories: data.calories || '',
      ingredients: data.ingredients || '',
      allergens: data.allergens || '',
      
      specifications: data.specifications?.length > 0
        ? data.specifications
        : [{ label: '', value: '' }],
      warranty: data.warranty || '',
      showcaseImages: media.showcaseImages?.length > 0
        ? media.showcaseImages
        : [{ url: '', caption: '', description: '' }],
      showcaseVideo: media.showcaseVideo || '',
      showcaseTitle: data.showcaseTitle || 'Gallery',
      
      eventDate: data.eventDate || '',
      eventTime: data.eventTime || '',
      venue: data.venue || '',
      venueAddress: data.venueAddress || '',
      tickets: data.tickets?.length > 0
        ? data.tickets
        : [{ name: '', price: '', description: '', available: 100 }],
    });
    
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productsAPI.delete(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) { 
      console.error('Delete failed:', error);
      alert('Failed to delete product.'); 
    }
  };

  const toggleStatus = async (product) => {
    const newStatus = product.status === 'active' ? 'draft' : 'active';
    try {
      await productsAPI.update(product.id, { status: newStatus });
      setProducts(products.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
    } catch (error) { 
      alert('Failed to update status.'); 
    }
  };

  const resetForm = () => {
    setFormData(getInitialFormData());
    setEditingProduct(null);
    setSelectedTemplate('quick-decision');
    setShowModal(false);
    setExpandedSections({ basic: true, gallery: false, stories: false, testimonials: false,
      packages: false, dietary: false, specifications: false, eventDetails: false, tickets: false, policies: false });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  // ===========================================
  // RENDER HELPERS
  // ===========================================
  const SectionHeader = ({ section, title, icon }) => (
    <div style={styles.sectionHeader} onClick={() => toggleSection(section)}>
      <span>{icon} {title}</span>
      {expandedSections[section] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
    </div>
  );

  const templateConfig = TEMPLATES[selectedTemplate];
  const showField = (field) => templateConfig?.fields?.includes(field);

  // ===========================================
  // LOADING STATE
  // ===========================================
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading products...</p>
      </div>
    );
  }

  // ===========================================
  // MAIN RENDER
  // ===========================================
  return (
    <div className="fade-in">
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Products</h1>
          <p style={styles.subtitle}>Manage your product catalog ({products.length} products)</p>
        </div>
        <div style={styles.headerActions}>
          <button onClick={() => setShowCategoryModal(true)} style={styles.categoryBtn}>
            <Tag size={18} /> Categories
          </button>
          {storeUrl && (
            <button onClick={() => window.open(storeUrl, '_blank')} style={styles.viewBtn}>
              <Eye size={18} /> View Store
            </button>
          )}
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={20} /> Add Product
          </button>
        </div>
      </div>

      {/* Category Management Modal */}
      {showCategoryModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCategoryModal(false)}>
          <div style={styles.categoryModal} className="glass-card" onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Manage Categories</h2>
              <button onClick={() => setShowCategoryModal(false)} style={styles.closeBtn}><X size={24} /></button>
            </div>
            
            {/* Collection Header Settings */}
            <div style={styles.formGroup}>
              <label style={styles.label}>COLLECTION TITLE</label>
              <input
                type="text"
                value={collectionTitle}
                onChange={(e) => setCollectionTitle(e.target.value)}
                placeholder="Shop All Products"
                className="dashboard-input"
              />
              <p style={styles.hint}>e.g., "Our Menu", "Browse Collection", "Shop Now"</p>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>COLLECTION SUBTITLE (Optional)</label>
              <input
                type="text"
                value={collectionSubtitle}
                onChange={(e) => setCollectionSubtitle(e.target.value)}
                placeholder="Fresh dishes made with love"
                className="dashboard-input"
              />
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '20px 0' }} />
            
            {/* Add Category */}
            <div style={styles.formGroup}>
              <label style={styles.label}>ADD NEW CATEGORY</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={newCategoryEmoji}
                  onChange={(e) => setNewCategoryEmoji(e.target.value)}
                  placeholder="🔥"
                  style={{ width: '60px', textAlign: 'center' }}
                  className="dashboard-input"
                />
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Popular"
                  style={{ flex: 1 }}
                  className="dashboard-input"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                />
                <button onClick={addCategory} className="btn btn-primary" style={{ padding: '10px 16px' }}>
                  <Plus size={18} />
                </button>
              </div>
            </div>
            
            {/* Category List */}
            <div style={styles.formGroup}>
              <label style={styles.label}>CATEGORIES ({categories.length})</label>
              {categories.length === 0 ? (
                <p style={styles.hint}>No categories yet. Add some above!</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {categories.map((cat, idx) => (
                    <div key={idx} style={styles.categoryTag}>
                      <span>{cat.emoji} {cat.name}</span>
                      <button onClick={() => removeCategory(idx)} style={styles.categoryRemoveBtn}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => setShowCategoryModal(false)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={saveCategories} className="btn btn-primary" style={{ flex: 1 }}>Save Categories</button>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={resetForm}>
          <div style={styles.modal} className="glass-card" onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <button onClick={resetForm} style={styles.closeBtn}><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              {/* Template Selector */}
              <div style={styles.templateSection}>
                <label style={styles.label}>SELECT TEMPLATE</label>
                <div style={styles.templateGrid}>
                  {Object.entries(TEMPLATES).map(([key, config]) => (
                    <div
                      key={key}
                      onClick={() => setSelectedTemplate(key)}
                      style={{
                        ...styles.templateCard,
                        border: selectedTemplate === key ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                        background: selectedTemplate === key ? 'var(--accent-light)' : 'var(--bg-tertiary)',
                      }}
                    >
                      <div style={styles.templateIcon}>{config.icon}</div>
                      <div style={styles.templateInfo}>
                        <span style={styles.templateName}>{config.name}</span>
                        <span style={styles.templatePrice}>KES {config.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p style={styles.templateDesc}>{templateConfig?.description}</p>
              </div>

              {/* BASIC INFO */}
              <div style={styles.section}>
                <SectionHeader section="basic" title="Basic Information" icon="📝" />
                {expandedSections.basic && (
                  <div style={styles.sectionContent}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>PRODUCT NAME *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => updateField('name', e.target.value)}
                        placeholder="e.g. Premium Ankara Dress"
                        required
                        className="dashboard-input"
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>DESCRIPTION</label>
                      <textarea
                        value={formData.description}
                        onChange={e => updateField('description', e.target.value)}
                        placeholder="Describe your product..."
                        rows={3}
                        className="dashboard-input"
                      />
                    </div>
                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>PRICE (KES) *</label>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={e => updateField('price', e.target.value)}
                          placeholder="2500"
                          required
                          className="dashboard-input"
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>STOCK</label>
                        <input
                          type="number"
                          value={formData.stock}
                          onChange={e => updateField('stock', e.target.value)}
                          placeholder="999"
                          className="dashboard-input"
                        />
                      </div>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>CATEGORY</label>
                      <select
                        value={formData.category}
                        onChange={e => updateField('category', e.target.value)}
                        className="dashboard-input"
                        style={styles.select}
                      >
                        <option value="">Select a category...</option>
                        {categories.map((cat, idx) => (
                          <option key={idx} value={cat.name}>{cat.emoji} {cat.name}</option>
                        ))}
                      </select>
                      {categories.length === 0 && (
                        <p style={styles.hint}>No categories yet. Click "Categories" button to add some.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* GALLERY */}
              {showField('gallery') && (
                <div style={styles.section}>
                  <SectionHeader section="gallery" title="Gallery Images" icon="🖼️" />
                  {expandedSections.gallery && (
                    <div style={styles.sectionContent}>
                      <p style={styles.hint}>Add up to 6 product images (paste URLs)</p>
                      <div style={styles.imageGrid}>
                        {formData.images.map((url, idx) => (
                          <div key={idx} style={styles.imageInput}>
                            <input
                              type="url"
                              value={url}
                              onChange={e => {
                                const newImages = [...formData.images];
                                newImages[idx] = e.target.value;
                                updateField('images', newImages);
                              }}
                              placeholder={`Image ${idx + 1} URL`}
                              className="dashboard-input"
                            />
                            {url && <img src={url} alt="" style={styles.imagePreview} />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STORIES */}
              {showField('stories') && (
                <div style={styles.section}>
                  <SectionHeader section="stories" title="Story Highlights" icon="📱" />
                  {expandedSections.stories && (
                    <div style={styles.sectionContent}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>STORY SECTION TITLE</label>
                        <input
                          type="text"
                          value={formData.storyTitle}
                          onChange={e => updateField('storyTitle', e.target.value)}
                          placeholder="See it in Action"
                          className="dashboard-input"
                        />
                      </div>
                      <p style={styles.hint}>Instagram-style story circles (up to 4)</p>
                      <div style={styles.storiesGrid}>
                        {formData.stories.map((story, idx) => (
                          <div key={idx} style={styles.storyInput}>
                            <input
                              type="url"
                              value={story.url}
                              onChange={e => {
                                const newStories = [...formData.stories];
                                newStories[idx] = { ...newStories[idx], url: e.target.value };
                                updateField('stories', newStories);
                              }}
                              placeholder={`Story ${idx + 1} URL`}
                              className="dashboard-input"
                            />
                            <select
                              value={story.type}
                              onChange={e => {
                                const newStories = [...formData.stories];
                                newStories[idx] = { ...newStories[idx], type: e.target.value };
                                updateField('stories', newStories);
                              }}
                              className="dashboard-input"
                              style={{ marginTop: '4px' }}
                            >
                              <option value="image">Image</option>
                              <option value="video">Video</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TESTIMONIALS */}
              {showField('testimonials') && (
                <div style={styles.section}>
                  <SectionHeader section="testimonials" title="Testimonials" icon="⭐" />
                  {expandedSections.testimonials && (
                    <div style={styles.sectionContent}>
                      {formData.testimonials.map((testimonial, idx) => (
                        <div key={idx} style={styles.testimonialCard}>
                          <div style={styles.formRow}>
                            <input
                              type="text"
                              value={testimonial.author}
                              onChange={e => {
                                const newT = [...formData.testimonials];
                                newT[idx] = { ...newT[idx], author: e.target.value };
                                updateField('testimonials', newT);
                              }}
                              placeholder="Customer name"
                              className="dashboard-input"
                            />
                            <input
                              type="text"
                              value={testimonial.role || ''}
                              onChange={e => {
                                const newT = [...formData.testimonials];
                                newT[idx] = { ...newT[idx], role: e.target.value };
                                updateField('testimonials', newT);
                              }}
                              placeholder="Role (e.g. Regular Customer)"
                              className="dashboard-input"
                            />
                            <select
                              value={testimonial.rating}
                              onChange={e => {
                                const newT = [...formData.testimonials];
                                newT[idx] = { ...newT[idx], rating: parseInt(e.target.value) };
                                updateField('testimonials', newT);
                              }}
                              className="dashboard-input"
                            >
                              {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                            </select>
                          </div>
                          <input
                            type="url"
                            value={testimonial.image || ''}
                            onChange={e => {
                              const newT = [...formData.testimonials];
                              newT[idx] = { ...newT[idx], image: e.target.value };
                              updateField('testimonials', newT);
                            }}
                            placeholder="Avatar image URL (optional)"
                            className="dashboard-input"
                            style={{ marginTop: '8px' }}
                          />
                          <textarea
                            value={testimonial.text}
                            onChange={e => {
                              const newT = [...formData.testimonials];
                              newT[idx] = { ...newT[idx], text: e.target.value };
                              updateField('testimonials', newT);
                            }}
                            placeholder="Their review..."
                            rows={2}
                            className="dashboard-input"
                            style={{ marginTop: '8px' }}
                          />
                          {formData.testimonials.length > 1 && (
                            <button
                              type="button"
                              onClick={() => updateField('testimonials', formData.testimonials.filter((_, i) => i !== idx))}
                              style={styles.removeBtn}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => updateField('testimonials', [...formData.testimonials, { text: '', author: '', rating: 5, image: '', role: '' }])}
                        style={styles.addBtn}
                      >
                        + Add Testimonial
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SERVICE PACKAGES (portfolio-booking) */}
              {showField('packages') && (
                <div style={styles.section}>
                  <SectionHeader section="packages" title="Service Packages" icon="📦" />
                  {expandedSections.packages && (
                    <div style={styles.sectionContent}>
                      {formData.packages.map((pkg, idx) => (
                        <div key={idx} style={styles.packageCard}>
                          <div style={styles.formRow}>
                            <input
                              type="text"
                              value={pkg.name}
                              onChange={e => {
                                const newP = [...formData.packages];
                                newP[idx] = { ...newP[idx], name: e.target.value };
                                updateField('packages', newP);
                              }}
                              placeholder="Package name"
                              className="dashboard-input"
                            />
                            <input
                              type="number"
                              value={pkg.price}
                              onChange={e => {
                                const newP = [...formData.packages];
                                newP[idx] = { ...newP[idx], price: e.target.value };
                                updateField('packages', newP);
                              }}
                              placeholder="Price (KES)"
                              className="dashboard-input"
                            />
                          </div>
                          <input
                            type="text"
                            value={pkg.duration}
                            onChange={e => {
                              const newP = [...formData.packages];
                              newP[idx] = { ...newP[idx], duration: e.target.value };
                              updateField('packages', newP);
                            }}
                            placeholder="Duration (e.g. 1 hour, 3 days)"
                            className="dashboard-input"
                            style={{ marginTop: '8px' }}
                          />
                          <textarea
                            value={pkg.description}
                            onChange={e => {
                              const newP = [...formData.packages];
                              newP[idx] = { ...newP[idx], description: e.target.value };
                              updateField('packages', newP);
                            }}
                            placeholder="What's included..."
                            rows={2}
                            className="dashboard-input"
                            style={{ marginTop: '8px' }}
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => updateField('packages', [...formData.packages, { name: '', description: '', price: '', duration: '' }])}
                        style={styles.addBtn}
                      >
                        + Add Package
                      </button>
                      <div style={{ marginTop: '16px' }}>
                        <label style={styles.label}>BOOKING NOTE</label>
                        <input
                          type="text"
                          value={formData.bookingNote}
                          onChange={e => updateField('bookingNote', e.target.value)}
                          placeholder="e.g. Booking requires 50% deposit"
                          className="dashboard-input"
                        />
                      </div>
                      
                      {/* Gallery Title */}
                      <div style={{ marginTop: '16px' }}>
                        <label style={styles.label}>GALLERY TITLE</label>
                        <input
                          type="text"
                          value={formData.galleryTitle}
                          onChange={e => updateField('galleryTitle', e.target.value)}
                          placeholder="Gallery"
                          className="dashboard-input"
                        />
                      </div>
                      
                      {/* Why Choose Us */}
                      <div style={{ marginTop: '16px' }}>
                        <label style={styles.label}>WHY CHOOSE US</label>
                        {formData.whyChooseUs.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                            <input
                              type="text"
                              value={item}
                              onChange={e => {
                                const newItems = [...formData.whyChooseUs];
                                newItems[idx] = e.target.value;
                                updateField('whyChooseUs', newItems);
                              }}
                              placeholder="e.g. 10+ years experience"
                              className="dashboard-input"
                              style={{ flex: 1 }}
                            />
                            {formData.whyChooseUs.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newItems = formData.whyChooseUs.filter((_, i) => i !== idx);
                                  updateField('whyChooseUs', newItems);
                                }}
                                style={{ ...styles.addBtn, background: '#fee', color: '#c00', padding: '8px' }}
                              >×</button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => updateField('whyChooseUs', [...formData.whyChooseUs, ''])}
                          style={{ ...styles.addBtn, marginTop: '4px' }}
                        >+ Add Reason</button>
                      </div>
                      
                      {/* What's Included */}
                      <div style={{ marginTop: '16px' }}>
                        <label style={styles.label}>WHAT'S INCLUDED</label>
                        {formData.whatsIncluded.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                            <input
                              type="text"
                              value={item}
                              onChange={e => {
                                const newItems = [...formData.whatsIncluded];
                                newItems[idx] = e.target.value;
                                updateField('whatsIncluded', newItems);
                              }}
                              placeholder="e.g. Free consultation"
                              className="dashboard-input"
                              style={{ flex: 1 }}
                            />
                            {formData.whatsIncluded.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newItems = formData.whatsIncluded.filter((_, i) => i !== idx);
                                  updateField('whatsIncluded', newItems);
                                }}
                                style={{ ...styles.addBtn, background: '#fee', color: '#c00', padding: '8px' }}
                              >×</button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => updateField('whatsIncluded', [...formData.whatsIncluded, ''])}
                          style={{ ...styles.addBtn, marginTop: '4px' }}
                        >+ Add Item</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* DIETARY INFO (visual-menu) */}
              {showField('dietary') && (
                <div style={styles.section}>
                  <SectionHeader section="dietary" title="Food Details" icon="🍽️" />
                  {expandedSections.dietary && (
                    <div style={styles.sectionContent}>
                      <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>PREP TIME</label>
                          <input
                            type="text"
                            value={formData.prepTime}
                            onChange={e => updateField('prepTime', e.target.value)}
                            placeholder="e.g. 15-20 mins"
                            className="dashboard-input"
                          />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>CALORIES</label>
                          <input
                            type="text"
                            value={formData.calories}
                            onChange={e => updateField('calories', e.target.value)}
                            placeholder="e.g. 450 kcal"
                            className="dashboard-input"
                          />
                        </div>
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>DIETARY TAGS</label>
                        <input
                          type="text"
                          value={formData.dietaryTags.join(', ')}
                          onChange={e => updateField('dietaryTags', e.target.value.split(',').map(t => t.trim()))}
                          placeholder="Vegetarian, Gluten-Free, Halal (comma separated)"
                          className="dashboard-input"
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>INGREDIENTS</label>
                        <textarea
                          value={formData.ingredients}
                          onChange={e => updateField('ingredients', e.target.value)}
                          placeholder="Fresh beef, lettuce, tomato, special sauce..."
                          rows={3}
                          className="dashboard-input"
                          style={{ resize: 'vertical' }}
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>ALLERGENS</label>
                        <input
                          type="text"
                          value={formData.allergens}
                          onChange={e => updateField('allergens', e.target.value)}
                          placeholder="e.g. Contains nuts, dairy"
                          className="dashboard-input"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SPECIFICATIONS (deep-dive) */}
              {showField('specifications') && (
                <div style={styles.section}>
                  <SectionHeader section="specifications" title="Specifications" icon="📋" />
                  {expandedSections.specifications && (
                    <div style={styles.sectionContent}>
                      {formData.specifications.map((spec, idx) => (
                        <div key={idx} style={styles.specRow}>
                          <input
                            type="text"
                            value={spec.label}
                            onChange={e => {
                              const newS = [...formData.specifications];
                              newS[idx] = { ...newS[idx], label: e.target.value };
                              updateField('specifications', newS);
                            }}
                            placeholder="Spec name (e.g. Material)"
                            className="dashboard-input"
                          />
                          <input
                            type="text"
                            value={spec.value}
                            onChange={e => {
                              const newS = [...formData.specifications];
                              newS[idx] = { ...newS[idx], value: e.target.value };
                              updateField('specifications', newS);
                            }}
                            placeholder="Value (e.g. 100% Cotton)"
                            className="dashboard-input"
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => updateField('specifications', [...formData.specifications, { label: '', value: '' }])}
                        style={styles.addBtn}
                      >
                        + Add Spec
                      </button>
                      
                      <div style={{ ...styles.formGroup, marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <label style={styles.label}>SPECS IMAGE (OPTIONAL)</label>
                        <p style={styles.hint}>Add a diagram, size chart, or detail shot</p>
                        <input
                          type="url"
                          value={formData.specsImage || ''}
                          onChange={e => updateField('specsImage', e.target.value)}
                          placeholder="https://example.com/specs-diagram.jpg"
                          className="dashboard-input"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SHOWCASE IMAGES (deep-dive, portfolio-booking) */}
              {(showField('specifications') || showField('showcase')) && (
                <div style={styles.section}>
                  <SectionHeader section="showcase" title="Showcase Gallery" icon="🖼️" />
                  {expandedSections.showcase && (
                    <div style={styles.sectionContent}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>GALLERY TITLE</label>
                        <input
                          type="text"
                          value={formData.showcaseTitle || 'Gallery'}
                          onChange={e => updateField('showcaseTitle', e.target.value)}
                          placeholder="e.g., Gallery, In Detail, See It In Action"
                          className="dashboard-input"
                        />
                        <p style={styles.hint}>Bold headline for the showcase section</p>
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>SHOWCASE VIDEO (OPTIONAL)</label>
                        <input
                          type="url"
                          value={formData.showcaseVideo || ''}
                          onChange={e => updateField('showcaseVideo', e.target.value)}
                          placeholder="https://video-url.com/product-video.mp4"
                          className="dashboard-input"
                        />
                        <p style={styles.hint}>Add a product video - it will appear first in the gallery</p>
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>SHOWCASE IMAGES</label>
                        <p style={styles.hint}>Add detail shots, lifestyle images, in-use photos - the more the better!</p>
                      </div>
                      {(formData.showcaseImages || [{ url: '', caption: '', description: '' }]).map((item, idx) => (
                        <div key={idx} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color, #333)' }}>
                          <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                            <input
                              type="url"
                              value={item.url || ''}
                              onChange={e => {
                                const newImgs = [...(formData.showcaseImages || [])];
                                newImgs[idx] = { ...newImgs[idx], url: e.target.value };
                                updateField('showcaseImages', newImgs);
                              }}
                              placeholder="https://image-url.com/detail.jpg"
                              style={{ flex: 2 }}
                              className="dashboard-input"
                            />
                            <input
                              type="text"
                              value={item.caption || ''}
                              onChange={e => {
                                const newImgs = [...(formData.showcaseImages || [])];
                                newImgs[idx] = { ...newImgs[idx], caption: e.target.value };
                                updateField('showcaseImages', newImgs);
                              }}
                              placeholder="Title (shows on image)"
                              style={{ flex: 1 }}
                              className="dashboard-input"
                            />
                          </div>
                          <textarea
                            value={item.description || ''}
                            onChange={e => {
                              const newImgs = [...(formData.showcaseImages || [])];
                              newImgs[idx] = { ...newImgs[idx], description: e.target.value };
                              updateField('showcaseImages', newImgs);
                            }}
                            placeholder="Optional description (shows when viewing full image)"
                            rows={2}
                            className="dashboard-input"
                            style={{ width: '100%', resize: 'vertical' }}
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => updateField('showcaseImages', [...(formData.showcaseImages || []), { url: '', caption: '', description: '' }])}
                        style={styles.addBtn}
                      >
                        + Add Image
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* WARRANTY (deep-dive) */}
              {showField('warranty') && (
                <div style={styles.section}>
                  <SectionHeader section="warranty" title="Warranty" icon="🛡️" />
                  {expandedSections.warranty && (
                    <div style={styles.sectionContent}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>WARRANTY INFO</label>
                        <input
                          type="text"
                          value={formData.warranty}
                          onChange={e => updateField('warranty', e.target.value)}
                          placeholder="e.g. 1 year manufacturer warranty"
                          className="dashboard-input"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* EVENT DETAILS (event-landing) */}
              {showField('eventDetails') && (
                <div style={styles.section}>
                  <SectionHeader section="eventDetails" title="Event Details" icon="📅" />
                  {expandedSections.eventDetails && (
                    <div style={styles.sectionContent}>
                      <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>EVENT DATE</label>
                          <input
                            type="date"
                            value={formData.eventDate}
                            onChange={e => updateField('eventDate', e.target.value)}
                            className="dashboard-input"
                          />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>EVENT TIME</label>
                          <input
                            type="time"
                            value={formData.eventTime}
                            onChange={e => updateField('eventTime', e.target.value)}
                            className="dashboard-input"
                          />
                        </div>
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>VENUE NAME</label>
                        <input
                          type="text"
                          value={formData.venue}
                          onChange={e => updateField('venue', e.target.value)}
                          placeholder="e.g. KICC Nairobi"
                          className="dashboard-input"
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>VENUE ADDRESS</label>
                        <input
                          type="text"
                          value={formData.venueAddress}
                          onChange={e => updateField('venueAddress', e.target.value)}
                          placeholder="Full address"
                          className="dashboard-input"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TICKETS (event-landing) */}
              {showField('tickets') && (
                <div style={styles.section}>
                  <SectionHeader section="tickets" title="Ticket Tiers" icon="🎟️" />
                  {expandedSections.tickets && (
                    <div style={styles.sectionContent}>
                      {formData.tickets.map((ticket, idx) => (
                        <div key={idx} style={styles.ticketCard}>
                          <div style={styles.formRow}>
                            <input
                              type="text"
                              value={ticket.name}
                              onChange={e => {
                                const newT = [...formData.tickets];
                                newT[idx] = { ...newT[idx], name: e.target.value };
                                updateField('tickets', newT);
                              }}
                              placeholder="Tier name (e.g. Early Bird)"
                              className="dashboard-input"
                            />
                            <input
                              type="number"
                              value={ticket.price}
                              onChange={e => {
                                const newT = [...formData.tickets];
                                newT[idx] = { ...newT[idx], price: e.target.value };
                                updateField('tickets', newT);
                              }}
                              placeholder="Price (KES)"
                              className="dashboard-input"
                            />
                          </div>
                          <div style={styles.formRow}>
                            <input
                              type="text"
                              value={ticket.description}
                              onChange={e => {
                                const newT = [...formData.tickets];
                                newT[idx] = { ...newT[idx], description: e.target.value };
                                updateField('tickets', newT);
                              }}
                              placeholder="What's included"
                              className="dashboard-input"
                            />
                            <input
                              type="number"
                              value={ticket.available}
                              onChange={e => {
                                const newT = [...formData.tickets];
                                newT[idx] = { ...newT[idx], available: parseInt(e.target.value) };
                                updateField('tickets', newT);
                              }}
                              placeholder="Available qty"
                              className="dashboard-input"
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => updateField('tickets', [...formData.tickets, { name: '', price: '', description: '', available: 100 }])}
                        style={styles.addBtn}
                      >
                        + Add Ticket Tier
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* POLICIES */}
              <div style={styles.section}>
                <SectionHeader section="policies" title="Policies (Optional)" icon="📜" />
                {expandedSections.policies && (
                  <div style={styles.sectionContent}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>DELIVERY INFO</label>
                      <textarea
                        value={formData.deliveryInfo}
                        onChange={e => updateField('deliveryInfo', e.target.value)}
                        placeholder="Delivery times, areas covered..."
                        rows={2}
                        className="dashboard-input"
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>RETURN POLICY</label>
                      <textarea
                        value={formData.returnPolicy}
                        onChange={e => updateField('returnPolicy', e.target.value)}
                        placeholder="Return conditions..."
                        rows={2}
                        className="dashboard-input"
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>PAYMENT INFO</label>
                      <textarea
                        value={formData.paymentInfo}
                        onChange={e => updateField('paymentInfo', e.target.value)}
                        placeholder="Payment methods accepted..."
                        rows={2}
                        className="dashboard-input"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div style={styles.formActions}>
                <button type="button" onClick={resetForm} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
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
          {products.map(product => {
            const data = product.data || {};
            const media = product.media || {};
            const mainImage = media.images?.[0] || null;
            const isActive = product.status === 'active';
            const templateInfo = TEMPLATES[product.template] || TEMPLATES['quick-decision'];
            
            return (
              <div key={product.id} style={styles.card} className="glass-card">
                <div style={styles.productImage}>
                  {mainImage 
                    ? <img src={mainImage} alt={data.name} style={styles.image} />
                    : <div style={styles.placeholder}>📸</div>
                  }
                  <div style={{
                    ...styles.badge,
                    background: isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: isActive ? '#22c55e' : '#ef4444',
                  }}>
                    {isActive ? '● Live' : '● Draft'}
                  </div>
                  <div style={styles.templateBadge}>{templateInfo.icon}</div>
                </div>
                <div style={styles.cardContent}>
                  <h3 style={styles.productName}>{data.name || 'Untitled'}</h3>
                  <p style={styles.productDesc}>{data.description || 'No description'}</p>
                  <div style={styles.productFooter}>
                    <div>
                      <p style={styles.price}>KES {parseInt(data.price || 0).toLocaleString()}</p>
                      <p style={styles.stock}>Stock: {data.stock || '∞'}</p>
                    </div>
                    <div style={styles.actions}>
                      <button 
                        onClick={() => toggleStatus(product)} 
                        style={{...styles.iconBtn, background: isActive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: isActive ? '#22c55e' : '#ef4444'}}
                        title={isActive ? 'Set to Draft' : 'Set to Live'}
                      >
                        {isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      {storeUrl && (
                        <button 
                          onClick={() => window.open(`${storeUrl}&product=${product.id}`, '_blank')} 
                          style={styles.iconBtn} 
                          title="View in Store"
                        >
                          <ExternalLink size={16} />
                        </button>
                      )}
                      <button onClick={() => handleEdit(product)} style={styles.iconBtn} title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} style={styles.deleteBtn} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ===========================================
// STYLES
// ===========================================
const styles = {
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--text-muted)' },
  spinner: { width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' },
  
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' },
  title: { fontSize: '34px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)', letterSpacing: '-0.025em' },
  subtitle: { fontSize: '15px', color: 'var(--text-muted)' },
  headerActions: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' },
  viewBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--accent-light)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--accent-color)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, padding: '20px', overflowY: 'auto' },
  modal: { width: '100%', maxWidth: '700px', padding: '32px', margin: '20px 0' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  modalTitle: { fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' },
  closeBtn: { background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' },
  
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  label: { fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  hint: { fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' },
  
  templateSection: { padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '12px', marginBottom: '8px' },
  templateGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px', marginTop: '10px' },
  templateCard: { padding: '12px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' },
  templateIcon: { fontSize: '24px', marginBottom: '6px' },
  templateInfo: { display: 'flex', flexDirection: 'column', gap: '2px' },
  templateName: { fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' },
  templatePrice: { fontSize: '10px', fontWeight: '600', color: 'var(--accent-color)' },
  templateDesc: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px', textAlign: 'center' },
  
  section: { border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'var(--bg-tertiary)', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' },
  sectionContent: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' },
  
  imageGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' },
  imageInput: { display: 'flex', flexDirection: 'column', gap: '4px' },
  imagePreview: { width: '100%', height: '60px', objectFit: 'cover', borderRadius: '6px' },
  
  storiesGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' },
  storyInput: { display: 'flex', flexDirection: 'column' },
  
  testimonialCard: { padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '10px', position: 'relative' },
  packageCard: { padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '10px', marginBottom: '8px' },
  ticketCard: { padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '10px', marginBottom: '8px' },
  specRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' },
  
  addBtn: { padding: '10px', background: 'var(--bg-tertiary)', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer', width: '100%' },
  removeBtn: { position: 'absolute', top: '8px', right: '8px', background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', fontSize: '11px', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' },
  
  formActions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' },
  cancelBtn: { padding: '12px 24px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer' },
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
  card: { overflow: 'hidden', borderRadius: '14px' },
  productImage: { position: 'relative', height: '180px', background: 'var(--bg-tertiary)' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' },
  badge: { position: 'absolute', top: '10px', right: '10px', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' },
  templateBadge: { position: 'absolute', top: '10px', left: '10px', width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' },
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
  
  // Category styles
  categoryBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  categoryModal: { width: '100%', maxWidth: '500px', padding: '28px' },
  categoryTag: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--accent-light)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '14px', color: 'var(--text-primary)' },
  categoryRemoveBtn: { background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer', padding: '0 4px', lineHeight: 1 },
  select: { cursor: 'pointer' },
};
