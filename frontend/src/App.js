import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/pages/HomePage';
import UniversalPage from './components/pages/UniversalPage';
import BridalGalleryPage from './components/pages/BridalGalleryPage';
import BridalSwapPage from './components/pages/BridalSwapPage';
import BulkUpload from './components/pages/BulkUpload';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/universal" element={<UniversalPage />} />
          <Route path="/bridal-gallery" element={<BridalGalleryPage />} />
          <Route path="/bridal-swap" element={<BridalSwapPage />} />
          <Route path="/bulk-upload" element={<BulkUpload />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 