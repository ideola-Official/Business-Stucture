import React, { useState } from "react";
import { Connection } from "../types";

interface ConnectionLineProps {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  connection?: Connection;
  isMoneyFlow?: boolean;
  temporary?: boolean;
  onDelete?: (connectionId: string) => void;
  onUpdateConversionRate?: (connectionId: string, rate: number) => void;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  id,
  from,
  to,
  connection,
  isMoneyFlow = false,
  temporary = false,
  onDelete,
  onUpdateConversionRate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  // 전환율 가져오기 (기본값 100%)
  const conversionRate = connection?.metrics?.conversionRate ?? 100;
  const traffic = connection?.metrics?.traffic ?? 0;

  // 중간 지점 계산
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  // 전환율에 따른 색상 결정
  const getBadgeColor = (rate: number) => {
    if (rate >= 80) return "bg-green-500";
    if (rate >= 50) return "bg-blue-500";
    if (rate >= 30) return "bg-orange-500";
    return "bg-red-500";
  };

  // 선 색상
  const getLineColor = () => {
    if (temporary) return "stroke-blue-400";
    if (isMoneyFlow) return "stroke-green-500";
    return "stroke-neutral-500";
  };

  // 뱃지 클릭 핸들러
  const handleBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!temporary && onUpdateConversionRate) {
      setEditValue(conversionRate.toString());
      setIsEditing(true);
    }
  };

  // 삭제 핸들러
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };

  // 수정 완료
  const handleEditSubmit = () => {
    const newRate = parseFloat(editValue);
    if (!isNaN(newRate) && newRate >= 0 && newRate <= 100 && onUpdateConversionRate) {
      onUpdateConversionRate(id, newRate);
    }
    setIsEditing(false);
  };

  // 키 입력 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEditSubmit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  return (
    <g>
      {/* 연결선 */}
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        className={`${getLineColor()} ${temporary ? "stroke-2 stroke-dasharray-4" : "stroke-2"}`}
        strokeWidth={temporary ? 2 : 3}
        strokeDasharray={temporary ? "5,5" : undefined}
        opacity={temporary ? 0.5 : 0.8}
      />

      {/* 화살표 */}
      {!temporary && (
        <polygon
          points={`${to.x},${to.y} ${to.x - 8},${to.y - 4} ${to.x - 8},${to.y + 4}`}
          className={isMoneyFlow ? "fill-green-500" : "fill-neutral-500"}
          opacity={0.8}
        />
      )}

      {/* 전환율 뱃지 (임시 선이 아닐 때만) */}
      {!temporary && (
        <g>
          {/* 삭제 버튼 (호버 시 표시) */}
          <circle
            cx={midX + 40}
            cy={midY - 20}
            r={12}
            className="fill-red-500 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
            style={{ pointerEvents: "all" }}
            onClick={handleDelete}
          />
          <text
            x={midX + 40}
            y={midY - 16}
            textAnchor="middle"
            className="text-white text-xs font-bold pointer-events-none"
            fontSize="12"
          >
            ✕
          </text>

          {/* 전환율 뱃지 */}
          {!isEditing ? (
            <g
              onClick={handleBadgeClick}
              className="cursor-pointer"
              style={{ pointerEvents: "all" }}
            >
              {/* 타원형 배경 */}
              <ellipse
                cx={midX}
                cy={midY}
                rx={35}
                ry={20}
                className={`${getBadgeColor(conversionRate)} opacity-90 hover:opacity-100 transition-opacity`}
              />
              
              {/* 전환율 텍스트 */}
              <text
                x={midX}
                y={midY - 2}
                textAnchor="middle"
                className="text-white text-xs font-bold pointer-events-none"
                fontSize="11"
              >
                {conversionRate.toFixed(0)}%
              </text>
              
              {/* 트래픽 텍스트 */}
              {traffic > 0 && (
                <text
                  x={midX}
                  y={midY + 10}
                  textAnchor="middle"
                  className="text-white text-xs pointer-events-none"
                  fontSize="9"
                  opacity={0.8}
                >
                  {traffic.toLocaleString()}
                </text>
              )}
            </g>
          ) : (
            // 수정 모드
            <g>
              <rect
                x={midX - 40}
                y={midY - 18}
                width={80}
                height={36}
                rx={4}
                className="fill-neutral-800 stroke-blue-500"
                strokeWidth={2}
              />
              <foreignObject
                x={midX - 35}
                y={midY - 13}
                width={70}
                height={26}
                style={{ pointerEvents: "all" }}
              >
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={handleEditSubmit}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  min="0"
                  max="100"
                  step="1"
                  className="w-full h-full bg-neutral-900 text-white text-center text-sm border-none outline-none rounded"
                  style={{ fontSize: "12px" }}
                />
              </foreignObject>
            </g>
          )}
        </g>
      )}
    </g>
  );
};

