import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Does DevPilot store my code?',
      a: 'No. If you use our cloud models, your code is processed in memory and immediately discarded. It is never used to train our models. For absolute privacy, you can run open-source models entirely locally.'
    },
    {
      q: 'Which languages and frameworks are supported?',
      a: 'DevPilot natively understands TypeScript, JavaScript, Python, Go, Rust, Java, C++, and more. We support most modern web and backend frameworks out of the box.'
    },
    {
      q: 'How is this different from GitHub Copilot?',
      a: 'While standard copilots excel at autocomplete within a single file, DevPilot builds a semantic graph of your entire repository. It understands your architecture, data flow, and how changes in one microservice affect another.'
    },
    {
      q: 'Can I integrate this with my CI/CD pipeline?',
      a: 'Yes. The Team plan includes a CLI and GitHub App that automatically reviews pull requests, runs security scans, and suggests architectural improvements before code is merged.'
    }
  ];

  return (
    <section id="faq" className="landing-section">
      <div className="landing-text-center mb-8">
        <h2 style={{ fontSize: '2.25rem', fontWeight: 600, marginBottom: '1rem' }}>Frequently Asked Questions</h2>
      </div>

      <div className="faq-list">
        {faqs.map((faq, i) => (
          <div key={i} className="faq-item">
            <div 
              className="faq-question" 
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <span>{faq.q}</span>
              {openIndex === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            {openIndex === i && (
              <div className="faq-answer">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
