import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from '@/App';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import SetupAdmin from '@/components/SetupAdmin';
import 'react-quill/dist/quill.snow.css';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <SetupAdmin />
          <App />
        </AuthProvider>
        <Toaster />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);