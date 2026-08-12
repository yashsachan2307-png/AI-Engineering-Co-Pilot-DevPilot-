import { useParams } from 'react-router-dom';

export function ProjectDetails() {
  const { id } = useParams();

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Project Details: {id}</h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>Project dashboard and repository stats will appear here.</p>
    </div>
  );
}
