import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import HomePage from './pages/HomePage';
import VerifyCertificate from './pages/VerifyCertificate';
import VerificationResult from './pages/VerificationResult';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import CertificatesManagement from './pages/admin/CertificatesManagement';
import BlockchainRecords from './pages/admin/BlockchainRecords';
import ReportsAnalytics from './pages/admin/ReportsAnalytics';
import UsersManagement from './pages/admin/UsersManagement';
import Notifications from './pages/admin/Notifications';
import Settings from './pages/admin/Settings';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/verify" element={<VerifyCertificate />} />
          <Route path="/verify/result" element={<VerificationResult />} />
          {/* Direct verification route when opened via QR or URL with certificateId */}
          <Route path="/verify/:certificateId" element={<VerificationResult />} />
          <Route path="/verify/:id" element={<VerificationResult />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<AdminLogin />} />
        </Route>

        {/* Admin routes (protected by real JWT authentication) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/certificates" element={<CertificatesManagement />} />
            <Route path="/admin/users" element={<UsersManagement />} />
            <Route path="/admin/blockchain" element={<BlockchainRecords />} />
            <Route path="/admin/reports" element={<ReportsAnalytics />} />
            <Route path="/admin/notifications" element={<Notifications />} />
            <Route path="/admin/settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
