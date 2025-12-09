import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Circle, AlertTriangle, TrendingUp, Users, DollarSign, Zap, Target } from 'lucide-react';
import { Node } from '../types';

interface NodeComponentProps {
  node: Node;
  isSelected: boolean;
  isConnecting: boolean;
  traffic?: number;
  onMove: (nodeId: string, position: { x: number; y: number }) => void;
  onSelect: (node: Node) => void;
  onStartConnection: (nodeId: string) => void;
  onEndConnection: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
}

const colorMap: Record<string, string> = {
  customer: '#9333EA',
  'paid-ads': '#F59E0B',
  'seo-content': '#F59E0B',
  'referral': '#F59E0B',
  'email-campaign': '#F59E0B',
  landing: '#3B82F6',
  signup: '#3B82F6',
  'lead-magnet': '#3B82F6',
  consultation: '#3B82F6',
  cart: '#3B82F6',
  trial: '#3B82F6',
  'one-time': '#10B981',
  subscription: '#10B981',
  commission: '#10B981',
  upsell: '#10B981',
  'ads-revenue': '#10B981',
  'labor-cost': '#EF4444',
  'infra-cost': '#EF4444',
  refund: '#EF4444',
  'marketing-fee': '#EF4444',
  retention: '#06B6D4',
};

