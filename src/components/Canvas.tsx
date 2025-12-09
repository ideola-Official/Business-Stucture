import React, { useState, useCallback, useRef, forwardRef } from 'react';
import { NodeComponent } from './NodeComponent';
import { ConnectionLine } from './ConnectionLine';
import { Node, Connection, SimulationResult } from '../types';

interface CanvasProps {
  nodes: Node[];
  connections: Connection[];
  selectedNode: Node | null;
  simulationResult?: SimulationResult | null;
  onNodeMove: (nodeId: string, position: { x: number; y: number }) => void;
  onSelectNode: (node: Node | null) => void;
  onAddConnection: (fromId: string, toId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteConnection: (connectionId: string) => void;
}

export const Canvas = forwardRef<HTMLDivElement, CanvasProps>(({
  nodes,
  connections,
  selectedNode,
  simulationResult,
  onNodeMove,
  onSelectNode,
  onAddConnection,
  onDeleteNode,
  onDeleteConnection,
}, ref) => {
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [tempLine, setTempLine] = useState<{ x: number; y: number } | null>(null);

  // Build traffic map from simulation
  const trafficMap = new Map<string, number>();
  if (simulationResult) {
    simulationResult.conversionFunnel.forEach(stage => {
      const node = nodes.find(n => n.data.name === stage.stage);
      if (node) {
        trafficMap.set(node.id, stage.users);
      }
    });
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData('nodeType');
    if (!nodeType) return;

    const canvas = e.currentTarget.getBoundingClientRect();
    const position = {
      x: e.clientX - canvas.left - 75,
      y: e.clientY - canvas.top - 40,
    };

    // This should be handled by parent, but we'll trigger through a custom event
    const event = new CustomEvent('addNode', { detail: { type: nodeType, position } });
    e.currentTarget.dispatchEvent(event);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectNode(null);
      setConnectingFrom(null);
      setTempLine(null);
    }
  };

  const handleStartConnection = useCallback((nodeId: string) => {
    setConnectingFrom(nodeId);
  }, []);

  const handleEndConnection = useCallback((nodeId: string) => {
    if (connectingFrom && connectingFrom !== nodeId) {
      onAddConnection(connectingFrom, nodeId);
    }
    setConnectingFrom(null);
    setTempLine(null);
  }, [connectingFrom, onAddConnection]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (connectingFrom) {
      const canvas = e.currentTarget.getBoundingClientRect();
      setTempLine({
        x: e.clientX - canvas.left,
        y: e.clientY - canvas.top,
      });
    }
  }, [connectingFrom]);

  // Get node position for connections
  const getNodeCenter = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    return {
      x: node.position.x + 75,
      y: node.position.y + 40,
    };
  };

  return (
    <div
      ref={ref}
      className="flex-1 bg-neutral-950 relative overflow-hidden"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      style={{
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
      }}
    >
      {/* Render connections */}
      <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {connections.map(conn => {
          const from = getNodeCenter(conn.from);
          const to = getNodeCenter(conn.to);
          return (
            <ConnectionLine
              key={conn.id}
              id={conn.id}
              from={from}
              to={to}
              connection={conn}
              onDelete={onDeleteConnection}
            />
          );
        })}
        
        {/* Temporary connection line while dragging */}
        {connectingFrom && tempLine && (
          <ConnectionLine
            id="temp"
            from={getNodeCenter(connectingFrom)}
            to={tempLine}
            temporary
          />
        )}
      </svg>

      {/* Render nodes */}
      {nodes.map(node => (
        <NodeComponent
          key={node.id}
          node={node}
          isSelected={selectedNode?.id === node.id}
          isConnecting={connectingFrom === node.id}
          traffic={trafficMap.get(node.id) || 0}
          onMove={onNodeMove}
          onSelect={onSelectNode}
          onStartConnection={handleStartConnection}
          onEndConnection={handleEndConnection}
          onDelete={onDeleteNode}
        />
      ))}
      
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-neutral-600 text-lg mb-2">비즈니스 모델 설계를 시작하세요</p>
            <p className="text-neutral-700 text-sm">
              왼쪽 툴박스에서 블록을 드래그하거나 클릭하여 추가하세요
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

Canvas.displayName = 'Canvas';