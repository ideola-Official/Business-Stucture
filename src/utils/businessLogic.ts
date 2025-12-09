import { Node, Connection, DiagnosticMessage } from '../types';

export function analyzeBusiness(nodes: Node[], connections: Connection[]): DiagnosticMessage[] {
  const diagnostics: DiagnosticMessage[] = [];
  let messageId = 0;

  // Check if there are any nodes
  if (nodes.length === 0) {
    diagnostics.push({
      id: `diag-${messageId++}`,
      type: 'error',
      message: '비즈니스 블록이 없습니다. 최소 1개 이상의 블록을 추가하세요.',
    });
    return diagnostics;
  }

  // Check for revenue model (payment or subscription)
  const hasRevenueModel = nodes.some(node => 
    node.type === 'payment' || node.type === 'subscription'
  );

  if (!hasRevenueModel) {
    diagnostics.push({
      id: `diag-${messageId++}`,
      type: 'error',
      message: '수익 모델이 없습니다. "일회성 결제" 또는 "구독 모델" 블록을 추가하세요.',
    });
  }

  // Check for customer block
  const hasCustomer = nodes.some(node => node.type === 'customer');
  if (!hasCustomer) {
    diagnostics.push({
      id: `diag-${messageId++}`,
      type: 'warning',
      message: '타겟 고객 블록이 없습니다. 명확한 고객 정의가 필요합니다.',
    });
  }

  // Check for marketing channel
  const hasChannel = nodes.some(node => node.type === 'channel');
  if (!hasChannel) {
    diagnostics.push({
      id: `diag-${messageId++}`,
      type: 'warning',
      message: '유입 채널 블록이 없습니다. 고객 유입 경로를 설계하세요.',
    });
  }

  // Check for core feature
  const hasFeature = nodes.some(node => node.type === 'feature');
  if (!hasFeature) {
    diagnostics.push({
      id: `diag-${messageId++}`,
      type: 'warning',
      message: '핵심 기능 블록이 없습니다. 제공할 가치를 정의하세요.',
    });
  }

  // Check for disconnected nodes
  const connectedNodeIds = new Set<string>();
  connections.forEach(conn => {
    connectedNodeIds.add(conn.from);
    connectedNodeIds.add(conn.to);
  });

  const disconnectedNodes = nodes.filter(node => !connectedNodeIds.has(node.id));
  if (disconnectedNodes.length > 0 && connections.length > 0) {
    disconnectedNodes.forEach(node => {
      diagnostics.push({
        id: `diag-${messageId++}`,
        type: 'warning',
        message: `"${node.data.name}" 블록이 다른 블록과 연결되지 않았습니다.`,
        nodeId: node.id,
      });
    });
  }

  // Check channel-customer alignment
  const channelNode = nodes.find(node => node.type === 'channel');
  const customerNode = nodes.find(node => node.type === 'customer');
  
  if (channelNode && customerNode) {
    const platform = channelNode.data.platform?.toLowerCase() || '';
    const segment = customerNode.data.segment?.toLowerCase() || '';
    
    // Example alignment check
    if (platform.includes('tiktok') && segment.includes('50대')) {
      diagnostics.push({
        id: `diag-${messageId++}`,
        type: 'warning',
        message: '타겟은 50대인데 유입 채널이 TikTok입니다. 채널 적합도가 낮을 수 있습니다.',
      });
    }
  }

  // Suggest subscription model if only payment exists
  const hasPayment = nodes.some(node => node.type === 'payment');
  const hasSubscription = nodes.some(node => node.type === 'subscription');
  
  if (hasPayment && !hasSubscription) {
    diagnostics.push({
      id: `diag-${messageId++}`,
      type: 'suggestion',
      message: '현재 구조는 일회성 결제입니다. 구독 모델 추가 시 안정적인 수익 확보가 가능합니다.',
    });
  }

  // Check for complete flow
  const hasCompleteFlow = hasCustomer && hasChannel && hasFeature && hasRevenueModel;
  if (hasCompleteFlow && diagnostics.filter(d => d.type === 'error').length === 0) {
    diagnostics.push({
      id: `diag-${messageId++}`,
      type: 'suggestion',
      message: '✓ 기본적인 비즈니스 구조가 완성되었습니다. 수익 시뮬레이션을 실행해보세요.',
    });
  }

  // Check for low conversion rates
  nodes.forEach(node => {
    if (node.data.conversionRate !== undefined && node.data.conversionRate < 5) {
      diagnostics.push({
        id: `diag-${messageId++}`,
        type: 'warning',
        message: `"${node.data.name}" 블록의 전환율이 ${node.data.conversionRate}%로 낮습니다. 개선이 필요할 수 있습니다.`,
        nodeId: node.id,
      });
    }
  });

  // Check marketing budget vs expected revenue
  const channelWithBudget = nodes.find(node => node.type === 'channel' && node.data.cost);
  const paymentNode = nodes.find(node => node.type === 'payment');
  
  if (channelWithBudget && paymentNode) {
    const monthlyCost = channelWithBudget.data.cost || 0;
    const price = paymentNode.data.price || 0;
    
    if (monthlyCost > price * 10) {
      diagnostics.push({
        id: `diag-${messageId++}`,
        type: 'warning',
        message: `월 광고비(₩${monthlyCost.toLocaleString()})가 판매 가격 대비 높습니다. ROI를 확인하세요.`,
      });
    }
  }

  return diagnostics;
}
