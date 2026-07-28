import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.js';
import Home from './pages/Home.js';
import AvailableLots from './pages/AvailableLots.js';
import LotPassport from './pages/LotPassport.js';
import About from './pages/About.js';
import Contact from './pages/Contact.js';
import Privacy from './pages/Privacy.js';
import Terms from './pages/Terms.js';
import Verification from './pages/Verification.js';
import AdminLot from './pages/AdminLot.js';
import Login from './pages/Login.js';
import NotFound from './pages/NotFound.js';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="lots" element={<AvailableLots />} />
          <Route path="lots/:lotCode" element={<LotPassport />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="verification" element={<Verification />} />
          <Route path="login" element={<Login />} />
          <Route path="admin/lots/:lotCode" element={<AdminLot />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