export function NodeComponent({
  node,
  isSelected,
  isConnecting,
  traffic = 0,
  onMove,
  onSelect,
  onStartConnection,
  onEndConnection,
  onDelete,
}: NodeComponentProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);

  const color = colorMap[node.type] || '#3B82F6';
  
  // Calculate node status for status bar
  const getNodeStatus = (): { status: 'complete' | 'warning' | 'danger' | 'inactive'; color: string; label: string } => {
    // Check if critical fields are missing
    const hasCriticalData = node.data.name && node.data.name !== '새 블록';
    
    if (!hasCriticalData) {
      return { status: 'warning', color: '#F59E0B', label: '설정 필요' };
    }
    
    if (traffic === 0) {
      return { status: 'inactive', color: '#6B7280', label: '대기 중' };
    }
    
    // Check conversion rate for activation nodes
    if (node.data.conversionRate !== undefined) {
      const rate = node.data.conversionRate;
      if (rate < 5) {
        return { status: 'danger', color: '#EF4444', label: '전환율 저조' };
      }
      if (rate < 10) {
        return { status: 'warning', color: '#F59E0B', label: '개선 필요' };
      }
    }
    
    return { status: 'complete', color: '#10B981', label: '정상' };
  };

  const statusInfo = getNodeStatus();

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.node-action')) {
      return;
    }

    setIsDragging(true);
    const rect = nodeRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    onSelect(node);
    e.stopPropagation();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const canvas = nodeRef.current?.parentElement;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const newPosition = {
        x: e.clientX - rect.left - dragOffset.x,
        y: e.clientY - rect.top - dragOffset.y,
      };

      onMove(node.id, newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, node.id, onMove]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(node.id);
  };

  const handleOutputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartConnection(node.id);
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEndConnection(node.id);
  };

  // Render key metrics in block body - "계기판" style
  const renderKeyMetrics = () => {
    const metrics: React.ReactNode[] = [];

    // Traffic (if flowing)
    if (traffic > 0) {
      metrics.push(
        <div key="traffic" className="flex items-center justify-between px-3 py-1.5 bg-neutral-900/50 rounded">
          <span className="text-xs text-neutral-400 flex items-center gap-1">
            <Users className="w-3 h-3" />
            유입
          </span>
          <span className="text-sm text-white font-semibold">{traffic.toLocaleString()}명</span>
        </div>
      );
    }

    // Conversion Rate (for activation nodes)
    if (node.data.conversionRate !== undefined) {
      const rate = node.data.conversionRate;
      const rateColor = rate >= 10 ? 'text-green-400' : rate >= 5 ? 'text-yellow-400' : 'text-red-400';
      
      metrics.push(
        <div key="conversion" className="flex items-center justify-between px-3 py-1.5 bg-neutral-900/50 rounded">
          <span className="text-xs text-neutral-400 flex items-center gap-1">
            <Target className="w-3 h-3" />
            전환율
          </span>
          <span className={`text-sm font-semibold ${rateColor}`}>{rate}%</span>
        </div>
      );
    }

    // Price/Budget (for acquisition/revenue nodes)
    if (node.data.dailyBudget) {
      metrics.push(
        <div key="budget" className="flex items-center justify-between px-3 py-1.5 bg-orange-950/30 rounded border border-orange-900/50">
          <span className="text-xs text-orange-300 flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            일 예산
          </span>
          <span className="text-sm text-orange-200 font-bold">₩{(node.data.dailyBudget / 10000).toFixed(0)}만</span>
        </div>
      );
    }

    if (node.data.price) {
      metrics.push(
        <div key="price" className="flex items-center justify-between px-3 py-1.5 bg-green-950/30 rounded border border-green-900/50">
          <span className="text-xs text-green-300 flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            판매가
          </span>
          <span className="text-sm text-green-200 font-bold">₩{node.data.price.toLocaleString()}</span>
        </div>
      );
    }

    if (node.data.monthlyPrice) {
      metrics.push(
        <div key="monthly" className="flex items-center justify-between px-3 py-1.5 bg-green-950/30 rounded border border-green-900/50">
          <span className="text-xs text-green-300 flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            월 구독료
          </span>
          <span className="text-sm text-green-200 font-bold">₩{node.data.monthlyPrice.toLocaleString()}</span>
        </div>
      );
    }

    // CTR for ads
    if (node.data.ctr) {
      metrics.push(
        <div key="ctr" className="flex items-center justify-between px-3 py-1.5 bg-neutral-900/50 rounded">
          <span className="text-xs text-neutral-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            CTR
          </span>
          <span className="text-sm text-blue-400 font-semibold">{node.data.ctr}%</span>
        </div>
      );
    }

    // Churn rate for subscription
    if (node.data.churnRate !== undefined) {
      metrics.push(
        <div key="churn" className="flex items-center justify-between px-3 py-1.5 bg-neutral-900/50 rounded">
          <span className="text-xs text-neutral-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            이탈률
          </span>
          <span className="text-sm text-red-400 font-semibold">{node.data.churnRate}%</span>
        </div>
      );
    }

    return metrics;
  };

  const keyMetrics = renderKeyMetrics();

  return (
    <div
      ref={nodeRef}
      className={`
        absolute cursor-move select-none group
        ${isDragging ? 'opacity-70 scale-105 z-50' : ''}
        ${isSelected ? 'z-10' : 'z-0'}
      `}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: 220,
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className={`
          bg-neutral-800 rounded-2xl border-2 transition-all shadow-xl
          ${isSelected 
            ? 'border-blue-500 shadow-2xl shadow-blue-500/30 scale-105' 
            : 'border-neutral-700'
          }
          ${isConnecting ? 'ring-4 ring-blue-500/30' : ''}
          hover:shadow-2xl hover:scale-102
        `}
      >
        {/* Status Bar - Left Side */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
          style={{ backgroundColor: statusInfo.color }}
        />

        {/* Header */}
        <div 
          className="px-4 py-2 border-b border-neutral-700 rounded-t-2xl"
          style={{ 
            backgroundColor: `${color}15`,
          }}
        >
          <div className="flex items-center justify-between">
            <span 
              className="text-xs uppercase tracking-wider font-semibold"
              style={{ color: color }}
            >
              {node.type}
            </span>
            <button
              className="node-action p-1 text-neutral-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              onClick={handleDelete}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        
        {/* Body - Name and Key Metrics (계기판) */}
        <div className="px-3 py-3 space-y-2">
          <p className="text-white font-medium text-sm px-1">{node.data.name}</p>
          
          {/* Key Metrics Display */}
          {keyMetrics.length > 0 && (
            <div className="space-y-1.5">
              {keyMetrics}
            </div>
          )}

          {/* Status Label */}
          <div className="flex items-center gap-2 px-2 py-1 rounded mt-2">
            <div 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: statusInfo.color }}
            />
            <span className="text-xs" style={{ color: statusInfo.color }}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Performance Badge (top right) */}
        {traffic > 0 && statusInfo.status === 'complete' && (
          <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1.5 shadow-lg">
            <Zap className="w-4 h-4" />
          </div>
        )}

        {/* Warning Badge */}
        {statusInfo.status === 'danger' && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg animate-pulse">
            <AlertTriangle className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Input connector */}
      <button
        className="node-action absolute -left-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-neutral-700 border-2 border-neutral-600 hover:border-blue-400 hover:bg-blue-500 hover:scale-125 transition-all z-20 shadow-md"
        onClick={handleInputClick}
        title="입력 연결"
      >
        <Circle className="w-2 h-2 opacity-0" />
      </button>

      {/* Output connector */}
      <button
        className="node-action absolute -right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-neutral-700 border-2 border-neutral-600 hover:border-blue-400 hover:bg-blue-500 hover:scale-125 transition-all z-20 shadow-md"
        onClick={handleOutputClick}
        title="출력 연결"
      >
        <Circle className="w-2 h-2 opacity-0" />
      </button>
    </div>
  );
}
