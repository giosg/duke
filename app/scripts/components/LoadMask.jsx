import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const LoadMask = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Show loading mask during navigation
    setIsVisible(true);
    
    // Hide after a short delay to simulate loading
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [location]);

  if (!isVisible) return null;

  return (
    <div className="load-mask">
      <img src="./images/duke.png" alt="Duke" />
      <div className="load-mask-inner">
        <i className="fa fa-fw fa-spinner fa-spin"></i>
      </div>
    </div>
  );
};

export default LoadMask;
