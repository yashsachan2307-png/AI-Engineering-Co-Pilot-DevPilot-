import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ArchitectureAnalysis, GraphNode as ApiNode, getArchitecture, explainArchitecture } from '../../services/architectureService';
import { ReactFlow, Controls, Background, Node, Edge, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Network, FolderGit2, Info, MessageSquare, AlertTriangle, RefreshCw } from 'lucide-react';

interface Repo {
  id: number;
  name: string;
  fullName: string;
}

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 172;
  const nodeHeight = 36;

  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = direction === 'TB' ? 'top' : 'left' as any;
    node.sourcePosition = direction === 'TB' ? 'bottom' : 'right' as any;

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
  });

  return { nodes, edges };
};

export function Architecture() {
  const { token } = useAuth();
  const [repositories, setRepositories] = useState<Repo[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ArchitectureAnalysis | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  
  const [selectedNode, setSelectedNode] = useState<ApiNode | null>(null);
  const [explainQuestion, setExplainQuestion] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const res = await fetch('/api/repositories', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setRepositories(data);
          if (data.length > 0 && !selectedRepoId) setSelectedRepoId(data[0].id);
        }
      } catch (e) {
        console.error('Failed to load repositories', e);
      }
    };
    fetchRepositories();
  }, [token, selectedRepoId]);

  const loadArchitecture = useCallback(async () => {
    if (!selectedRepoId) return;
    
    setLoading(true);
    setAnalysis(null);
    setSelectedNode(null);
    setExplanation('');
    
    try {
      const data = await getArchitecture(selectedRepoId);
      setAnalysis(data);
      
      const rfNodes: Node[] = data.nodes.map(n => ({
        id: n.id,
        position: { x: 0, y: 0 },
        data: { label: n.name },
        style: {
          background: n.type === 'CLASS' ? '#bfdbfe' : (n.type === 'INTERFACE' ? '#bbf7d0' : '#fef08a'),
          border: '1px solid #94a3b8',
          borderRadius: '4px',
          padding: '8px',
          fontSize: '12px',
          fontWeight: 600
        }
      }));
      
      const rfEdges: Edge[] = data.edges.map(e => ({
        id: `${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        type: 'smoothstep',
        animated: false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        }
      }));
      
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(rfNodes, rfEdges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      
    } catch (e) {
      console.error('Failed to load architecture', e);
    } finally {
      setLoading(false);
    }
  }, [selectedRepoId]);

  useEffect(() => {
    if (selectedRepoId) {
      loadArchitecture();
    }
  }, [selectedRepoId, loadArchitecture]);

  const onNodeClick = (event: any, node: Node) => {
    if (!analysis) return;
    const apiNode = analysis.nodes.find(n => n.id === node.id);
    if (apiNode) {
      setSelectedNode(apiNode);
      setExplanation('');
      setExplainQuestion('');
    }
  };

  const handleExplain = async () => {
    if (!selectedRepoId || !selectedNode || !explainQuestion || !analysis) return;
    
    setIsExplaining(true);
    try {
      const res = await explainArchitecture(selectedRepoId, selectedNode.id, explainQuestion, analysis);
      setExplanation(res.explanation);
    } catch (e) {
      setExplanation('Failed to get explanation from AI.');
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem', height: 'calc(100vh - 100px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Network size={24} style={{ color: 'var(--color-accent)' }} />
            Architecture & Dependencies
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Deterministic graph visualization and AI architectural analysis.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--color-bg-secondary)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <FolderGit2 size={16} style={{ color: 'var(--color-text-secondary)' }} />
          <select
            value={selectedRepoId || ''}
            onChange={(e) => setSelectedRepoId(Number(e.target.value))}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text)',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {repositories.length === 0 && <option value="">No repositories imported</option>}
            {repositories.map(r => (
              <option key={r.id} value={r.id} style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
                {r.fullName || r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem', flex: 1, minHeight: 0 }}>
        {/* Left: Graph */}
        <Card style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <CardContent style={{ padding: 0, flex: 1, position: 'relative' }}>
            {loading ? (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', zIndex: 10 }}>
                <RefreshCw className="animate-spin" size={32} style={{ color: 'var(--color-accent)' }} />
                <p>Analyzing Architecture...</p>
              </div>
            ) : (
              <ReactFlow 
                nodes={nodes} 
                edges={edges}
                onNodeClick={onNodeClick}
                fitView
              >
                <Background />
                <Controls />
              </ReactFlow>
            )}
          </CardContent>
        </Card>

        {/* Right: Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
          {analysis && analysis.circularDependencies && analysis.circularDependencies.length > 0 && (
             <Card style={{ borderColor: 'var(--color-warning)' }}>
               <CardHeader style={{ paddingBottom: '0.5rem' }}>
                 <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: 'var(--color-warning)' }}>
                   <AlertTriangle size={16} /> Circular Dependencies
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <ul style={{ fontSize: '0.875rem', paddingLeft: '1.25rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                   {analysis.circularDependencies.map((c, i) => <li key={i}>{c}</li>)}
                 </ul>
               </CardContent>
             </Card>
          )}

          <Card style={{ flex: 1 }}>
            <CardHeader style={{ paddingBottom: '0.5rem' }}>
              <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                <Info size={16} /> Module Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedNode ? (
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  Click a node in the graph to view details and ask the AI questions.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, wordBreak: 'break-all' }}>{selectedNode.name}</h3>
                    <div style={{ display: 'inline-block', padding: '0.1rem 0.5rem', backgroundColor: 'var(--color-bg-secondary)', borderRadius: '4px', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      {selectedNode.type}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Coupling Metrics</h4>
                    <ul style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', paddingLeft: '1.25rem', margin: 0 }}>
                      {selectedNode.metrics?.map((m, i) => <li key={i}>{m}</li>)}
                    </ul>
                  </div>

                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MessageSquare size={14} /> Ask AI about this module
                    </h4>
                    <textarea 
                      value={explainQuestion}
                      onChange={(e) => setExplainQuestion(e.target.value)}
                      placeholder="e.g., Why does this module have high coupling?"
                      rows={3}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.875rem', marginBottom: '0.5rem' }}
                    />
                    <Button 
                      variant="accent" 
                      onClick={handleExplain} 
                      disabled={!explainQuestion || isExplaining}
                      style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                    >
                      {isExplaining ? 'Analyzing...' : 'Ask AI'}
                    </Button>

                    {explanation && (
                      <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--color-bg-secondary)', borderRadius: '4px', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                        <strong>AI Analysis:</strong><br />
                        {explanation}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
