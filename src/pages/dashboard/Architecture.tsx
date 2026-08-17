import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ArchitectureAnalysis, GraphNode as ApiNode, getArchitecture, explainArchitecture } from '../../services/architectureService';
import { ReactFlow, Controls, Background, Node, Edge, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
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
          background: n.type === 'CLASS' ? '#1e293b' : (n.type === 'INTERFACE' ? '#0f172a' : '#334155'),
          color: '#f8fafc',
          border: '1px solid #334155',
          borderRadius: '4px',
          padding: '8px',
          fontSize: '11px',
          fontFamily: 'monospace',
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
        style: { stroke: '#475569' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#475569'
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
    <div className="flex flex-col gap-4 h-full bg-bg overflow-hidden">
      <div className="panel border-b-0 border-l-0 border-r-0 rounded-none flex justify-between items-center px-4 py-3 shrink-0 bg-surface">
        <div>
          <h1 className="text-sm font-semibold text-primary flex items-center gap-2 m-0">
            <Network size={16} className="text-accent" />
            Architecture & Dependencies
          </h1>
          <p className="text-xs text-secondary mt-1 m-0">
            Deterministic graph visualization and AI architectural analysis.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-surface-hover border border-border rounded-sm">
          <FolderGit2 size={14} className="text-muted" />
          <select
            value={selectedRepoId || ''}
            onChange={(e) => setSelectedRepoId(Number(e.target.value))}
            className="select text-xs py-0.5 border-none bg-transparent pl-0 focus:ring-0 w-48"
          >
            {repositories.length === 0 && <option value="">No repositories imported</option>}
            {repositories.map(r => (
              <option key={r.id} value={r.id} className="bg-surface text-primary">
                {r.fullName || r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-4 flex-1 overflow-hidden min-h-0">
        {/* Left: Graph */}
        <div className="panel flex-1 flex flex-col min-w-0 border-l-0 border-r border-t border-b-0 rounded-none relative bg-[#0f172a]">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-bg/80 backdrop-blur-sm">
                <RefreshCw className="animate-spin text-accent" size={32} />
                <p className="text-sm font-semibold text-primary">Analyzing Architecture...</p>
              </div>
            ) : (
              <ReactFlow 
                nodes={nodes} 
                edges={edges}
                onNodeClick={onNodeClick}
                fitView
              >
                <Background color="#334155" gap={16} />
                <Controls className="bg-surface border-border fill-primary" />
              </ReactFlow>
            )}
        </div>

        {/* Right: Sidebar */}
        <div className="w-80 flex flex-col gap-4 overflow-y-auto pr-4 pb-4">
          {analysis && analysis.circularDependencies && analysis.circularDependencies.length > 0 && (
             <div className="panel border-l-4 border-warning/70">
               <div className="px-3 py-2.5 border-b border-border bg-warning/5 flex items-center gap-2">
                 <AlertTriangle size={14} className="text-warning" />
                 <h3 className="text-sm font-semibold text-warning m-0">Circular Dependencies</h3>
               </div>
               <div className="p-3 bg-surface">
                 <ul className="text-xs text-secondary pl-5 m-0 space-y-1.5 leading-relaxed font-mono">
                   {analysis.circularDependencies.map((c, i) => <li key={i}>{c}</li>)}
                 </ul>
               </div>
             </div>
          )}

          <div className="panel flex-1 flex flex-col">
            <div className="px-3 py-2.5 border-b border-border bg-surface-hover flex items-center gap-2 shrink-0">
              <Info size={14} className="text-accent" />
              <h3 className="text-sm font-semibold text-primary m-0">Module Details</h3>
            </div>
            <div className="p-4 bg-surface flex-1 overflow-y-auto">
              {!selectedNode ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted">
                  <Network size={32} className="opacity-30 mb-3" />
                  <p className="text-xs">Click a node in the graph to view details and ask the AI questions.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-sm font-mono font-semibold text-primary break-all m-0">{selectedNode.name}</h3>
                    <div className="inline-block mt-2 px-1.5 py-0.5 bg-surface-hover text-secondary rounded text-[10px] tracking-wider uppercase border border-border">
                      {selectedNode.type}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-semibold text-secondary uppercase tracking-wider mb-2">Coupling Metrics</h4>
                    <ul className="text-xs text-secondary pl-4 m-0 space-y-1.5">
                      {selectedNode.metrics?.map((m, i) => <li key={i}>{m}</li>)}
                    </ul>
                  </div>

                  <div className="mt-2 pt-4 border-t border-border">
                    <h4 className="text-xs font-semibold text-primary flex items-center gap-2 mb-3">
                      <MessageSquare size={14} className="text-accent" />
                      Ask AI about this module
                    </h4>
                    <textarea 
                      value={explainQuestion}
                      onChange={(e) => setExplainQuestion(e.target.value)}
                      placeholder="e.g., Why does this module have high coupling?"
                      className="input text-xs w-full resize-none mb-3"
                      rows={3}
                    />
                    <Button 
                      className="btn-primary w-full justify-center text-xs py-1.5"
                      onClick={handleExplain} 
                      disabled={!explainQuestion || isExplaining}
                    >
                      {isExplaining ? <><RefreshCw size={12} className="animate-spin mr-2" /> Analyzing...</> : 'Ask AI'}
                    </Button>

                    {explanation && (
                      <div className="mt-4 p-3 bg-surface-hover border-l-2 border-accent text-xs text-secondary leading-relaxed">
                        <strong className="text-primary block mb-1 font-semibold">AI Analysis:</strong>
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
