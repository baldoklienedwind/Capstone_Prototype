import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({
    id: null,
    name: '',
    description: '',
    srp: '',
    supplier_price: '',
    stock: '',
    category: '',
    supplier: ''
  });
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  const fetchProducts = () => {
    api.get('products/')
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  };

  const fetchSuppliers = () => {
    api.get('suppliers/')
      .then(res => setSuppliers(res.data))
      .catch(err => console.error(err));
  };

  const handleFilterChange = e => setFilter(e.target.value);
  const filteredProducts = filter
    ? products.filter(p => p.category === filter)
    : products;

  const handleFormChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = product => {
    setForm({
      id:       product.id,
      name:     product.name,
      description: product.description,
      srp:      product.srp,
      supplier_price: product.supplier_price,
      stock:    product.stock,
      category: product.category,
      supplier: product.supplier
    });
  };

  const handleDelete = id => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    api.delete(`products/${id}/`)
      .then(fetchProducts)
      .catch(() => alert('Delete failed'));
  };

  const handleSubmit = e => {
    e.preventDefault();

    const payload = {
      name:            form.name,
      description:     form.description,
      srp:             parseFloat(form.srp),
      supplier_price:  parseFloat(form.supplier_price),
      stock:           parseInt(form.stock, 10),
      category:        form.category,
      supplier:        parseInt(form.supplier, 10),
    };

    const method = form.id ? api.put : api.post;
    const url = form.id ? `products/${form.id}/` : 'products/';

    method(url, payload)
      .then(() => {
        fetchProducts();
        setForm({
          id: null,
          name: '',
          description: '',
          srp: '',
          supplier_price: '',
          stock: '',
          category: '',
          supplier: ''
        });
      })
      .catch(err => {
        const data = err.response?.data;
        alert('Error: ' + JSON.stringify(data || err));
      });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <Link to="/home" style={styles.backButton}>← Back to Dashboard</Link>
        <h2 style={styles.title}>Product Management</h2>

        <div style={styles.filterContainer}>
          <label style={styles.label}>Filter by Category:</label>
          <select value={filter} onChange={handleFilterChange} style={styles.select}>
            <option value="">All</option>
            <option value="accessory">Accessories</option>
            <option value="part">Parts</option>
            <option value="oil">Oils</option>
            <option value="cleaner">Cleaners</option>
          </select>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <h3 style={styles.formTitle}>{form.id ? 'Edit' : 'Add'} Product</h3>
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleFormChange}
            style={styles.input}
            required
          />
          <input
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleFormChange}
            style={styles.input}
          />
          <input
            name="srp"
            type="number"
            placeholder="Selling Price"
            value={form.srp}
            onChange={handleFormChange}
            style={styles.input}
            required
          />
          <input
            name="supplier_price"
            type="number"
            placeholder="Supplier Price"
            value={form.supplier_price}
            onChange={handleFormChange}
            style={styles.input}
            required
          />
          <input
            name="stock"
            type="number"
            placeholder="Stock"
            value={form.stock}
            onChange={handleFormChange}
            style={styles.input}
            required
          />
          <select
            name="category"
            value={form.category}
            onChange={handleFormChange}
            style={styles.select}
            required
          >
            <option value="">Select Category</option>
            <option value="accessory">Accessories</option>
            <option value="part">Parts</option>
            <option value="oil">Oils</option>
            <option value="cleaner">Cleaners</option>
          </select>
          <select
            name="supplier"
            value={form.supplier}
            onChange={handleFormChange}
            style={styles.select}
            required
          >
            <option value="">Select Supplier</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <button type="submit" style={styles.submitButton}>
            {form.id ? 'Update' : 'Add'} Product
          </button>
        </form>

        <table style={styles.table}>
          <thead>
            <tr>
              {['Name','SRP','Supplier Price','Stock','Category','Supplier','Actions'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? filteredProducts.map(p => (
              <tr key={p.id}>
                <td style={styles.td}>{p.name}</td>
                <td style={styles.td}>₱{p.srp}</td>
                <td style={styles.td}>₱{p.supplier_price}</td>
                <td style={styles.td}>{p.stock}</td>
                <td style={styles.td}>{p.category}</td>
                <td style={styles.td}>{p.supplier_name}</td>
                <td style={styles.td}>
                  <button onClick={() => handleEdit(p)} style={styles.actionButton}>Edit</button>
                  <button onClick={() => handleDelete(p.id)} style={{...styles.actionButton, marginLeft:'0.5rem', background:'#e53e3e'}}>
                    Delete
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" style={styles.td}>No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: { display:'flex', minHeight:'100vh', alignItems:'center', justifyContent:'center', background:'linear-gradient(to right,#667eea,#764ba2)', fontFamily:'Arial,sans-serif', padding:'2rem' },
  card: { background:'#fff', borderRadius:'12px', boxShadow:'0 8px 20px rgba(0,0,0,0.1)', width:'100%', maxWidth:'800px', padding:'2rem', boxSizing:'border-box' },
  backButton: { textDecoration:'none', color:'#667eea', fontWeight:'bold', marginBottom:'1rem', display:'inline-block' },
  title: { marginTop:0, color:'#333' },
  filterContainer: { marginBottom:'1rem', display:'flex', gap:'1rem', alignItems:'center' },
  label: { fontWeight:'bold' },
  select: { padding:'0.5rem', borderRadius:'8px', border:'1px solid #ccc', outline:'none' },
  form: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'2rem' },
  formTitle: { gridColumn:'1 / -1', margin:0, color:'#333' },
  input: { padding:'0.5rem', borderRadius:'8px', border:'1px solid #ccc', outline:'none' },
  submitButton: { gridColumn:'1 / -1', padding:'0.75rem', borderRadius:'8px', border:'none', backgroundColor:'#667eea', color:'#fff', fontWeight:'bold', cursor:'pointer' },
  table: { width:'100%', borderCollapse:'collapse' },
  th: { borderBottom:'2px solid #ccc', textAlign:'left', padding:'0.5rem', color:'#333' },
  td: { borderBottom:'1px solid #eee', padding:'0.5rem' },
  actionButton: { padding:'0.25rem 0.5rem', border:'none', borderRadius:'6px', background:'#667eea', color:'#fff', cursor:'pointer' }
};

export default ProductList;