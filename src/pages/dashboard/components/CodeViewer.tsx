import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeViewerProps {
  fileName: string;
  language: string;
  content: string;
}

export function CodeViewer({ fileName, language, content }: CodeViewerProps) {
  // Map standard extensions/languages to syntax highlighter languages
  const getLanguage = (lang: string) => {
    const map: Record<string, string> = {
      'TypeScript': 'typescript',
      'JavaScript': 'javascript',
      'Java': 'java',
      'Python': 'python',
      'C++': 'cpp',
      'C': 'c',
      'HTML': 'html',
      'CSS': 'css',
      'JSON': 'json',
      'SQL': 'sql',
      'XML': 'xml'
    };
    return map[lang] || 'text';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#1e1e1e', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid #333', 
        backgroundColor: '#252526',
        color: '#ccc',
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center'
      }}>
        <span style={{ fontFamily: 'monospace' }}>{fileName}</span>
      </div>
      <div style={{ flex: 1, overflow: 'auto', fontSize: '14px' }}>
        <SyntaxHighlighter
          language={getLanguage(language)}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '16px',
            backgroundColor: 'transparent',
            height: '100%'
          }}
          showLineNumbers={true}
        >
          {content || '// Empty file or content not loaded'}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
