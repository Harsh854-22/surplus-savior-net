
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { loadGoogleMapsScript } from './lib/maps';

// Load Google Maps script before rendering the app
loadGoogleMapsScript()
  .then(() => {
    console.log('Google Maps loaded successfully');
    createRoot(document.getElementById("root")!).render(<App />);
  })
  .catch(error => {
    console.error('Failed to load Google Maps:', error);
    // Still render the app even if Maps fails to load
    createRoot(document.getElementById("root")!).render(<App />);
  });

