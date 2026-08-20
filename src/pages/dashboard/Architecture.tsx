import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ArchitectureAnalysis, GraphNode as ApiNode, getArchitecture, explainArchitecture } from '../../services/architectureService';
import { ReactFlow, Controls, Background, Node, Edge, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { Button } from '../../components/ui/Button';
import { Network, FolderGit2, Info, MessageSquare, AlertTriangle, RefreshCw, TerminalSquare } from 'lucide-react';
import { API_BASE_URL } from '../../services/api';

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
        const res = await fetch(`${API_BASE_URL}/api/repositories`, {
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
          background: n.type === 'CLASS' ? 'var(--color-surface)' : (n.type === 'INTERFACE' ? 'var(--color-bg)' : 'var(--color-surface-hover)'),
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px',
          fontSize: '11px',
          fontFamily: 'var(--font-code)',
          fontWeight: 600,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
        }
      }));
      
      const rfEdges: Edge[] = data.edges.map(e => ({
        id: `${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        type: 'smoothstep',
        animated: false,
        style: { stroke: 'var(--color-text-muted)' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'var(--color-text-muted)'
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', backgroundColor: 'var(--color-bg)' }}>
      {/* Top Context Bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '12px 24px', 
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        flexShrink: 0 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent)', fontFamily: 'var(--font-code)', fontSize: '13px' }}>
            <TerminalSquare size={16} />
            <span>ARCHITECTURE_ANALYZER</span>
          </div>
          
          <div style={{ height: 16, width: 1, backgroundColor: 'var(--color-border)' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg)' }}>
            <FolderGit2 size={12} className="text-muted" />
            <select
              value={selectedRepoId || ''}
              onChange={(e) => setSelectedRepoId(Number(e.target.value))}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-code)',
                fontSize: '11px',
                outline: 'none',
                cursor: 'pointer',
                width: '180px',
                textOverflow: 'ellipsis'
              }}
            >
              {repositories.length === 0 && <option value="">NO_REPOSITORIES</option>}
              {repositories.map(r => (
                <option key={r.id} value={r.id} style={{ background: 'var(--color-surface)' }}>
                  {r.fullName || r.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: Graph */}
        <div style={{ flex: 1, position: 'relative', backgroundColor: 'var(--color-bg)' }}>
            {loading ? (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)' }}>
                <RefreshCw className="animate-spin text-accent" size={32} style={{ marginBottom: '16px' }} />
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-code)' }}>ANALYZING_ARCHITECTURE...</p>
              </div>
            ) : (
              <ReactFlow 
                nodes={nodes} 
                edges={edges}
                onNodeClick={onNodeClick}
                fitView
              >
                <Background color="var(--color-border)" gap={16} />
                <Controls style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} />
              </ReactFlow>
            )}
        </div>

        {/* Right: Sidebar */}
        <div style={{ width: '320px', display: 'flex', flexDirection: 'column', flexShrink: 0, backgroundColor: 'var(--color-surface)', borderLeft: '1px solid var(--color-border)' }}>
          {analysis && analysis.circularDependencies && analysis.circularDependencies.length > 0 && (
             <div style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', borderLeft: '4px solid var(--color-warning)' }}>
               <div style={{ padding: '8px 16px', backgroundColor: 'rgba(234, 179, 8, 0.05)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <AlertTriangle size={14} className="text-warning" />
                 <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-warning)', margin: 0, fontFamily: 'var(--font-code)' }}>CIRCULAR_DEPENDENCIES</h3>
               </div>
               <div style={{ padding: '12px' }}>
                 <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--color-text-secondary)', fontSize: '11px', fontFamily: 'var(--font-code)' }}>
                   {analysis.circularDependencies.map((c, i) => <li key={i} style={{ marginBottom: '4px' }}>{c}</li>)}
                 </ul>
               </div>
             </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <Info size={14} className="text-accent" />
              <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, fontFamily: 'var(--font-code)' }}>MODULE_TELEMETRY</h3>
            </div>
            <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
              {!selectedNode ? (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  <Network size={32} style={{ opacity: 0.3, marginBottom: '16px' }} />
                  <p style={{ fontSize: '12px', fontFamily: 'var(--font-code)' }}>Select a node in the graph to inspect.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '12px', fontFamily: 'var(--font-code)', fontWeight: 600, color: 'var(--color-text-primary)', wordBreak: 'break-all', margin: 0 }}>{selectedNode.name}</h3>
                    <div style={{ display: 'inline-block', marginTop: '8px', padding: '2px 6px', backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase', border: '1px solid var(--color-border)', fontFamily: 'var(--font-code)' }}>
                      {selectedNode.type}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontFamily: 'var(--font-code)' }}>COUPLING_METRICS</h4>
                    <ul style={{ margin: 0, paddingLeft: '16px', color: 'var(--color-text-secondary)', fontSize: '11px', fontFamily: 'var(--font-code)' }}>
                      {selectedNode.metrics?.map((m, i) => <li key={i} style={{ marginBottom: '4px' }}>{m}</li>)}
                    </ul>
                  </div>

                  <div style={{ marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                    <h4 style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontFamily: 'var(--font-code)' }}>
                      <MessageSquare size={14} className="text-accent" />
                      ASK_AI
                    </h4>
                    <textarea 
                      value={explainQuestion}
                      onChange={(e) => setExplainQuestion(e.target.value)}
                      placeholder="e.g. Why does this module have high coupling?"
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-text-primary)',
                        fontSize: '11px',
                        fontFamily: 'var(--font-code)',
                        padding: '10px',
                        resize: 'none',
                        outline: 'none',
                        marginBottom: '12px',
                        boxSizing: 'border-box'
                      }}
                      rows={3}
                    />
                    <Button 
                      className="btn-primary"
                      style={{ width: '100%', justifyContent: 'center', fontFamily: 'var(--font-code)', fontSize: '11px', padding: '8px' }}
                      onClick={handleExplain} 
                      disabled={!explainQuestion || isExplaining}
                    >
                      {isExplaining ? <><RefreshCw size={12} className="animate-spin mr-2" /> ANALYZING...</> : 'EXECUTE_QUERY'}
                    </Button>

                    {explanation && (
                      <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'var(--color-bg)', borderLeft: '2px solid var(--color-accent)', fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: '1.6', fontFamily: 'var(--font-code)' }}>
                        <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: '4px' }}>[AI_RESPONSE]:</strong>
                        {explanation}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
