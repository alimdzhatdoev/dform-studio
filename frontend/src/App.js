import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home/Home';
import Portfolio from './pages/Portfolio/Portfolio';
import PortfolioCase from './pages/Portfolio/PortfolioCase';
import Services from './pages/Services/Services';
import About from './pages/About/About';
import Order from './pages/Order/Order';
import Contacts from './pages/Contacts/Contacts';
import Admin from './pages/Admin/Admin';
import { SiteProvider } from './context/SiteContext';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <SiteProvider>
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/portfolio/:id" element={<PortfolioCase />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/order" element={<Order />} />
            <Route path="/contacts" element={<Contacts />} />
          </Route>
        </Routes>
      </SiteProvider>
    </BrowserRouter>
  );
}

export default App;
