import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Canvas } from './components/Canvas';
import { Toolbox } from './components/Toolbox';
import { Inspector } from './components/Inspector';
import { SimulatorPanel } from './components/SimulatorPanel';
import { Header } from './components/Header';
import { Node, Connection, DiagnosticMessage, SimulationResult } from './types';
import { analyzeBusiness } from './utils/businessLogic';
import { runSimulation, calculateConnectionMetrics } from './utils/simulator';

export default function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [diagnostics, setDiagnostics] = useState<DiagnosticMessage[]>([]);
  const [marketingBudget, setMarketingBudget] = useState(1000000);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Auto-run simulation when data changes
  useEffect(() => {
    if (nodes.length > 0) {
      runSimulationWithDelay();
    }
  }, [nodes, connections, marketingBudget]);

  // Add node to canvas
  const handleAddNode = useCallback((type: string, position: { x: number; y: number }) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type,
      position,
      data: getDefaultNodeData(type),
    };
    setNodes(prev => [...prev, newNode]);
  }, []);

  // Update node position
  const handleNodeMove = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, position } : node
    ));
  }, []);

  // Update node data
  const handleNodeDataUpdate = useCallback((nodeId: string, data: any) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
    ));
    
    // Re-run diagnostics
    setTimeout(() => runDiagnostics(), 100);
  }, [nodes]);

  // Add connection between nodes
  const handleAddConnection = useCallback((fromId: string, toId: string) => {
    // Determine connection type based on node types
    const fromNode = nodes.find(n => n.id === fromId);
    const toNode = nodes.find(n => n.id === toId);
    
    let connectionType: 'traffic' | 'money' | 'cost' | 'data' = 'traffic';
    
    if (fromNode && toNode) {
      // Use output type from node type mapping
      const nodeTypeMap: Record<string, string> = {
        'customer': 'traffic',
        'paid-ads': 'traffic',
        'seo-content': 'traffic',
        'referral': 'traffic',
        'email-campaign': 'traffic',
        'landing': 'traffic',
        'signup': 'data',
        'lead-magnet': 'data',
        'consultation': 'traffic',
        'cart': 'traffic',
        'trial': 'traffic',
        'one-time': 'money',
        'subscription': 'money',
        'commission': 'money',
        'upsell': 'money',
        'ads-revenue': 'money',
        'labor-cost': 'cost',
        'infra-cost': 'cost',
        'refund': 'cost',
        'marketing-fee': 'cost',
        'retention': 'traffic',
      };
      
      connectionType = (nodeTypeMap[fromNode.type] as any) || 'traffic';
    }
    
    const newConnection: Connection = {
      id: `conn-${Date.now()}`,
      from: fromId,
      to: toId,
      type: connectionType,
    };
    setConnections(prev => [...prev, newConnection]);
    
    // Re-run diagnostics
    setTimeout(() => runDiagnostics(), 100);
  }, [nodes]);

  // Delete node
  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setConnections(prev => prev.filter(conn => conn.from !== nodeId && conn.to !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
    setTimeout(() => runDiagnostics(), 100);
  }, [selectedNode]);

  // Delete connection
  const handleDeleteConnection = useCallback((connectionId: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
    setTimeout(() => runDiagnostics(), 100);
  }, []);

  // Run business logic diagnostics
  const runDiagnostics = useCallback(() => {
    const results = analyzeBusiness(nodes, connections);
    setDiagnostics(results);
  }, [nodes, connections]);

  // Select node
  const handleSelectNode = useCallback((node: Node | null) => {
    setSelectedNode(node);
  }, []);

  // Run simulation with metrics
  const runSimulationWithDelay = useCallback(() => {
    setIsSimulating(true);
    
    setTimeout(() => {
      const result = runSimulation(nodes, connections, marketingBudget);
      setSimulationResult(result);
      
      // Update connection metrics
      const trafficMap = new Map<string, number>();
      nodes.forEach(node => {
        // Calculate traffic for each node based on simulation
        const funnelStage = result.conversionFunnel.find(f => f.stage === node.data.name);
        if (funnelStage) {
          trafficMap.set(node.id, funnelStage.users);
        }
      });
      
      // Update connections with metrics
      const updatedConnections = connections.map(conn => {
        const fromNode = nodes.find(n => n.id === conn.from);
        const toNode = nodes.find(n => n.id === conn.to);
        if (fromNode && toNode) {
          return {
            ...conn,
            metrics: calculateConnectionMetrics(conn, fromNode, toNode, trafficMap),
          };
        }
        return conn;
      });
      
      setConnections(updatedConnections);
      
      // Run diagnostics
      const results = analyzeBusiness(nodes, connections);
      setDiagnostics(results);
      
      setIsSimulating(false);
    }, 300);
  }, [nodes, connections, marketingBudget]);

  return (
    <div className="h-screen flex flex-col bg-neutral-950">
      <Header 
        nodeCount={nodes.length}
        connectionCount={connections.length}
        onRunDiagnostics={runDiagnostics}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <Toolbox onAddNode={handleAddNode} canvasRef={canvasRef} />
        
        <Canvas
          ref={canvasRef}
          nodes={nodes}
          connections={connections}
          selectedNode={selectedNode}
          simulationResult={simulationResult}
          onNodeMove={handleNodeMove}
          onSelectNode={handleSelectNode}
          onAddConnection={handleAddConnection}
          onDeleteNode={handleDeleteNode}
          onDeleteConnection={handleDeleteConnection}
        />
        
        <Inspector
          selectedNode={selectedNode}
          onUpdateNode={handleNodeDataUpdate}
        />
      </div>
      
      <SimulatorPanel 
        diagnostics={diagnostics}
        simulationResult={simulationResult}
        marketingBudget={marketingBudget}
        onBudgetChange={setMarketingBudget}
        isSimulating={isSimulating}
      />
    </div>
  );
}

