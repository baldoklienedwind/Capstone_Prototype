import React from 'react';
import { Routes, Route } from 'react-router-dom';

import LoginPage      from './components/LoginPage';
import HomePage       from './components/HomePage';
import SaleForm       from './components/SaleForm';
import ProductList    from './components/ProductList'; 
import CustomerPage   from './components/CustomerPage';
import CustomerCard   from './components/CustomerCard';
import Sell           from './components/Sell';

function App() {
  return (
    <Routes>
      <Route path="/"              element={<LoginPage />} />
      <Route path="/home"          element={<HomePage />} />
      <Route path="/dashboard"     element={<SaleForm />} />
      <Route path="/products"      element={<ProductList />} />  
      <Route path="/customers"     element={<CustomerPage />} />
      <Route path="/customers/:id" element={<CustomerCard />} />
      <Route path="/sell"          element={<Sell />} />
      <Route path="*"              element={<h1>404 Page Not Found</h1>} />
    </Routes>
  );
}

export default App;