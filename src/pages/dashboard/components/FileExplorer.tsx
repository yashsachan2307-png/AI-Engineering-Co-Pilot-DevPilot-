import { File, Folder, ChevronRight, ChevronDown } from 'lucide-react';
import { useState, useMemo } from 'react';

export interface RepositoryFile {
  id: number;
  path: string;
  name: string;
  extension: string;
  language: string;
  sizeBytes: number;
}

interface FileExplorerProps {
  files: RepositoryFile[];
  onFileSelect: (file: RepositoryFile) => void;
  selectedFileId?: number;
}

interface TreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  file?: RepositoryFile;
  children: { [key: string]: TreeNode };
}

export function FileExplorer({ files, onFileSelect, selectedFileId }: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['']));

  const root = useMemo(() => {
    const rootNode: TreeNode = { name: '', path: '', isDirectory: true, children: {} };

    files.forEach(file => {
      const parts = file.path.split('/');
      let current = rootNode;
      let currentPath = '';

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        const isFile = i === parts.length - 1;

        if (!current.children[part]) {
          current.children[part] = {
            name: part,
            path: currentPath,
            isDirectory: !isFile,
            file: isFile ? file : undefined,
            children: {}
          };
        }
        current = current.children[part];
      }
    });

    return rootNode;
  }, [files]);

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const renderNode = (node: TreeNode, depth: number = 0): React.ReactNode => {
    if (node.name === '') {
      return Object.values(node.children)
        .sort((a, b) => {
          if (a.isDirectory && !b.isDirectory) return -1;
          if (!a.isDirectory && b.isDirectory) return 1;
          return a.name.localeCompare(b.name);
        })
        .map(child => renderNode(child, depth));
    }

    const isExpanded = expandedFolders.has(node.path);
    const isSelected = node.file?.id === selectedFileId;

    return (
      <div key={node.path}>
        <div 
          onClick={() => {
            if (node.isDirectory) {
              toggleFolder(node.path);
            } else if (node.file) {
              onFileSelect(node.file);
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: `6px 8px 6px ${8 + depth * 16}px`,
            cursor: 'pointer',
            color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
            backgroundColor: isSelected ? 'var(--color-surface-hover)' : 'transparent',
            borderRadius: '4px',
            fontSize: '0.9rem',
            userSelect: 'none'
          }}
          onMouseEnter={e => {
            if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
          }}
          onMouseLeave={e => {
            if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {node.isDirectory ? (
            <>
              {isExpanded ? <ChevronDown size={14} style={{ marginRight: '6px' }} /> : <ChevronRight size={14} style={{ marginRight: '6px' }} />}
              <Folder size={14} style={{ marginRight: '6px', color: 'var(--color-text-secondary)' }} />
            </>
          ) : (
            <>
              <span style={{ width: '20px', display: 'inline-block' }}></span>
              <File size={14} style={{ marginRight: '6px', color: 'var(--color-text-secondary)' }} />
            </>
          )}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {node.name}
          </span>
        </div>
        {node.isDirectory && isExpanded && (
          <div>
            {Object.values(node.children)
              .sort((a, b) => {
                if (a.isDirectory && !b.isDirectory) return -1;
                if (!a.isDirectory && b.isDirectory) return 1;
                return a.name.localeCompare(b.name);
              })
              .map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '10px 0', overflowY: 'auto', height: '100%' }}>
      {files.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          No files found
        </div>
      ) : (
        renderNode(root)
      )}
    </div>
  );
}
