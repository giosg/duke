import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Overview from './Overview';
import Rules from './Rules';
import Cart from './Cart';
import LoadMask from './LoadMask';
import { usePortService } from '../hooks/usePortService';
import { usePersistentState } from '../hooks/usePersistentState';

// Component to handle persistent routing
const AppContent = ({ portService }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [lastActiveTab, setLastActiveTab, isTabLoaded] = usePersistentState('lastActiveTab', '/overview');

  // Save current tab when location changes
  useEffect(() => {
    if (location.pathname !== lastActiveTab) {
      setLastActiveTab(location.pathname);
    }
  }, [location.pathname, lastActiveTab, setLastActiveTab]);

  // Navigate to last active tab on mount
  useEffect(() => {
    if (isTabLoaded && lastActiveTab && location.pathname === '/') {
      navigate(lastActiveTab, { replace: true });
    }
  }, [isTabLoaded, lastActiveTab, location.pathname, navigate]);

  return (
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
          <Route path="/" element={<Navigate to={lastActiveTab || "/overview"} replace />} />
          <Route path="/overview" element={<Overview portService={portService} />} />
          <Route path="/rules" element={<Rules portService={portService} />} />
          <Route path="/cart" element={<Cart portService={portService} />} />
        </Routes>
      </div>

      {/* Loading mask */}
      <LoadMask />
    </div>
  );
};

const App = () => {
  const portService = usePortService();

  return (
    <Router>
      <AppContent portService={portService} />
    </Router>
  );
};

export default App;
