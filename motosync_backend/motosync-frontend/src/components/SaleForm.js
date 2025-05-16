import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';
import api from '../services/api';

function SaleForm() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [formData, setFormData] = useState({ product: '', quantity: 1, total_price: '', rfid: '' });

  useEffect(() => {
    api.get('products/')
      .then(res => setProducts(res.data))
      .catch(console.error);
    api.get('sales/')
      .then(res => setSales(res.data))
      .catch(console.error);
  }, []);

  const now = new Date();
  const daysAgo = days => { const d = new Date(); d.setDate(now.getDate() - days); return d; };
  const inRange = (dateStr, since) => new Date(dateStr) >= since;
  const summary = periodDays => {
    const list = sales.filter(s => inRange(s.date, daysAgo(periodDays)));
    const revenue = list.reduce((sum, s) => sum + parseFloat(s.total_price), 0);
    return { count: list.length, revenue: revenue.toFixed(2) };
  };
  const week = summary(7), month = summary(30), year = summary(365);

  const chartData = [];
  for (let i = 30; i >= 0; i--) {
    const date = daysAgo(i);
    const dateStr = date.toISOString().slice(0,10);
    const daySales = sales.filter(s => s.date.slice(0,10) === dateStr);
    const dayRev = daySales.reduce((sum, s) => sum + parseFloat(s.total_price), 0);
    chartData.push({ date: dateStr, revenue: dayRev });
  }

  const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleProductChange = e => {
    const sel = products.find(p => p.id === +e.target.value);
    setFormData(prev => ({ ...prev, product: sel?.id||'', total_price: sel ? (sel.srp*prev.quantity).toFixed(2) : '' }));
  };
  const handleQuantityChange = e => {
    const qty = +e.target.value;
    const sel = products.find(p => p.id === +formData.product);
    setFormData(prev => ({ ...prev, quantity: qty, total_price: sel ? (sel.srp*qty).toFixed(2) : '' }));
  };
  const handleSubmit = e => {
    e.preventDefault();
    api.post('sales/', formData)
      .then(res => {
        setSales(prev => [...prev, res.data]);
        setFormData({ product: '', quantity: 1, total_price: '', rfid: '' });
      })
      .catch(err => alert('Error: '+JSON.stringify(err.response?.data||err)));
  };

  return (
    <div style={styles.container}>
      <Link to="/home" style={styles.backBtn}>← Back to Dashboard</Link>
      <h2 style={styles.heading}>Sales Summary</h2>
      <div style={styles.summaryContainer}>
        <div style={styles.summaryCard}><strong>This Week</strong><p>{week.count} sales<br/>₱{week.revenue}</p></div>
        <div style={styles.summaryCard}><strong>This Month</strong><p>{month.count} sales<br/>₱{month.revenue}</p></div>
        <div style={styles.summaryCard}><strong>This Year</strong><p>{year.count} sales<br/>₱{year.revenue}</p></div>
      </div>

      <h3 style={styles.subHeading}>Revenue (Last 30 Days)</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h3 style={styles.subHeading}>All Sales History</h3>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead><tr><th>Date</th><th>Product</th><th>Qty</th><th>Total (₱)</th></tr></thead>
          <tbody>
            {sales.map(s => (
              <tr key={s.id}>
                <td>{new Date(s.date).toLocaleDateString()}</td>
                <td>{s.product_name||s.product}</td>
                <td>{s.quantity}</td>
                <td>{parseFloat(s.total_price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 900, margin: '2rem auto', padding: '1rem', fontFamily: 'Arial, sans-serif' },
  backBtn: { textDecoration: 'none', display: 'inline-block', marginBottom: '1rem', color: '#3b82f6' },
  heading: { fontSize: '1.75rem', marginBottom: '1rem' },
  summaryContainer: { display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' },
  summaryCard: { flex: 1, background: '#eef2ff', padding: '1rem', borderRadius: '8px', textAlign: 'center' },
  subHeading: { fontSize: '1.25rem', margin: '1.5rem 0 0.75rem' },
  tableContainer: { maxHeight: 200, overflowY: 'auto', marginBottom: '2rem' },
  table: { width: '100%', borderCollapse: 'collapse' },
  form: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem', alignItems: 'center' },
  select: { padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' },
  input: { padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' },
  inputReadOnly: { padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc', background: '#f3f4f6' },
  submitBtn: { gridColumn: 'span 4', padding: '0.75rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};

export default SaleForm;