import { BrainCircuit, Bug, Code2, Database, LayoutTemplate, ShieldCheck, FileJson } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: <Database size={24} />,
      title: 'Repository Intelligence',
      desc: 'Understand dependencies, data flow, and complete context across your entire monolithic or microservice architecture.'
    },
    {
      icon: <BrainCircuit size={24} />,
      title: 'AI Code Review',
      desc: 'Automated PR reviews that catch subtle logical bugs and architectural deviations before they hit production.'
    },
    {
      icon: <Bug size={24} />,
      title: 'AI Debugging',
      desc: 'Trace execution paths instantly. DevPilot isolates the root cause of runtime exceptions in seconds.'
    },
    {
      icon: <Code2 size={24} />,
      title: 'Code Generation',
      desc: 'Generate boilerplate, complex algorithms, or entire modules that strictly adhere to your existing design patterns.'
    },
    {
      icon: <ShieldCheck size={24} />,
      title: 'Security Analysis',
      desc: 'Proactive vulnerability scanning (SAST/DAST) integrated directly into your IDE and CI pipeline.'
    },
    {
      icon: <LayoutTemplate size={24} />,
      title: 'Architecture Analysis',
      desc: 'Visualize your software architecture and receive AI-driven refactoring suggestions to reduce tech debt.'
    },
    {
      icon: <FileJson size={24} />,
      title: 'Dependency Intelligence',
      desc: 'Monitor external packages for breaking changes, licensing issues, and outdated APIs automatically.'
    }
  ];

  return (
    <section id="features" className="landing-section">
      <div className="landing-text-center mb-12">
        <h2 style={{ fontSize: '2.25rem', fontWeight: 600, marginBottom: '1rem' }}>Core Capabilities</h2>
        <p className="landing-subtitle">Everything you need to ship faster and maintain a pristine codebase.</p>
      </div>

      <div className="features-grid">
        {features.map((feat, i) => (
          <div key={i} className="feature-card">
            <div className="feature-icon">
              {feat.icon}
            </div>
            <h3 className="feature-title">{feat.title}</h3>
            <p className="feature-desc">{feat.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
