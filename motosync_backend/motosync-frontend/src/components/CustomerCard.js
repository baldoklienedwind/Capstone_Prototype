import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function CustomerCard() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [sales, setSales] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`customers/${id}/`)
      .then(res => setCustomer(res.data))
      .catch(err => console.error(err));

    api.get(`sales/?customer=${id}`)
      .then(res => setSales(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!customer) return <p style={styles.loading}>Loading…</p>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button onClick={() => navigate('/customers')} style={styles.backButton}>
          ← Back to Customers
        </button>
        <h2 style={styles.title}>{customer.name}</h2>
        <p style={styles.points}><strong>Loyalty Points:</strong> {customer.loyalty_points}</p>

        <h3 style={styles.subTitle}>Purchase History</h3>
        {sales.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                {['Date','Product','Qty','Total (₱)'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sales.map(s => (
                <tr key={s.id}>
                  <td style={styles.td}>{new Date(s.date).toLocaleDateString()}</td>
                  <td style={styles.td}>{s.product_name || s.product}</td>
                  <td style={styles.td}>{s.quantity}</td>
                  <td style={styles.td}>{parseFloat(s.total_price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={styles.noData}>No purchases yet.</p>
        )}
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
    maxWidth: '700px',
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
  loading: {
    textAlign: 'center',
    marginTop: '2rem',
    color: '#fff'
  },
  title: {
    margin: '0 0 1rem',
    color: '#333',
  },
  points: {
    fontSize: '1rem',
    margin: '0 0 1.5rem',
    color: '#555',
  },
  subTitle: {
    margin: '0 0 1rem',
    color: '#333',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '1rem',
  },
  th: {
    borderBottom: '2px solid #ccc',
    textAlign: 'left',
    padding: '0.75rem',
    color: '#333',
  },
  td: {
    borderBottom: '1px solid #eee',
    padding: '0.75rem',
    color: '#555',
  },
  noData: {
    fontStyle: 'italic',
    color: '#777',
  }
};