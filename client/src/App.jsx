import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SkillsStrip from './components/SkillsStrip';
import Topics from './components/Topics';
import LearningPaths from './components/LearningPaths';
import HowItWorks from './components/HowItWorks';
import StatsBand from './components/StatsBand';
import Testimonials from './components/Testimonials';
import CTABanner from './components/CTABanner';
import Footer from './components/Footer';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CourseDetailPage from './pages/CourseDetailPage';

function LandingPage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero />
        <SkillsStrip />
        <Topics />
        <LearningPaths />
        <HowItWorks />
        <StatsBand />
        <Testimonials />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"                 element={<LandingPage />} />
          <Route path="/login"            element={<LoginPage />} />
          <Route path="/signup"           element={<SignupPage />} />
          <Route path="/courses/:slug"    element={<CourseDetailPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