function getDefaultNodeData(type: string): any {
  const defaults: Record<string, any> = {
    customer: {
      name: '타겟 고객',
      segment: '20-30대',
      marketSize: 5000000,
      willingnessToPay: 50000,
      urgency: 3,
    },
    
    // Acquisition
    'paid-ads': {
      name: '유료 광고',
      platform: 'Facebook',
      dailyBudget: 50000,
      cpc: 500,
      ctr: 1.5,
      volatility: 'high',
    },
    'seo-content': {
      name: 'SEO/콘텐츠',
      contentCount: 10,
      costPerContent: 50000,
      monthlyTraffic: 3000,
      volatility: 'low',
    },
    'referral': {
      name: '바이럴/초대',
      kFactor: 1.2,
      rewardCost: 5000,
      conversionRate: 30.0,
    },
    'email-campaign': {
      name: '이메일 캠페인',
      listSize: 10000,
      openRate: 20.0,
      clickRate: 5.0,
      costPerSend: 0.5,
    },
    
    // Activation
    landing: {
      name: '랜딩 페이지',
      conversionRate: 15.0,
      complexity: 'low',
    },
    signup: {
      name: '회원가입',
      conversionRate: 60.0,
      complexity: 'low',
    },
    'lead-magnet': {
      name: '리드 마그넷',
      offerType: 'ebook',
      conversionRate: 25.0,
      productionCost: 100000,
    },
    consultation: {
      name: '상담/문의',
      conversionRate: 40.0,
      avgTimeMinutes: 30,
      costPerHour: 50000,
    },
    cart: {
      name: '장바구니',
      conversionRate: 30.0,
      abandonmentRate: 70.0,
    },
    trial: {
      name: '무료 체험',
      trialDays: 14,
      conversionRate: 25.0,
    },
    
    // Revenue
    'one-time': {
      name: '단건 판매',
      price: 30000,
      cogs: 10000,
      fee: 3.5,
      repurchaseRate: 20,
    },
    subscription: {
      name: '정기 구독',
      monthlyPrice: 9900,
      churnRate: 5.0,
      freeTrialDays: 14,
      cogs: 0,
    },
    commission: {
      name: '중개 수수료',
      transactionAmount: 100000,
      commissionRate: 15.0,
      volumePerUser: 2,
    },
    upsell: {
      name: '프리미엄 업셀',
      basePrice: 10000,
      upsellPrice: 30000,
      upsellRate: 15.0,
    },
    'ads-revenue': {
      name: '광고 수익',
      cpm: 5000,
      impressionsPerUser: 10,
    },
    
    // Cost
    'labor-cost': {
      name: '인건비',
      employeeCount: 3,
      avgSalary: 4000000,
    },
    'infra-cost': {
      name: '서버/툴 비용',
      fixedCost: 200000,
      costPerUser: 100,
    },
    refund: {
      name: '환불/취소',
      refundRate: 5.0,
      processingCost: 5000,
    },
    'marketing-fee': {
      name: '마케팅 수수료',
      agencyFee: 20.0,
      setupCost: 500000,
    },
    
    // Retention
    retention: {
      name: '재방문 캠페인',
      targetRate: 30.0,
      costPerUser: 3000,
      conversionRate: 10.0,
    },
  };
  
  return defaults[type] || { name: '새 블록' };
}