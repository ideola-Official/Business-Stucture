// @ts-nocheck
import React, { useState } from "react";
import { Trash2, Percent } from "lucide-react";
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

export function ConnectionLine({
  id,
  from,
  to,
  connection,
  isMoneyFlow = false,
  temporary = false,
  onDelete,
  onUpdateConversionRate,
}: ConnectionLineProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showRateInput, setShowRateInput] = useState(false);
  const [rateValue, setRateValue] = useState(
    connection?.metrics?.conversionRate?.toString() || "100"
  );

  // Calculate control points for curved line
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Horizontal curve
  const controlPointOffset = Math.min(distance * 0.5, 150);
  const cp1x = from.x + controlPointOffset;
  const cp1y = from.y;
  const cp2x = to.x - controlPointOffset;
  const cp2y = to.y;

  // Path for the line
  const path = `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`;

  // Calculate midpoint for labels/buttons
  const t = 0.5; // midpoint
  const midX =
    Math.pow(1 - t, 3) * from.x +
    3 * Math.pow(1 - t, 2) * t * cp1x +
    3 * (1 - t) * Math.pow(t, 2) * cp2x +
    Math.pow(t, 3) * to.x;
  const midY =
    Math.pow(1 - t, 3) * from.y +
    3 * Math.pow(1 - t, 2) * t * cp1y +
    3 * (1 - t) * Math.pow(t, 2) * cp2y +
    Math.pow(t, 3) * to.y;

  // Determine color based on connection type
  const getColor = () => {
    if (temporary) return "#60A5FA"; // blue-400
    if (!connection) return "#60A5FA";

    switch (connection.type) {
      case "traffic":
        return "#60A5FA"; // blue-400
      case "money":
        return "#10B981"; // green-500
      case "cost":
        return "#EF4444"; // red-500
      case "data":
        return "#8B5CF6"; // purple-500
      default:
        return "#60A5FA";
    }
  };

  const color = getColor();

  // Traffic volume for animation
  const traffic = connection?.metrics?.traffic || 0;
  const strokeWidth = temporary ? 2 : Math.max(2, Math.min(traffic / 100, 8));

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && !temporary) {
      onDelete(id);
    }
  };

  const handleRateUpdate = () => {
    const rate = parseFloat(rateValue);
    if (!isNaN(rate) && rate >= 0 && rate <= 100 && onUpdateConversionRate) {
      onUpdateConversionRate(id, rate);
      setShowRateInput(false);
    }
  };

  const handleRateKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRateUpdate();
    } else if (e.key === "Escape") {
      setShowRateInput(false);
      setRateValue(connection?.metrics?.conversionRate?.toString() || "100");
    }
  };

  return (
    <g
      onMouseEnter={() => !temporary && setIsHovered(true)}
      onMouseLeave={() => !temporary && setIsHovered(false)}
    >
      {/* Main line */}
      <path
        d={path}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        opacity={temporary ? 0.5 : isHovered ? 0.9 : 0.7}
        className="transition-all duration-200"
        style={{
          filter: isHovered
            ? `drop-shadow(0 0 8px ${color})`
            : `drop-shadow(0 0 4px ${color})`,
        }}
      />

      {/* Arrow head */}
      <defs>
        <marker
          id={`arrowhead-${id}`}
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill={color} opacity={0.8} />
        </marker>
      </defs>
      <path
        d={path}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        markerEnd={`url(#arrowhead-${id})`}
        opacity={0}
        strokeLinecap="round"
      />

      {/* Flow animation */}
      {!temporary && traffic > 0 && (
        <>
          <circle r="4" fill={color} opacity="0.8">
            <animateMotion dur="2s" repeatCount="indefinite" path={path} />
          </circle>
          <circle r="4" fill={color} opacity="0.6">
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path={path}
              begin="0.5s"
            />
          </circle>
        </>
      )}

      {/* Interactive overlay for click detection */}
      <path
        d={path}
        stroke="transparent"
        strokeWidth={Math.max(strokeWidth + 10, 20)}
        fill="none"
        style={{ pointerEvents: "auto", cursor: "pointer" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* Control buttons and labels at midpoint */}
      {!temporary && isHovered && (
        <g>
          {/* Background for buttons */}
          <foreignObject
            x={midX - 80}
            y={midY - 20}
            width="160"
            height="40"
            style={{ pointerEvents: "auto" }}
          >
            <div
              style={{
                display: "flex",
                gap: "4px",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              {/* Conversion Rate Display/Edit */}
              {connection?.metrics && !showRateInput && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRateInput(true);
                  }}
                  style={{
                    padding: "4px 8px",
                    backgroundColor: "rgba(30, 41, 59, 0.95)",
                    color: color,
                    border: `1px solid ${color}`,
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}
                  title="클릭하여 전환율 수정"
                >
                  <Percent style={{ width: "10px", height: "10px" }} />
                  {connection.metrics.conversionRate}%
                </button>
              )}

              {/* Conversion Rate Input */}
              {showRateInput && (
                <div
                  style={{
                    display: "flex",
                    gap: "4px",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="number"
                    value={rateValue}
                    onChange={(e) => setRateValue(e.target.value)}
                    onKeyDown={handleRateKeyPress}
                    onBlur={handleRateUpdate}
                    autoFocus
                    min="0"
                    max="100"
                    step="1"
                    style={{
                      width: "50px",
                      padding: "4px",
                      backgroundColor: "rgba(30, 41, 59, 0.95)",
                      color: "white",
                      border: `1px solid ${color}`,
                      borderRadius: "4px",
                      fontSize: "11px",
                      textAlign: "center",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span
                    style={{
                      color: "white",
                      fontSize: "11px",
                      fontWeight: "600",
                    }}
                  >
                    %
                  </span>
                </div>
              )}

              {/* Traffic Display */}
              {traffic > 0 && !showRateInput && (
                <div
                  style={{
                    padding: "4px 8px",
                    backgroundColor: "rgba(30, 41, 59, 0.95)",
                    color: "white",
                    borderRadius: "6px",
                    fontSize: "10px",
                    fontWeight: "500",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}
                >
                  {traffic.toLocaleString()}명
                </div>
              )}

              {/* Delete Button */}
              <button
                onClick={handleDelete}
                style={{
                  width: "24px",
                  height: "24px",
                  padding: "4px",
                  backgroundColor: "rgba(239, 68, 68, 0.9)",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
                title="연결 삭제"
              >
                <Trash2 style={{ width: "12px", height: "12px" }} />
              </button>
            </div>
          </foreignObject>
        </g>
      )}

      {/* Connection type label (non-interactive) */}
      {!temporary && !isHovered && connection?.metrics && (
        <foreignObject
          x={midX - 30}
          y={midY - 12}
          width="60"
          height="24"
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              padding: "2px 6px",
              backgroundColor: "rgba(30, 41, 59, 0.8)",
              color: color,
              borderRadius: "4px",
              fontSize: "9px",
              fontWeight: "600",
              textAlign: "center",
              border: `1px solid ${color}40`,
            }}
          >
            {connection.metrics.conversionRate}%
          </div>
        </foreignObject>
      )}
    </g>
  );
}







