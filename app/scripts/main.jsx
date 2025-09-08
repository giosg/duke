// Import CSS dependencies
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/fonts.css';
import '../css/font-awesome.min.css';
import '../css/popup.css';

// Import React and ReactDOM
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';

// Initialize React app
const container = document.getElementById('react-root');
const root = createRoot(container);
root.render(<App />);
