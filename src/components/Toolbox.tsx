import React from 'react';
import { 
  Users, Megaphone, Globe, UserPlus, Zap, CreditCard, Repeat,
  Search, Share2, Gift, MessageCircle, ShoppingCart, Calculator,
  Percent, TrendingUp, DollarSign, Server, UserCheck, XCircle,
  Database, Mail, Phone, Package, Award
} from 'lucide-react';
import { NodeType } from '../types';

interface ToolboxProps {
  onAddNode: (type: string, position: { x: number; y: number }) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}

const nodeTypes: NodeType[] = [
  // Customer
  { id: 'customer', label: '타겟 고객', icon: 'Users', category: 'customer', color: 'purple', outputType: 'traffic' },
  
  // Acquisition - "사람을 어떻게 데려오는가?"
  { id: 'paid-ads', label: '유료 광고', icon: 'Megaphone', category: 'acquisition', color: 'orange', outputType: 'traffic' },
  { id: 'seo-content', label: 'SEO/콘텐츠', icon: 'Search', category: 'acquisition', color: 'orange', outputType: 'traffic' },
  { id: 'referral', label: '바이럴/초대', icon: 'Share2', category: 'acquisition', color: 'orange', outputType: 'traffic' },
  { id: 'email-campaign', label: '이메일 캠페인', icon: 'Mail', category: 'acquisition', color: 'orange', outputType: 'traffic' },
  
  // Activation - "고객이 무엇을 하는가?"
  { id: 'landing', label: '랜딩 페이지', icon: 'Globe', category: 'activation', color: 'blue', outputType: 'traffic' },
  { id: 'signup', label: '회원가입', icon: 'UserPlus', category: 'activation', color: 'blue', outputType: 'data' },
  { id: 'lead-magnet', label: '리드 마그넷', icon: 'Gift', category: 'activation', color: 'blue', outputType: 'data' },
  { id: 'consultation', label: '상담/문의', icon: 'MessageCircle', category: 'activation', color: 'blue', outputType: 'traffic' },
  { id: 'cart', label: '장바구니/견적', icon: 'ShoppingCart', category: 'activation', color: 'blue', outputType: 'traffic' },
  { id: 'trial', label: '무료 체험', icon: 'Zap', category: 'activation', color: 'blue', outputType: 'traffic' },
  
  // Revenue - "돈을 어떻게 버는가?"
  { id: 'one-time', label: '단건 판매', icon: 'Package', category: 'revenue', color: 'green', outputType: 'money' },
  { id: 'subscription', label: '정기 구독', icon: 'Repeat', category: 'revenue', color: 'green', outputType: 'money' },
  { id: 'commission', label: '중개 수수료', icon: 'Percent', category: 'revenue', color: 'green', outputType: 'money' },
  { id: 'upsell', label: '프리미엄/업셀', icon: 'Award', category: 'revenue', color: 'green', outputType: 'money' },
  { id: 'ads-revenue', label: '광고 수익', icon: 'DollarSign', category: 'revenue', color: 'green', outputType: 'money' },
  
  // Cost - "돈이 어디로 새는가?"
  { id: 'labor-cost', label: '인건비', icon: 'UserCheck', category: 'cost', color: 'red', outputType: 'cost' },
  { id: 'infra-cost', label: '서버/툴 비용', icon: 'Server', category: 'cost', color: 'red', outputType: 'cost' },
  { id: 'refund', label: '환불/취소', icon: 'XCircle', category: 'cost', color: 'red', outputType: 'cost' },
  { id: 'marketing-fee', label: '마케팅 수수료', icon: 'Calculator', category: 'cost', color: 'red', outputType: 'cost' },
  
  // Retention
  { id: 'retention', label: '재방문 캠페인', icon: 'TrendingUp', category: 'retention', color: 'cyan', outputType: 'traffic' },
];

const iconMap: Record<string, any> = {
  Users, Megaphone, Globe, UserPlus, Zap, CreditCard, Repeat,
  Search, Share2, Gift, MessageCircle, ShoppingCart, Calculator,
  Percent, TrendingUp, DollarSign, Server, UserCheck, XCircle,
  Database, Mail, Phone, Package, Award,
};

export function Toolbox({ onAddNode, canvasRef }: ToolboxProps) {
  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('nodeType', type);
  };

  const handleClick = (type: string) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const position = {
        x: rect.width / 2 - 100 + Math.random() * 200 - 100,
        y: rect.height / 2 - 60 + Math.random() * 120 - 60,
      };
      onAddNode(type, position);
    }
  };

  const categories = [
    { id: 'customer', label: '👥 고객', color: 'purple' },
    { id: 'acquisition', label: '📣 유입', color: 'orange' },
    { id: 'activation', label: '⚡ 행동', color: 'blue' },
    { id: 'revenue', label: '💰 수익', color: 'green' },
    { id: 'cost', label: '💸 비용', color: 'red' },
    { id: 'retention', label: '🔄 재방문', color: 'cyan' },
  ];

  return (
    <aside className="w-64 bg-neutral-900 border-r border-neutral-800 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-white text-sm mb-4">비즈니스 블록</h2>
        
        {categories.map(category => {
          const categoryNodes = nodeTypes.filter(node => node.category === category.id);
          
          if (categoryNodes.length === 0) return null;
          
          return (
            <div key={category.id} className="mb-6">
              <h3 className="text-neutral-400 text-xs uppercase tracking-wide mb-2">
                {category.label}
              </h3>
              
              <div className="space-y-2">
                {categoryNodes.map(nodeType => {
                  const Icon = iconMap[nodeType.icon];
                  
                  return (
                    <div
                      key={nodeType.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, nodeType.id)}
                      onClick={() => handleClick(nodeType.id)}
                      className={`
                        p-3 rounded bg-neutral-800 border border-neutral-700
                        hover:border-${nodeType.color}-500 hover:bg-neutral-750
                        cursor-grab active:cursor-grabbing
                        transition-all duration-200
                        flex items-center gap-3
                      `}
                    >
                      <div className={`w-8 h-8 rounded bg-${nodeType.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4 h-4 text-${nodeType.color}-400`} />
                      </div>
                      <span className="text-neutral-200 text-sm leading-tight">{nodeType.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-neutral-800">
        <p className="text-neutral-500 text-xs leading-relaxed">
          블록을 드래그하여 캔버스에 추가하고 연결하세요. <br/>
          <span className="text-blue-400">파랑=사람</span>, <span className="text-green-400">초록=수익</span>, <span className="text-red-400">빨강=비용</span>
        </p>
      </div>
    </aside>
  );
}
