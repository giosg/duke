import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Overview from './Overview';
import Rules from './Rules';
import Cart from './Cart';
import LoadMask from './LoadMask';

const App = () => {
  return (
    <Router>
      <div>
        {/* Navigation */}
        <ul className="nav nav-tabs">
          <li>
            <NavLink 
              to="/overview" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <i className="fa fa-fw fa-eye"></i> Overview
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/rules" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <i className="fa fa-fw fa-cogs"></i> Rules
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/cart" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <i className="fa fa-fw fa-shopping-cart"></i> Cart
            </NavLink>
          </li>
        </ul>

        {/* Main content */}
        <div className="tab-content">
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </div>

        {/* Loading mask */}
        <LoadMask />
      </div>
    </Router>
  );
};

export default App;
