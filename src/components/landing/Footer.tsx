import { Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="landing-footer">
      <div className="footer-grid">
        <div className="footer-col">
          <Link to="/" className="landing-logo" style={{ marginBottom: '1rem', display: 'flex' }}>
            <Terminal size={24} className="text-accent" style={{ color: 'var(--color-accent)' }} />
            <span>DevPilot</span>
          </Link>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '1rem' }}>
            The AI Engineering Copilot that understands your entire codebase.
          </p>
        </div>
        
        <div className="footer-col">
          <h4>Product</h4>
          <div className="footer-links">
            <a href="#features">Features</a>
            <a href="#workflow">Workflow</a>
            <a href="#pricing">Pricing</a>
            <a href="#">Security</a>
          </div>
        </div>
        
        <div className="footer-col">
          <h4>Resources</h4>
          <div className="footer-links">
            <a href="#">Documentation</a>
            <a href="#">Blog</a>
            <a href="#">Community</a>
            <a href="#faq">FAQ</a>
          </div>
        </div>
        
        <div className="footer-col">
          <h4>Company</h4>
          <div className="footer-links">
            <a href="#">About</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
            <a href="#">Privacy Policy</a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div>&copy; {new Date().getFullYear()} DevPilot Inc. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <a href="#" style={{ color: 'var(--color-text-secondary)' }}>Twitter</a>
          <a href="#" style={{ color: 'var(--color-text-secondary)' }}>GitHub</a>
          <a href="#" style={{ color: 'var(--color-text-secondary)' }}>Discord</a>
        </div>
      </div>
    </footer>
  );
}
