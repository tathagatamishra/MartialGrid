import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/Header';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Explore } from './pages/Explore';
import { ContentDetail } from './pages/ContentDetail';
import { Upload } from './pages/Upload';
import { Moderate } from './pages/Moderate';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <Header />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/content/:id" element={<ContentDetail />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/moderate" element={<Moderate />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}
