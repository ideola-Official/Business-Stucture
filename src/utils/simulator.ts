import { Node, Connection, SimulationResult, CostBreakdown, RevenueBreakdown } from '../types';

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

  // ===== 상세 매출 계산 (Revenue Breakdown) =====
  let totalRevenue = 0;
  let totalMargin = 0;
  
  const revenueBreakdown: RevenueBreakdown = {
    products: { oneTime: 0, oneTimeCustomers: 0 },
    recurring: { subscription: 0, subscriptionCustomers: 0 },
    platforms: { commission: 0, commissionCustomers: 0 },
    additional: { upsell: 0, upsellCustomers: 0, adsRevenue: 0, adsUsers: 0 },
  };
  
  paymentNodes.forEach(paymentNode => {
    const traffic = trafficMap.get(paymentNode.id) || 0;
    
    if (paymentNode.type === 'one-time') {
      const { price, cogs, fee, repurchaseRate } = paymentNode.data;
      
      // Initial purchase revenue
      const grossRevenue = traffic * price;
      const cost = traffic * cogs;
      const feeAmount = grossRevenue * (fee / 100);
      const netRevenue = grossRevenue - cost - feeAmount;
      
      totalRevenue += grossRevenue;
      totalMargin += netRevenue;
      
      revenueBreakdown.products.oneTime += grossRevenue;
      revenueBreakdown.products.oneTimeCustomers += traffic;
      
      // Add repurchase revenue (next month)
      if (repurchaseRate > 0) {
        const repurchasers = Math.floor(traffic * (repurchaseRate / 100));
        const repurchaseRevenue = repurchasers * price;
        const repurchaseCost = repurchasers * cogs;
        const repurchaseFee = repurchaseRevenue * (fee / 100);
        
        totalRevenue += repurchaseRevenue;
        totalMargin += (repurchaseRevenue - repurchaseCost - repurchaseFee);
        
        revenueBreakdown.products.oneTime += repurchaseRevenue;
      }
      
    } else if (paymentNode.type === 'subscription') {
      const { monthlyPrice, churnRate, freeTrialDays, cogs } = paymentNode.data;
      
      // Calculate average subscription lifetime
      const avgLifetimeMonths = churnRate > 0 ? (100 / churnRate) : 12;
      
      // LTV (Lifetime Value)
      const ltv = monthlyPrice * avgLifetimeMonths;
      const totalCost = cogs * avgLifetimeMonths;
      
      // Calculate total revenue from all subscribers
      const subscriptionRevenue = traffic * ltv;
      const subscriptionCost = traffic * totalCost;
      
      totalRevenue += subscriptionRevenue;
      totalMargin += (subscriptionRevenue - subscriptionCost);
      
      revenueBreakdown.recurring.subscription += subscriptionRevenue;
      revenueBreakdown.recurring.subscriptionCustomers += traffic;
      
    } else if (paymentNode.type === 'commission') {
      const { transactionAmount, commissionRate, volumePerUser } = paymentNode.data;
      
      const commissionsRevenue = traffic * transactionAmount * (commissionRate / 100) * volumePerUser;
      totalRevenue += commissionsRevenue;
      totalMargin += commissionsRevenue;
      
      revenueBreakdown.platforms.commission += commissionsRevenue;
      revenueBreakdown.platforms.commissionCustomers += traffic;
      
    } else if (paymentNode.type === 'upsell') {
      const { basePrice, upsellPrice, upsellRate } = paymentNode.data;
      
      const upsellConversions = Math.floor(traffic * (upsellRate / 100));
      const upsellRevenue = upsellConversions * (upsellPrice - basePrice);
      totalRevenue += upsellRevenue;
      totalMargin += upsellRevenue;
      
      revenueBreakdown.additional.upsell += upsellRevenue;
      revenueBreakdown.additional.upsellCustomers += upsellConversions;
      
    } else if (paymentNode.type === 'ads-revenue') {
      const { cpm, impressionsPerUser } = paymentNode.data;
      
      const adsRevenue = traffic * impressionsPerUser * (cpm / 1000);
      totalRevenue += adsRevenue;
      totalMargin += adsRevenue;
      
      revenueBreakdown.additional.adsRevenue += adsRevenue;
      revenueBreakdown.additional.adsUsers += traffic;
    }
  });

  // ===== 상세 비용 계산 (Cost Breakdown) =====
  const costBreakdown: CostBreakdown = {
    marketing: { paidAds: 0, seo: 0, email: 0, referral: 0 },
    operations: { labor: 0, infrastructure: 0, consultation: 0 },
    other: { refunds: 0, fees: 0 },
  };

  nodes.forEach(node => {
    const nodeTraffic = trafficMap.get(node.id) || 0;
    
    switch (node.type) {
      // 마케팅 비용
      case 'paid-ads':
        if (node.data.campaignOn) {
          costBreakdown.marketing.paidAds += (node.data.dailyBudget || 0) * 30;
        }
        break;
        
      case 'seo-content':
        costBreakdown.marketing.seo += (node.data.contentCount || 0) * (node.data.costPerContent || 0);
        break;
        
      case 'email-campaign':
        costBreakdown.marketing.email += node.data.sendCost || 0;
        break;
        
      case 'referral':
        // 초대 보상 비용 (초대받은 사용자 수 * 보상금)
        costBreakdown.marketing.referral += nodeTraffic * (node.data.rewardCost || 0);
        break;
        
      // 운영 비용
      case 'labor-cost':
        costBreakdown.operations.labor += (node.data.employeeCount || 0) * (node.data.avgSalary || 0);
        break;
        
      case 'infra-cost':
        const fixedCost = node.data.fixedCost || 0;
        const variableCost = nodeTraffic * (node.data.costPerUser || 0);
        costBreakdown.operations.infrastructure += fixedCost + variableCost;
        break;
        
      case 'consultation':
        if (nodeTraffic > 0) {
          const avgTimeMinutes = node.data.avgTimeMinutes || 30;
          const costPerHour = node.data.costPerHour || 0;
          const consultationCost = nodeTraffic * (avgTimeMinutes / 60) * costPerHour;
          costBreakdown.operations.consultation += consultationCost;
        }
        break;
        
      // 기타 비용
      case 'refund':
        const refundRate = (node.data.refundRate || 0) / 100;
        const processingCost = node.data.processingCost || 0;
        const refundAmount = totalRevenue * refundRate;
        const refundProcessing = nodeTraffic * processingCost;
        costBreakdown.other.refunds += refundAmount + refundProcessing;
        break;
        
      case 'marketing-fee':
        const agencyFee = totalRevenue * ((node.data.agencyFee || 0) / 100);
        const setupCost = node.data.setupCost || 0;
        costBreakdown.other.fees += agencyFee + setupCost;
        break;
        
      case 'retention':
        if (nodeTraffic > 0) {
          const retentionCost = nodeTraffic * (node.data.costPerUser || 0);
          costBreakdown.marketing.referral += retentionCost; // retention을 referral에 합산
        }
        break;
    }
  });

  // 총 비용 계산
  const totalCost = 
    costBreakdown.marketing.paidAds +
    costBreakdown.marketing.seo +
    costBreakdown.marketing.email +
    costBreakdown.marketing.referral +
    costBreakdown.operations.labor +
    costBreakdown.operations.infrastructure +
    costBreakdown.operations.consultation +
    costBreakdown.other.refunds +
    costBreakdown.other.fees;

  const netProfit = totalMargin - totalCost;
  const roi = totalCost > 0 ? ((netProfit / totalCost) * 100) : 0;

  // projectedUsers 계산 (최종 고객 수)
  let projectedUsers = 0;
  paymentNodes.forEach(node => {
    projectedUsers += trafficMap.get(node.id) || 0;
  });

  return {
    totalRevenue,
    totalCost,
    netProfit,
    roi,
    projectedUsers,
    conversionFunnel: funnel,
    costBreakdown,
    revenueBreakdown,
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
