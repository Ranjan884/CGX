import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  Node, 
  Edge, 
  MarkerType,
  useNodesState,
  useEdgesState
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ServiceNode } from '../components/ServiceNode';
import { dependencyApi } from '../api/dependencyApi';
import { blastRadiusApi } from '../api/blastRadiusApi';
import { servicesApi } from '../api/servicesApi';
import { GraphResponse, BlastRadiusResult, BankingService } from '../types';
import { 
  Network, 
  ShieldAlert, 
  ArrowRight, 
  Layers, 
  Activity, 
  Radio, 
  CheckCircle2,
  ListOrdered,
  Play
} from 'lucide-react';

const nodeTypes = {
  serviceNode: ServiceNode
};

export const DependencyGraphPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [graphData, setGraphData] = useState<GraphResponse | null>(null);
  const [services, setServices] = useState<BankingService[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number>(
    (location.state as any)?.selectedServiceId || (location.state as any)?.serviceId || 5 // Default: Payment Service
  );

  const [blastRadius, setBlastRadius] = useState<BlastRadiusResult | null>(null);
  const [traversalMode, setTraversalMode] = useState<'NONE' | 'BFS' | 'DFS'>('NONE');
  const [traversalResult, setTraversalResult] = useState<any>(null);

  const loadGraph = async () => {
    setLoading(true);
    setError(null);
    try {
      const [gData, svcData] = await Promise.all([
        dependencyApi.getGraph(),
        servicesApi.getServices()
      ]);
      setGraphData(gData);
      setServices(svcData);
    } catch (err: any) {
      setError(err?.message || 'Failed to load microservice dependency graph from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGraph();
  }, []);

  useEffect(() => {
    if (!selectedServiceId) return;

    let isMounted = true;
    blastRadiusApi.getBlastRadiusForService(selectedServiceId)
      .then((res) => {
        if (isMounted) setBlastRadius(res);
      })
      .catch((err) => console.error('Failed to load blast radius for graph node:', err));

    return () => {
      isMounted = false;
    };
  }, [selectedServiceId]);

  const handleRunTraversal = async (mode: 'BFS' | 'DFS') => {
    if (traversalMode === mode) {
      setTraversalMode('NONE');
      setTraversalResult(null);
      return;
    }

    try {
      let resultData;
      if (mode === 'BFS') {
        resultData = await dependencyApi.runBFS(selectedServiceId);
      } else {
        resultData = await dependencyApi.runDFS(selectedServiceId);
      }
      setTraversalMode(mode);
      setTraversalResult(resultData);
    } catch (err) {
      console.error(`Error running ${mode}:`, err);
    }
  };

  // Fixed coordinates for clean banking topology display
  const initialPositions: Record<string, { x: number; y: number }> = {
    '1': { x: 40, y: 180 },     // Customer App
    '2': { x: 300, y: 180 },    // API Gateway
    '3': { x: 580, y: 40 },     // Authentication Service
    '4': { x: 580, y: 180 },    // Account Service
    '5': { x: 580, y: 320 },    // Payment Service
    '6': { x: 860, y: 220 },    // Fraud Detection
    '9': { x: 860, y: 380 },    // Notification Service
    '7': { x: 1140, y: 180 },   // Core Banking Service
    '8': { x: 1440, y: 180 },   // Transaction Database
    '10': { x: 1140, y: 360 },  // Reconciliation Service
    '11': { x: 1440, y: 360 }   // Reporting Service
  };

  const nodes: Node[] = useMemo(() => {
    if (!graphData) return [];

    const affectedSet = new Set(
      blastRadius?.allAffectedServices || blastRadius?.affectedServices || []
    );

    return graphData.nodes.map((node) => {
      const nodeIdStr = String(node.id);
      const pos = initialPositions[nodeIdStr] || {
        x: (parseInt(nodeIdStr, 10) * 120) % 800,
        y: (parseInt(nodeIdStr, 10) * 80) % 500
      };

      const isSource = String(node.id) === String(selectedServiceId);
      const isAffected = affectedSet.has(node.name);

      return {
        id: String(node.id),
        type: 'serviceNode',
        position: pos,
        data: {
          id: Number(node.id),
          name: node.name,
          type: node.type,
          criticality: node.criticality,
          version: node.version,
          status: node.status,
          isSource,
          isAffected
        }
      };
    });
  }, [graphData, selectedServiceId, blastRadius]);

  const edges: Edge[] = useMemo(() => {
    if (!graphData) return [];

    const affectedNames = new Set(
      blastRadius?.allAffectedServices || blastRadius?.affectedServices || []
    );

    return graphData.edges.map((edge) => {
      const sourceNode = graphData.nodes.find((n) => String(n.id) === String(edge.source));
      const targetNode = graphData.nodes.find((n) => String(n.id) === String(edge.target));

      const isSourceEdge = String(edge.source) === String(selectedServiceId);
      const isCascading =
        (isSourceEdge || (sourceNode && affectedNames.has(sourceNode.name))) &&
        targetNode &&
        affectedNames.has(targetNode.name);

      const isTraversalActive = traversalMode !== 'NONE' && isCascading;

      return {
        id: `e-${edge.source}-${edge.target}`,
        source: String(edge.source),
        target: String(edge.target),
        animated: Boolean(isCascading || isTraversalActive),
        label: edge.type || 'REST_API',
        style: {
          stroke: isCascading ? '#EF4444' : isSourceEdge ? '#5B7CFA' : '#384050',
          strokeWidth: isCascading ? 2.5 : 1.5
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isCascading ? '#EF4444' : isSourceEdge ? '#5B7CFA' : '#384050'
        }
      };
    });
  }, [graphData, selectedServiceId, blastRadius, traversalMode]);

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(nodes);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(edges);

  useEffect(() => {
    setRfNodes(nodes);
    setRfEdges(edges);
  }, [nodes, edges, setRfNodes, setRfEdges]);

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedServiceId(Number(node.id));
    setTraversalMode('NONE');
    setTraversalResult(null);
  }, []);

  const selectedService = services.find((s) => s.id === selectedServiceId);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#263148] border-t-[#4F7CFF] animate-spin" />
        <span className="text-xs text-[#94A3B8] font-mono">
          Loading microservice topology graph from Spring Boot...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Traversal Actions Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#263148] pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#F5F7FA]">
            Microservice Dependency Graph
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1 font-sans">
            Directed dependency topology loaded from Spring Boot (Phase 3). Evaluates downstream failure propagation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* BFS Impact Button */}
          <button
            onClick={() => handleRunTraversal('BFS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 font-mono cursor-pointer ${
              traversalMode === 'BFS'
                ? 'bg-[#4F7CFF] text-white border-[#4F7CFF]'
                : 'bg-[#121927] text-[#94A3B8] border-[#263148] hover:bg-[#161F30] hover:text-[#F5F7FA]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>BFS Impact Traversal</span>
          </button>

          {/* DFS Impact Button */}
          <button
            onClick={() => handleRunTraversal('DFS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 font-mono cursor-pointer ${
              traversalMode === 'DFS'
                ? 'bg-[#4F7CFF] text-white border-[#4F7CFF]'
                : 'bg-[#121927] text-[#94A3B8] border-[#263148] hover:bg-[#161F30] hover:text-[#F5F7FA]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>DFS Deep Path</span>
          </button>

          <button
            onClick={() => navigate('/blast-radius', { state: { serviceId: selectedServiceId } })}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#4F7CFF] hover:bg-[#3D68E0] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Dedicated Blast Radius</span>
          </button>
        </div>
      </div>

      {/* Main Canvas + Side Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Canvas (Span 3) */}
        <div className="lg:col-span-3 h-[640px] bg-[#0B0F17] rounded-xl border border-[#263148] overflow-hidden relative shadow-2xl">
          <ReactFlow
            nodes={rfNodes}
            edges={rfEdges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
            minZoom={0.2}
            maxZoom={1.5}
          >
            <Background gap={20} size={1} color="#263148" />
            <Controls className="!bg-[#121927] !border-[#263148] !rounded-lg !shadow-lg" />
            <MiniMap
              className="!bg-[#121927]/90 !border-[#263148] !rounded-lg"
              nodeColor={(n) => {
                if (n.data?.isSource) return '#4F7CFF';
                if (n.data?.isAffected) return '#EF4444';
                return '#263148';
              }}
            />
          </ReactFlow>

          {/* Quick instructions floating badge */}
          <div className="absolute top-4 left-4 bg-[#121927]/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[#263148] text-[11px] text-[#CBD5E1] font-mono shadow-xs">
            Tip: Click any service node to inspect downstream cascading blast perimeter
          </div>
        </div>

        {/* Interactive Side Panel */}
        <div className="bg-[#121927] border border-[#263148] rounded-xl p-5 space-y-5">
          {selectedService ? (
            <>
              {/* Selected Node Header */}
              <div className="border-b border-[#263148] pb-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-[#F5F7FA] text-base">
                    {selectedService.name}
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                    selectedService.criticality === 'CRITICAL' ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30' :
                    selectedService.criticality === 'HIGH' ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30' :
                    'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30'
                  }`}>
                    {selectedService.criticality}
                  </span>
                </div>
                <div className="text-xs text-[#94A3B8] font-mono mt-0.5">
                  ID: #{selectedService.id} · Type: {selectedService.type} · v{selectedService.version}
                </div>
              </div>

              {/* Blast Radius Score & Cascades */}
              {blastRadius && (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-[#171F30] border border-[#263148]">
                    <div className="text-[11px] text-[#94A3B8] font-mono uppercase">Blast Radius Score</div>
                    <div className="text-2xl font-bold font-mono text-[#F5F7FA] mt-0.5">
                      {(blastRadius.blastRadiusScore ?? 0).toFixed(1)} <span className="text-xs text-[#94A3B8] font-normal">/ 100</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between items-center py-1 border-b border-[#263148]">
                      <span className="text-[#94A3B8]">Direct Dependencies:</span>
                      <span className="font-semibold text-[#F5F7FA]">
                        {blastRadius.directlyAffectedServices?.length || 0}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-[#263148]">
                      <span className="text-[#94A3B8]">Indirect Dependencies:</span>
                      <span className="font-semibold text-[#F5F7FA]">
                        {blastRadius.indirectlyAffectedServices?.length || 0}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-[#263148]">
                      <span className="text-[#94A3B8]">Critical Tier Affected:</span>
                      <span className="font-semibold text-[#EF4444]">
                        {blastRadius.criticalServicesAffected || 0}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-[#263148]">
                      <span className="text-[#94A3B8]">Maximum Graph Depth:</span>
                      <span className="font-semibold text-[#F5F7FA]">
                        {blastRadius.maxDependencyDepth || 0} Hops
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Traversal Result Visualizer */}
              {traversalMode !== 'NONE' && traversalResult && (
                <div className="p-3 bg-[#171F30] rounded-lg border border-[#4F7CFF]/30 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-[#4F7CFF]">
                    <span className="font-bold flex items-center gap-1.5">
                      <ListOrdered className="w-3.5 h-3.5" />
                      {traversalMode} Execution Path
                    </span>
                    <span>{traversalResult.visitedOrder?.length || 0} Nodes</span>
                  </div>
                  <div className="p-2 bg-[#0B0F17] border border-[#263148] rounded text-[11px] text-[#CBD5E1] max-h-32 overflow-y-auto space-y-1">
                    {traversalResult.visitedOrder?.map((nodeName: string, i: number) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="text-[#94A3B8]">{i + 1}.</span>
                        <span className={i === 0 ? 'text-[#4F7CFF] font-bold' : 'text-[#F5F7FA]'}>{nodeName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Navigation CTAs */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => navigate('/risk-analysis', { state: { serviceId: selectedService.id } })}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#4F7CFF] text-white rounded-lg text-xs font-semibold hover:bg-[#3D68E0] transition-colors cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Analyze Change on this Node</span>
                </button>
                <button
                  onClick={() => navigate('/what-if', { state: { serviceId: selectedService.id } })}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#171F30] text-[#F5F7FA] border border-[#263148] rounded-lg text-xs font-semibold hover:bg-[#161F30] transition-colors font-mono cursor-pointer"
                >
                  <span>Simulate in What-If</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-xs text-[#94A3B8]">
              Select a service in the graph to view dependency metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
