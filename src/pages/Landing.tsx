import '../styles/landing.css';
import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { Features } from '../components/landing/Features';
import { Workflow } from '../components/landing/Workflow';
import { Architecture } from '../components/landing/Architecture';
import { Security } from '../components/landing/Security';
import { Pricing } from '../components/landing/Pricing';
import { FAQ } from '../components/landing/FAQ';
import { CTA } from '../components/landing/CTA';
import { Footer } from '../components/landing/Footer';

export function Landing() {
  return (
    <div className="landing-container">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Workflow />
        <Architecture />
        <Security />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
