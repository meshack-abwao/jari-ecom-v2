import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Plus, Edit, Trash2, X } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ template: 'quick-decision', data: { name: '', price: '', description: '' }, media: [] });

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = () => {
    api.getProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.updateProduct(editing.id, form);
      } else {
        await api.createProduct(form);
      }
      closeModal();
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.deleteProduct(id);
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ template: p.template, data: p.data, media: p.media || [] });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm({ template: 'quick-decision', data: { name: '', price: '', description: '' }, media: [] });
  };

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div>
      <div className="jv2-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="jv2-page-title">Products</h1>
          <p className="jv2-page-subtitle">Manage your listings</p>
        </div>
        <button className="jv2-btn jv2-btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} /> Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="jv2-card" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
          <h3 style={{ marginBottom: 8 }}>No products yet</h3>
          <p style={{ color: 'var(--jv2-text-muted)', marginBottom: 20 }}>Create your first product to get started</p>
          <button className="jv2-btn jv2-btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} /> Add Product
          </button>
        </div>
      ) : (
        <div className="jv2-grid jv2-grid-3">
          {products.map((p) => (
            <div key={p.id} className="jv2-card">
              <div style={{ height: 160, background: 'var(--jv2-surface)', borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {p.media?.[0]?.url ? (
                  <img src={p.media[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                ) : (
                  <span style={{ fontSize: 48 }}>📸</span>
                )}
              </div>
              <h3 style={{ fontWeight: 700, marginBottom: 4 }}>{p.data?.name || 'Untitled'}</h3>
              <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--jv2-primary)', marginBottom: 8 }}>
                KES {Number(p.data?.price || 0).toLocaleString()}
              </p>
              <p style={{ fontSize: 12, color: 'var(--jv2-text-muted)', marginBottom: 16 }}>
                Template: {p.template}
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="jv2-btn jv2-btn-secondary" style={{ flex: 1, padding: 10 }} onClick={() => openEdit(p)}>
                  <Edit size={16} />
                </button>
                <button className="jv2-btn jv2-btn-secondary" style={{ padding: 10, color: 'var(--jv2-danger)' }} onClick={() => handleDelete(p.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={modalStyles.overlay} onClick={closeModal}>
          <div className="jv2-card" style={modalStyles.content} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800 }}>{editing ? 'Edit' : 'Add'} Product</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--jv2-text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label className="jv2-label">Template</label>
                <select
                  value={form.template}
                  onChange={(e) => setForm({ ...form, template: e.target.value })}
                  className="jv2-input"
                >
                  <option value="quick-decision">Quick Decision</option>
                  <option value="portfolio-booking">Portfolio + Booking</option>
                  <option value="visual-menu">Visual Menu</option>
                  <option value="deep-dive">Deep Dive</option>
                  <option value="catalog">Catalog</option>
                </select>
              </div>

              <div>
                <label className="jv2-label">Product Name</label>
                <input
                  type="text"
                  value={form.data.name}
                  onChange={(e) => setForm({ ...form, data: { ...form.data, name: e.target.value } })}
                  className="jv2-input"
                  placeholder="Premium Dress"
                  required
                />
              </div>

              <div>
                <label className="jv2-label">Price (KES)</label>
                <input
                  type="number"
                  value={form.data.price}
                  onChange={(e) => setForm({ ...form, data: { ...form.data, price: e.target.value } })}
                  className="jv2-input"
                  placeholder="2500"
                  required
                />
              </div>

              <div>
                <label className="jv2-label">Description</label>
                <textarea
                  value={form.data.description || ''}
                  onChange={(e) => setForm({ ...form, data: { ...form.data, description: e.target.value } })}
                  className="jv2-input"
                  rows={3}
                  placeholder="Product description..."
                />
              </div>

              <div>
                <label className="jv2-label">Image URL</label>
                <input
                  type="url"
                  value={form.media?.[0]?.url || ''}
                  onChange={(e) => setForm({ ...form, media: [{ url: e.target.value, role: 'hero' }] })}
                  className="jv2-input"
                  placeholder="https://..."
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="button" onClick={closeModal} className="jv2-btn jv2-btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="jv2-btn jv2-btn-primary" style={{ flex: 1 }}>
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const modalStyles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 20
  },
  content: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90vh',
    overflow: 'auto'
  }
};
