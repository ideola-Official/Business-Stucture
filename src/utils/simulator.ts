import { Node, Connection, SimulationResult } from '../types';

export function runSimulation(
  nodes: Node[],
  connections: Connection[],
  marketingBudget: number
): SimulationResult {
  // Find entry point (customer or channel)
  const entryNodes = nodes.filter(n => n.type === 'customer' || n.type === 'channel');
  const paymentNodes = nodes.filter(n => n.type === 'payment' || n.type === 'subscription');
  
  if (entryNodes.length === 0 || paymentNodes.length === 0) {
    return {
      totalRevenue: 0,
      totalCost: marketingBudget,
      netProfit: -marketingBudget,
      roi: -100,
      projectedUsers: 0,
      conversionFunnel: [],
    };
  }

  // Calculate initial traffic from channel
  const channelNode = nodes.find(n => n.type === 'channel');
  let initialTraffic = 1000; // Default fallback
  let dailyAdSpend = marketingBudget / 30; // Monthly budget to daily
  
  if (channelNode) {
    const { dailyBudget, cpc, ctr } = channelNode.data;
    
    if (dailyBudget && cpc) {
      // Calculate clicks from budget
      const dailyClicks = Math.floor(dailyBudget / cpc);
      
      // Apply CTR for impressions -> clicks conversion
      // But since we already have clicks, we use urgency multiplier
      const customerNode = nodes.find(n => n.type === 'customer');
      const urgencyMultiplier = customerNode ? (customerNode.data.urgency || 3) / 3 : 1;
      
      initialTraffic = Math.floor(dailyClicks * urgencyMultiplier * 30); // Monthly traffic
      dailyAdSpend = dailyBudget;
    }
  }

  // Build flow graph and calculate traffic through each node
  const trafficMap = new Map<string, number>();
  const funnel: { stage: string; users: number; dropoff: number }[] = [];
  const visitedNodes = new Set<string>();
  const nodeOrder: Node[] = [];
  
  // BFS to find path from entry to payment
  const queue = [...entryNodes];
  
  while (queue.length > 0) {
    const currentNode = queue.shift()!;
    if (visitedNodes.has(currentNode.id)) continue;
    
    visitedNodes.add(currentNode.id);
    nodeOrder.push(currentNode);
    
    // Find outgoing connections
    const outgoing = connections.filter(c => c.from === currentNode.id);
    outgoing.forEach(conn => {
      const targetNode = nodes.find(n => n.id === conn.to);
      if (targetNode && !visitedNodes.has(targetNode.id)) {
        queue.push(targetNode);
      }
    });
  }

  // Calculate traffic through each node with connection-level conversion rates
  trafficMap.set(entryNodes[0].id, initialTraffic);
  
  nodeOrder.forEach((node, index) => {
    // Get incoming connections to this node
    const incomingConnections = connections.filter(c => c.to === node.id);
    
    let nodeTraffic = 0;
    
    if (index === 0) {
      // Entry node gets initial traffic
      nodeTraffic = initialTraffic;
    } else {
      // Calculate traffic from all incoming connections
      incomingConnections.forEach(conn => {
        const sourceTraffic = trafficMap.get(conn.from) || 0;
        
        // Use connection's conversionRate if set, otherwise use node's conversionRate
        let conversionRate = 100; // Default 100%
        
        if (conn.metrics?.conversionRate !== undefined && conn.metrics.conversionRate > 0) {
          // 사용자가 설정한 연결의 전환율 사용 (스마트 엣지)
          conversionRate = conn.metrics.conversionRate;
        } else if (node.data.conversionRate) {
          // 노드 자체의 전환율 사용
          conversionRate = node.data.conversionRate;
          
          // Apply complexity penalty
          if (node.data.complexity === 'mid') {
            conversionRate *= 0.9; // -10%
          } else if (node.data.complexity === 'high') {
            conversionRate *= 0.8; // -20%
          }
        }
        
        nodeTraffic += Math.floor(sourceTraffic * (conversionRate / 100));
      });
    }
    
    // Check willingness to pay for payment nodes
    if (node.type === 'payment') {
      const customerNode = nodes.find(n => n.type === 'customer');
      if (customerNode && node.data.price > customerNode.data.willingnessToPay) {
        nodeTraffic = 0; // Price too high, no conversions
      }
    }
    
    const beforeTraffic = index > 0 
      ? incomingConnections.reduce((sum, conn) => sum + (trafficMap.get(conn.from) || 0), 0)
      : initialTraffic;
    const dropoff = beforeTraffic - nodeTraffic;
    
    trafficMap.set(node.id, nodeTraffic);
    
    funnel.push({
      stage: node.data.name || node.type,
      users: nodeTraffic,
      dropoff: dropoff,
    });
  });

  // Calculate revenue with detailed business logic
  let totalRevenue = 0;
  let totalMargin = 0;
  
  paymentNodes.forEach(paymentNode => {
    const traffic = trafficMap.get(paymentNode.id) || 0;
    
    if (paymentNode.type === 'payment') {
      const { price, cogs, fee, repurchaseRate } = paymentNode.data;
      
      // Initial purchase revenue
      const grossRevenue = traffic * price;
      const cost = traffic * cogs;
      const feeAmount = grossRevenue * (fee / 100);
      const netRevenue = grossRevenue - cost - feeAmount;
      
      totalRevenue += grossRevenue;
      totalMargin += netRevenue;
      
      // Add repurchase revenue (next month)
      if (repurchaseRate > 0) {
        const repurchasers = Math.floor(traffic * (repurchaseRate / 100));
        const repurchaseRevenue = repurchasers * price;
        const repurchaseCost = repurchasers * cogs;
        const repurchaseFee = repurchaseRevenue * (fee / 100);
        
        totalRevenue += repurchaseRevenue;
        totalMargin += (repurchaseRevenue - repurchaseCost - repurchaseFee);
      }
      
    } else if (paymentNode.type === 'subscription') {
      const { monthlyPrice, churnRate, freeTrialDays, cogs } = paymentNode.data;
      
      // Calculate average subscription lifetime
      const avgLifetimeMonths = churnRate > 0 ? (100 / churnRate) : 12;
      
      // LTV (Lifetime Value)
      const ltv = monthlyPrice * avgLifetimeMonths;
      const totalCost = cogs * avgLifetimeMonths;
      
      // Apply free trial delay
      const firstMonthRevenue = freeTrialDays > 0 ? 0 : monthlyPrice;
      
      // Calculate total revenue from all subscribers
      const subscriptionRevenue = traffic * ltv;
      const subscriptionCost = traffic * totalCost;
      
      totalRevenue += subscriptionRevenue;
      totalMargin += (subscriptionRevenue - subscriptionCost);
    }
  });

  const totalCost = dailyAdSpend * 30; // Monthly marketing cost
  const netProfit = totalMargin - totalCost;
  const roi = totalCost > 0 ? ((netProfit / totalCost) * 100) : 0;

  return {
    totalRevenue,
    totalCost,
    netProfit,
    roi,
    projectedUsers: currentTraffic,
    conversionFunnel: funnel,
  };
}

export function calculateNodeStatus(
  node: Node,
  traffic: number,
  avgConversionRate: number
): 'healthy' | 'warning' | 'critical' | 'inactive' {
  if (traffic === 0) return 'inactive';
  
  if (node.data.conversionRate !== undefined) {
    const rate = node.data.conversionRate;
    if (rate < 5) return 'critical';
    if (rate < avgConversionRate * 0.7) return 'warning';
  }
  
  return 'healthy';
}

export function calculateConnectionMetrics(
  connection: Connection,
  fromNode: Node,
  toNode: Node,
  trafficMap: Map<string, number>
): Connection['metrics'] {
  const fromTraffic = trafficMap.get(connection.from) || 0;
  const toTraffic = trafficMap.get(connection.to) || 0;
  
  const conversionRate = fromTraffic > 0 ? (toTraffic / fromTraffic) * 100 : 0;
  const dropoffRate = 100 - conversionRate;
  
  return {
    traffic: toTraffic,
    conversionRate: Math.round(conversionRate * 10) / 10,
    dropoffRate: Math.round(dropoffRate * 10) / 10,
  };
}
