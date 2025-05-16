import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';  
import { v4 as uuidv4 } from 'uuid';

export default function Sell() {
  const [products, setProducts]           = useState([]);
  const [searchTerm, setSearchTerm]       = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [selected, setSelected]           = useState([]);
  const [useLoyalty, setUseLoyalty]       = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customer, setCustomer]           = useState(null);
  const [loyaltyEarned, setLoyaltyEarned] = useState(0);
  const [historyByCustomer, setHistoryByCustomer] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    api.get('products/').then(r => setProducts(r.data)).catch(console.error);
  }, []);

  const addItem    = prod => setSelected(s => s.some(x=>x.product.id===prod.id) ? s : [...s, {product:prod,quantity:1}]);
  const updateQty  = (id,qty) => setSelected(s=>s.map(x=>x.product.id===id ? {...x,quantity:Math.max(1,qty)} : x));
  const removeItem = id => setSelected(s=>s.filter(x=>x.product.id!==id));

  const lookupCustomer = async () => {
    try {
      const { data } = await api.get(`customers/?name=${encodeURIComponent(customerSearch)}`);
      if (!data.length) return alert('No customer found');
      const id   = data[0].id;
      const cust = (await api.get(`customers/${id}/`)).data;
      setCustomer(cust);
      fetchHistory(id);
    } catch (e) {
      console.error(e);
      alert('Customer lookup failed');
    }
  };

  const fetchHistory = async custId => {
    try {
      const { data } = await api.get(`sales/?customer=${custId}`);
      setHistoryByCustomer(h => ({ ...h, [custId]: data }));
    } catch (e) {
      console.error('History fetch failed', e);
    }
  };

  const submitSale = async () => {
    if (useLoyalty && !customer) return alert('Select a customer first');
    if (!selected.length) return alert('Cart is empty');
  
    try {
      let oldPoints = 0;
      if (useLoyalty) {
        oldPoints = customer.loyalty_points;
      }
  
      await Promise.all(selected.map(item =>
        api.post('sales/', {
          ...(useLoyalty && { customer: customer.id }),
          product: item.product.id,
          quantity: item.quantity,
          total_price: item.product.srp * item.quantity
        })
      ));
  
      let earned = 0;
      if (useLoyalty) {
        const fresh = (await api.get(`customers/${customer.id}/`)).data;
        setCustomer(fresh);
  
        earned = fresh.loyalty_points - oldPoints;
        setLoyaltyEarned(earned);
  
        fetchHistory(fresh.id);
      } else {
        setLoyaltyEarned(0); 
      }
  
      setSelected([]); 
  
      alert(`Sale complete!${useLoyalty ? ` Earned ${earned} point${earned !== 1 ? 's' : ''}.` : ''}`);
    } catch (e) {
      console.error(e);
      alert('Sale failed: ' + JSON.stringify(e.response?.data || e));
    }
  };  

  const visible = products
    .filter(p => (!filterCategory || p.category === filterCategory))
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button onClick={()=>navigate('/home')} style={styles.backButton}>← Back</button>
        <h1 style={styles.title}>In-Store Sale</h1>

        <div style={styles.filterBar}>
          <input
            placeholder="Search…"
            value={searchTerm}
            onChange={e=>setSearchTerm(e.target.value)}
            style={styles.input}
          />
          <select
            value={filterCategory}
            onChange={e=>setFilterCategory(e.target.value)}
            style={styles.select}
          >
            <option value="">All Categories</option>
            <option value="accessory">Accessory</option>
            <option value="part">Part</option>
            <option value="oil">Oil</option>
            <option value="cleaner">Cleaner</option>
          </select>
        </div>

        <div style={styles.productGrid}>
          {visible.map(p=>(
            <div key={p.id} style={styles.productCard}>
              <strong>{p.name}</strong>
              <p>₱{p.srp}</p>
              <button onClick={()=>addItem(p)} style={styles.addButton}>Add</button>
            </div>
          ))}
        </div>

        {selected.length > 0 && (
          <div style={styles.orderSection}>
            <h2 style={styles.subTitle}>Order</h2>
            {selected.map(s=>(
              <div key={s.product.id} style={styles.orderItem}>
                {s.product.name}
                <input
                  type="number"
                  min="1"
                  value={s.quantity}
                  onChange={e=>updateQty(s.product.id,+e.target.value)}
                  style={styles.qtyInput}
                />
                × ₱{s.product.srp} = ₱{(s.product.srp*s.quantity).toFixed(2)}
                <button onClick={()=>removeItem(s.product.id)} style={styles.removeButton}>×</button>
              </div>
            ))}
          </div>
        )}

        <div style={styles.customerSection}>
          <label>
            <input
              type="checkbox"
              checked={useLoyalty}
              onChange={e=>setUseLoyalty(e.target.checked)}
              style={{ marginRight: 8 }}
            />
            Apply Loyalty?
          </label>

          {useLoyalty && (
            <>
              <h2 style={styles.subTitle}>Customer</h2>
              <div style={styles.customerRow}>
                <input
                  placeholder="Customer Name"
                  value={customerSearch}
                  onChange={e=>setCustomerSearch(e.target.value)}
                  style={styles.input}
                />
                <button onClick={lookupCustomer} style={styles.lookupButton}>Lookup</button>
              </div>
              {customer && (
                <p style={styles.customerInfo}>
                  {customer.name} (Pts: {customer.loyalty_points})
                </p>
              )}
            </>
          )}
        </div>

        {selected.length>0 && (
          <button onClick={submitSale} style={styles.completeButton}>
            Complete Sale
          </button>
        )}
        {useLoyalty && loyaltyEarned>0 && (
          <p style={styles.loyaltyNote}>
            +{loyaltyEarned} point{loyaltyEarned!==1?'s':''}
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { display:'flex',minHeight:'100vh',alignItems:'center',justifyContent:'center',background:'linear-gradient(to right,#667eea,#764ba2)',padding:'2rem' },
  card: { background:'#fff',borderRadius:12,boxShadow:'0 8px 20px rgba(0,0,0,0.1)',width:'100%',maxWidth:800,padding:24,display:'flex',flexDirection:'column',gap:24 },
  backButton:{ background:'none',border:'none',color:'#667eea',cursor:'pointer',alignSelf:'flex-start' },
  title:{margin:0,color:'#333'},
  filterBar:{display:'flex',gap:16},
  input:{flex:1,padding:12,borderRadius:8,border:'1px solid #ccc'},
  select:{padding:12,borderRadius:8,border:'1px solid #ccc'},
  productGrid:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))',gap:16},
  productCard:{background:'#f9f9f9',padding:16,borderRadius:8,boxShadow:'0 2px 8px rgba(0,0,0,0.05)',display:'flex',flexDirection:'column',alignItems:'center'},
  addButton:{marginTop:8,padding:'6px 12px',border:'none',borderRadius:4,background:'#667eea',color:'#fff',cursor:'pointer'},
  orderSection:{background:'#f1f1f1',padding:16,borderRadius:8},
  subTitle:{margin:'0 0 12px'},
  orderItem:{display:'flex',alignItems:'center',gap:12,marginBottom:8},
  qtyInput:{width:50,padding:6,borderRadius:4,border:'1px solid #ccc'},
  removeButton:{border:'none',background:'transparent',color:'red',cursor:'pointer',fontSize:18},
  customerSection:{background:'#f9f9f9',padding:16,borderRadius:8,display:'flex',flexDirection:'column',gap:12},
  customerRow:{display:'flex',gap:8,marginTop:8},
  lookupButton:{padding:'6px 12px',border:'none',borderRadius:4,background:'#4caf50',color:'#fff',cursor:'pointer'},
  customerInfo:{fontWeight:'bold',marginTop:8},
  completeButton:{padding:'12px',background:'#667eea',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:'bold',fontSize:16,marginTop:16},
  loyaltyNote:{color:'green',fontWeight:'bold',marginTop:8}
};