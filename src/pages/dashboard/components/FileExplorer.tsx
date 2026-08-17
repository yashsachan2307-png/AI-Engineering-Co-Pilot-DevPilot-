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
          className={`flex items-center cursor-pointer select-none transition-colors duration-100 ${isSelected ? 'bg-[var(--color-bg)] text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text-primary)]'}`}
          style={{
            padding: `4px 8px 4px ${8 + depth * 12}px`,
            fontSize: '12px',
          }}
        >
          {node.isDirectory ? (
            <>
              {isExpanded ? <ChevronDown size={14} className="mr-1 opacity-70" /> : <ChevronRight size={14} className="mr-1 opacity-70" />}
              <Folder size={14} className="mr-1.5 text-accent opacity-80" />
            </>
          ) : (
            <>
              <span style={{ width: '18px', display: 'inline-block' }}></span>
              <File size={14} className="mr-1.5 opacity-60" />
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
    <div style={{ padding: '8px 0', overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {files.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '12px' }}>
          No files found
        </div>
      ) : (
        renderNode(root)
      )}
    </div>
  );
}
