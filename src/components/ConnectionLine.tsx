// @ts-nocheck
import React, { useState } from "react";
import { X, TrendingDown, Edit2 } from "lucide-react";
import { Connection } from "../types";

interface ConnectionLineProps {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  connection?: Connection;
  temporary?: boolean;
  onDelete?: (id: string) => void;
  onUpdateConversionRate?: (id: string, rate: number) => void;
  isMoneyFlow?: boolean;
}

// Color mapping for connection types
const CONNECTION_COLORS = {
  traffic: "#3B82F6", // Blue - 사람의 흐름
  money: "#10B981", // Green - 돈의 흐름
  cost: "#EF4444", // Red - 비용 발생
  data: "#6B7280", // Gray - 데이터 축적
};

export function ConnectionLine({
  id,
  from,
  to,
  connection,
  temporary = false,
  onDelete,
  onUpdateConversionRate,
  isMoneyFlow = false,
}: ConnectionLineProps) {
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [editRate, setEditRate] = useState("");

  // 좌표 유효성 검사
  if (isNaN(from.x) || isNaN(from.y) || isNaN(to.x) || isNaN(to.y)) {
    return null;
  }

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
  const connectionType = connection?.type || "traffic";
  let strokeColor = CONNECTION_COLORS[connectionType];
  const highlightStroke = "#e5e7eb"; // 밝은 회색 하이라이트

  // Money flow 강조: 결제/구독 이후는 초록 고정
  if (!temporary && isMoneyFlow) {
    strokeColor = "#22c55e";
  }

  // Override color based on health for traffic connections
  if (!temporary && connectionType === "traffic" && metrics) {
    if (dropoffRate > 80) {
      strokeColor = "#EF4444"; // Red - critical dropoff
    } else if (dropoffRate > 50) {
      strokeColor = "#F59E0B"; // Amber - warning
    } else {
      strokeColor = CONNECTION_COLORS[connectionType];
    }
  }

  // Traffic 기반 동적 굵기: 2px ~ 8px
  const strokeWidth = temporary
    ? 3
    : Math.max(2, Math.min(8, traffic > 0 ? traffic / 150 : 2));

  // Dead link: 유입 0이면 빨간 점선 처리
  const isDead = !temporary && traffic <= 0;
  if (isDead) {
    strokeColor = "#EF4444";
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };

  // Valve badge color based on conversion rate
  const getValveColor = () => {
    if (conversionRate >= 50) return { bg: "#10B981", text: "#ffffff" }; // Green
    if (conversionRate >= 10) return { bg: "#3B82F6", text: "#ffffff" }; // Blue
    if (conversionRate > 0) return { bg: "#F59E0B", text: "#ffffff" }; // Amber
    return { bg: "#EF4444", text: "#ffffff" }; // Red
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
    if (
      !isNaN(newRate) &&
      newRate >= 0 &&
      newRate <= 100 &&
      onUpdateConversionRate
    ) {
      onUpdateConversionRate(id, newRate);
    }
    setIsEditingRate(false);
  };

  return (
    <g className={temporary ? "opacity-60" : ""} data-connection-id={id}>
      {/* Glow / 대비 강화 */}
      {!temporary && !isDead && (
        <>
          <path
            d={path}
            fill="none"
            stroke={highlightStroke}
            strokeWidth={strokeWidth + 8}
            className="pointer-events-none opacity-30"
            strokeLinecap="round"
          />
          <path
            d={path}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth + 6}
            className="pointer-events-none opacity-35 blur-sm"
            strokeLinecap="round"
          />
        </>
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
        className={`pointer-events-none ${
          !temporary && traffic > 0 ? "animate-pulse" : ""
        }`}
        strokeDasharray={isDead || temporary ? "8,4" : "none"}
        strokeLinecap="round"
        strokeOpacity={0.95}
      />

      {/* Arrow head */}
      <circle
        cx={to.x}
        cy={to.y}
        r={strokeWidth / 2 + 2}
        fill={strokeColor}
        className="pointer-events-none"
      />

      {/* Valve Badge - Editable conversion rate (스마트 엣지) */}
      {!temporary && metrics && (
        <g className="pointer-events-auto">
          {/* 타원형 뱃지 배경 */}
          <ellipse
            cx={midX}
            cy={midY}
            rx="35"
            ry="20"
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
                y={midY + 5}
                fill={valveColor.text}
                fontSize="13"
                fontWeight="bold"
                textAnchor="middle"
                className="pointer-events-none select-none"
              >
                {conversionRate.toFixed(0)}%
              </text>

              {/* Edit icon hint */}
              <g
                transform={`translate(${midX + 25}, ${midY - 15})`}
                opacity="0.8"
              >
                <circle r="9" fill="#1F2937" stroke="#3B82F6" strokeWidth="2" />
                <foreignObject x="-7" y="-7" width="14" height="14">
                  <div className="flex items-center justify-center w-full h-full">
                    <Edit2 className="w-3 h-3 text-white" />
                  </div>
                </foreignObject>
              </g>
            </>
          ) : (
            <foreignObject x={midX - 50} y={midY - 25} width="100" height="50">
              <div className="flex flex-col items-center justify-center w-full h-full bg-white rounded-lg shadow-2xl border-2 border-blue-500 p-2">
                <input
                  type="number"
                  value={editRate}
                  onChange={(e) => setEditRate(e.target.value)}
                  onBlur={handleRateSubmit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRateSubmit();
                    if (e.key === "Escape") setIsEditingRate(false);
                  }}
                  autoFocus
                  className="w-full text-center bg-gray-50 text-black text-lg font-bold rounded border-2 border-gray-300 outline-none focus:border-blue-500 px-2 py-1"
                  min="0"
                  max="100"
                  placeholder="%"
                />
                <span className="text-xs text-gray-500 mt-1">Enter로 저장</span>
              </div>
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
