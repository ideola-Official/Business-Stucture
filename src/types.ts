export interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: any;
  status?: 'healthy' | 'warning' | 'critical' | 'inactive';
  metrics?: {
    traffic?: number;
    conversionRate?: number;
    revenue?: number;
  };
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  type?: 'traffic' | 'money' | 'cost' | 'data'; // Color coding
  metrics?: {
    traffic: number;
    conversionRate: number;
    dropoffRate: number;
  };
}

export interface DiagnosticMessage {
  id: string;
  type: 'error' | 'warning' | 'suggestion' | 'tip';
  message: string;
  nodeId?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface NodeType {
  id: string;
  label: string;
  icon: string;
  category: 'acquisition' | 'activation' | 'revenue' | 'cost' | 'customer' | 'retention';
  color: string;
  outputType?: 'traffic' | 'money' | 'cost' | 'data';
}

export interface SimulationParams {
  marketingBudget: number;
  targetTraffic: number;
  baseConversionRate: number;
}

export interface SimulationResult {
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  roi: number;
  projectedUsers: number;
  conversionFunnel: {
    stage: string;
    users: number;
    dropoff: number;
  }[];
}