import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { v4 as uuidv4 } from 'uuid';

export default function CustomerPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = () => {
    api.get('customers/')
      .then(res => {
        const sorted = res.data.sort((a, b) => a.name.localeCompare(b.name));
        setCustomers(sorted);
      })
      .catch(err => console.error(err));
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return alert('Enter a name');

    const rfid = uuidv4();
    try {
      const { data } = await api.post('customers/', { name, rfid });
      setCustomers(prev => {
        const updated = [...prev, data].sort((a, b) => a.name.localeCompare(b.name));
        return updated;
      });
      setNewName('');
    } catch (err) {
      console.error(err);
      alert('Failed to add customer: ' + JSON.stringify(err.response?.data || err));
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await api.delete(`customers/${id}/`);
      setCustomers(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete customer: ' + JSON.stringify(err.response?.data || err));
    }
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button onClick={() => navigate('/home')} style={styles.backButton}>
          ← Back to Dashboard
        </button>
        <h2 style={styles.title}>Customers</h2>

        <input
          type="text"
          placeholder="Search by name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={styles.searchInput}
        />

        <form onSubmit={handleAddCustomer} style={styles.addForm}>
          <input
            type="text"
            placeholder="New customer name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            style={styles.addInput}
          />
          <button type="submit" style={styles.addButton}>
            + Add
          </button>
        </form>

        <ul style={styles.list}>
          {filtered.map(c => (
            <li key={c.id} style={styles.listItem}>
              <div style={styles.customerRow}>
                <Link to={`/customers/${c.id}`} style={styles.link}>
                  {c.name}
                </Link>
                <button
                  onClick={() => handleDeleteCustomer(c.id)}
                  style={styles.deleteButton}
                >
                  🗑 Delete
                </button>
              </div>
            </li>
          ))}
          {filtered.length === 0 && <li style={styles.noData}>No customers found.</li>}
        </ul>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(to right, #667eea, #764ba2)',
    fontFamily: 'Arial, sans-serif',
    padding: '2rem',
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '600px',
    padding: '2rem',
    boxSizing: 'border-box',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    fontSize: '1rem',
    cursor: 'pointer',
    marginBottom: '1rem',
    textDecoration: 'underline',
  },
  title: {
    margin: '0 0 1rem',
    color: '#333',
  },
  searchInput: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    marginBottom: '1rem',
    outline: 'none',
  },
  addForm: {
    display: 'flex',
    marginBottom: '1.5rem',
    gap: '0.5rem',
  },
  addInput: {
    flex: 1,
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    outline: 'none',
  },
  addButton: {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#48bb78',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  listItem: {
    margin: '0.5rem 0',
  },
  customerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #eee',
    paddingBottom: '0.5rem',
  },
  link: {
    textDecoration: 'none',
    color: '#667eea',
    fontSize: '1rem',
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#e53e3e',
    color: '#fff',
    border: 'none',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  noData: {
    color: '#777',
    fontStyle: 'italic',
  },
};
