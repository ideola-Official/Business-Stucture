import React, { useState } from 'react';
import { X, TrendingDown, Edit2 } from 'lucide-react';
import { Connection } from '../types';

interface ConnectionLineProps {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  connection?: Connection;
  temporary?: boolean;
  onDelete?: (id: string) => void;
  onUpdateConversionRate?: (id: string, rate: number) => void;
}

// Color mapping for connection types
const CONNECTION_COLORS = {
  traffic: '#3B82F6',   // Blue - 사람의 흐름
  money: '#10B981',     // Green - 돈의 흐름
  cost: '#EF4444',      // Red - 비용 발생
  data: '#6B7280',      // Gray - 데이터 축적
};

export function ConnectionLine({ 
  id, 
  from, 
  to, 
  connection,
  temporary = false, 
  onDelete,
  onUpdateConversionRate,
}: ConnectionLineProps) {
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [editRate, setEditRate] = useState('');

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  const controlPointOffset = Math.min(distance * 0.5, 150);
  
  const path = `
    M ${from.x} ${from.y}
    C ${from.x + controlPointOffset} ${from.y},
      ${to.x - controlPointOffset} ${to.y},
      ${to.x} ${to.y}
  `;

  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  // Get metrics from connection
  const metrics = connection?.metrics;
  const traffic = metrics?.traffic || 0;
  const conversionRate = metrics?.conversionRate || 0;
  const dropoffRate = metrics?.dropoffRate || 0;

  // Determine connection type and color
  const connectionType = connection?.type || 'traffic';
  let strokeColor = CONNECTION_COLORS[connectionType];
  
  // Override color based on health for traffic connections
  if (!temporary && connectionType === 'traffic' && metrics) {
    if (dropoffRate > 80) {
      strokeColor = '#EF4444'; // Red - critical dropoff
    } else if (dropoffRate > 50) {
      strokeColor = '#F59E0B'; // Amber - warning
    } else {
      strokeColor = CONNECTION_COLORS[connectionType];
    }
  }

  // Determine stroke width based on traffic (data pipe visualization)
  const strokeWidth = temporary ? 2 : Math.max(2, Math.min(12, traffic / 100));

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };

  // Valve badge color based on conversion rate
  const getValveColor = () => {
    if (conversionRate >= 50) return { bg: '#10B981', text: '#ffffff' }; // Green
    if (conversionRate >= 10) return { bg: '#3B82F6', text: '#ffffff' }; // Blue
    if (conversionRate > 0) return { bg: '#F59E0B', text: '#ffffff' }; // Amber
    return { bg: '#EF4444', text: '#ffffff' }; // Red
  };

  const valveColor = getValveColor();

  const handleValveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!temporary && onUpdateConversionRate) {
      setEditRate(conversionRate.toString());
      setIsEditingRate(true);
    }
  };

  const handleRateSubmit = () => {
    const newRate = parseFloat(editRate);
    if (!isNaN(newRate) && newRate >= 0 && newRate <= 100 && onUpdateConversionRate) {
      onUpdateConversionRate(id, newRate);
    }
    setIsEditingRate(false);
  };

  return (
    <g className={temporary ? 'opacity-60' : ''}>
      {/* Glow effect for active data flow */}
      {!temporary && traffic > 0 && (
        <path
          d={path}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth + 4}
          className="pointer-events-none opacity-20 blur-sm"
        />
      )}

      {/* Invisible thick path for easier clicking */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth="20"
        className="pointer-events-auto cursor-pointer"
      />
      
      {/* Visible path - animated if traffic is flowing */}
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        className={`pointer-events-none ${traffic > 0 ? 'animate-pulse' : ''}`}
        strokeDasharray={temporary ? '8,4' : 'none'}
        strokeLinecap="round"
      />
      
      {/* Arrow head */}
      <circle
        cx={to.x}
        cy={to.y}
        r={strokeWidth / 2 + 2}
        fill={strokeColor}
        className="pointer-events-none"
      />
      
      {/* Valve Badge - Editable conversion rate */}
      {!temporary && metrics && (
        <g className="pointer-events-auto">
          {/* Valve Circle */}
          <circle
            cx={midX}
            cy={midY}
            r="20"
            fill={valveColor.bg}
            stroke="#1F2937"
            strokeWidth="3"
            className="cursor-pointer hover:scale-110 transition-transform"
            onClick={handleValveClick}
          />
          
          {/* Conversion Rate Text */}
          {!isEditingRate ? (
            <>
              <text
                x={midX}
                y={midY + 2}
                fill={valveColor.text}
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
                className="pointer-events-none select-none"
              >
                {conversionRate.toFixed(0)}%
              </text>
              
              {/* Edit icon hint */}
              <g transform={`translate(${midX + 15}, ${midY - 15})`} opacity="0.7">
                <circle r="8" fill="#1F2937" />
                <foreignObject x="-6" y="-6" width="12" height="12">
                  <div className="flex items-center justify-center w-full h-full">
                    <Edit2 className="w-2.5 h-2.5 text-white" />
                  </div>
                </foreignObject>
              </g>
            </>
          ) : (
            <foreignObject x={midX - 15} y={midY - 10} width="30" height="20">
              <input
                type="number"
                value={editRate}
                onChange={(e) => setEditRate(e.target.value)}
                onBlur={handleRateSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleRateSubmit()}
                autoFocus
                className="w-full h-full text-center bg-white text-black text-xs rounded border-none outline-none"
                min="0"
                max="100"
              />
            </foreignObject>
          )}
        </g>
      )}
      
      {/* Traffic Badge - show traffic count */}
      {!temporary && metrics && traffic > 0 && (
        <g>
          {/* Badge background */}
          <rect
            x={midX - 40}
            y={midY - 35}
            width="80"
            height="22"
            rx="6"
            fill="#1F2937"
            stroke={strokeColor}
            strokeWidth="2"
            className="pointer-events-none"
          />
          
          {/* Traffic text */}
          <text
            x={midX}
            y={midY - 21}
            fill="#ffffff"
            fontSize="10"
            textAnchor="middle"
            className="pointer-events-none select-none"
          >
            👥 {traffic.toLocaleString()}명
          </text>
          
          {/* Warning icon for high dropoff */}
          {dropoffRate > 80 && (
            <g transform={`translate(${midX + 45}, ${midY - 30})`}>
              <circle r="10" fill="#EF4444" />
              <foreignObject x="-8" y="-8" width="16" height="16">
                <div className="flex items-center justify-center w-full h-full">
                  <TrendingDown className="w-3 h-3 text-white" />
                </div>
              </foreignObject>
            </g>
          )}
        </g>
      )}
      
      {/* Delete button */}
      {!temporary && onDelete && (
        <g className="pointer-events-auto">
          <circle
            cx={midX}
            cy={midY + 35}
            r="12"
            fill="#1F2937"
            stroke="#3B82F6"
            strokeWidth="2"
            className="cursor-pointer hover:fill-red-500 hover:stroke-red-500 transition-all"
            onClick={handleDelete}
          />
          <foreignObject
            x={midX - 8}
            y={midY + 27}
            width="16"
            height="16"
            className="pointer-events-none"
          >
            <div className="flex items-center justify-center w-full h-full">
              <X className="w-3 h-3 text-white" />
            </div>
          </foreignObject>
        </g>
      )}
    </g>
  );
}
