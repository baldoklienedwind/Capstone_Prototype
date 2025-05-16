import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>MotoSync Dashboard</h1>
        <p style={styles.subtitle}>Select a section to manage:</p>
        <div style={styles.linkContainer}>
          <Link to="/products" style={styles.link}>📦 Products</Link>
          <Link to="/customers" style={styles.link}>👥 Customers</Link>
          <Link to="/dashboard" style={styles.link}>💰 Sales</Link>
          <Link to="/sell" style={styles.link}>🛒 Sell</Link>
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>🚪 Logout</button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(to right, #667eea, #764ba2)',
    fontFamily: 'Arial, sans-serif',
  },
  card: {
    background: '#fff',
    padding: '2.5rem',
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
    textAlign: 'center',
    width: '320px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  title: {
    margin: 0,
    color: '#333',
  },
  subtitle: {
    margin: 0,
    color: '#555',
  },
  linkContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  link: {
    fontSize: '1rem',
    textDecoration: 'none',
    color: '#667eea',
    border: '1px solid #667eea',
    padding: '0.75rem',
    borderRadius: '8px',
    transition: 'background 0.3s ease, color 0.3s ease',
  },
  logoutButton: {
    marginTop: '1rem',
    padding: '0.75rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#e53e3e',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'background 0.3s ease',
  }
};

export default HomePage;