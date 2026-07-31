import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.js';
import AdminLayout from './components/AdminLayout.js';
import { AuthProvider } from './context/AuthContext.js';
import { AdminAuthProvider } from './context/AdminAuthContext.js';
import Home from './pages/Home.js';
import AvailableLots from './pages/AvailableLots.js';
import LotPassport from './pages/LotPassport.js';
import About from './pages/About.js';
import OurStory from './pages/OurStory.js';
import Contact from './pages/Contact.js';
import Privacy from './pages/Privacy.js';
import Terms from './pages/Terms.js';
import Verification from './pages/Verification.js';
import Login from './pages/Login.js';
import Profile from './pages/Profile.js';
import RfqForm from './pages/RfqForm.js';
import SampleRequestForm from './pages/SampleRequestForm.js';
import SourcingRequestForm from './pages/SourcingRequestForm.js';
import NotFound from './pages/NotFound.js';
import AdminLogin from './pages/admin/AdminLogin.js';
import AdminDashboard from './pages/admin/AdminDashboard.js';
import AdminLots from './pages/admin/AdminLots.js';
import AdminLotForm from './pages/admin/AdminLotForm.js';
import AdminBuyers from './pages/admin/AdminBuyers.js';
import AdminBuyerDetail from './pages/admin/AdminBuyerDetail.js';
import AdminRequests from './pages/admin/AdminRequests.js';
import AdminMarketIntelligence from './pages/admin/AdminMarketIntelligence.js';
import AdminAlertOutreach from './pages/admin/AdminAlertOutreach.js';

export default function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="lots" element={<AvailableLots />} />
              <Route path="lots/:lotCode" element={<LotPassport />} />
              <Route path="lots/:lotCode/request-quote" element={<RfqForm />} />
              <Route path="lots/:lotCode/request-sample" element={<SampleRequestForm />} />
              <Route path="sourcing-request" element={<SourcingRequestForm />} />
              <Route path="about" element={<About />} />
              <Route path="our-story" element={<OurStory />} />
              <Route path="contact" element={<Contact />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="terms" element={<Terms />} />
              <Route path="verification" element={<Verification />} />
              <Route path="login" element={<Login />} />
              <Route path="profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            <Route path="admin/login" element={<AdminLogin />} />
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="lots" element={<AdminLots />} />
              <Route path="lots/new" element={<AdminLotForm />} />
              <Route path="lots/:lotCode" element={<AdminLotForm />} />
              <Route path="buyers" element={<AdminBuyers />} />
              <Route path="buyers/:id" element={<AdminBuyerDetail />} />
              <Route path="requests" element={<AdminRequests />} />
              <Route path="market-intelligence" element={<AdminMarketIntelligence />} />
              <Route path="alert-outreach" element={<AdminAlertOutreach />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </AuthProvider>
  );
}
