import React from 'react';
import { AlertCircle, AlertTriangle, Lightbulb, Terminal } from 'lucide-react';
import { DiagnosticMessage } from '../types';

interface ConsoleProps {
  diagnostics: DiagnosticMessage[];
}

export function Console({ diagnostics }: ConsoleProps) {
  const getIcon = (type: DiagnosticMessage['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'suggestion':
        return <Lightbulb className="w-4 h-4 text-blue-400" />;
    }
  };

  const getColorClass = (type: DiagnosticMessage['type']) => {
    switch (type) {
      case 'error':
        return 'bg-red-500/10 border-red-500/30 text-red-300';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300';
      case 'suggestion':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-300';
    }
  };

  const errorCount = diagnostics.filter(d => d.type === 'error').length;
  const warningCount = diagnostics.filter(d => d.type === 'warning').length;
  const suggestionCount = diagnostics.filter(d => d.type === 'suggestion').length;

  return (
    <div className="h-48 bg-neutral-900 border-t border-neutral-800 flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-neutral-400" />
          <h3 className="text-white text-sm">진단 콘솔</h3>
        </div>
        
        <div className="flex items-center gap-4 text-xs">
          <span className="text-red-400">{errorCount} 오류</span>
          <span className="text-yellow-400">{warningCount} 경고</span>
          <span className="text-blue-400">{suggestionCount} 제안</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {diagnostics.length === 0 ? (
          <div className="text-neutral-600 text-sm text-center py-8">
            '진단 실행' 버튼을 클릭하여 비즈니스 로직을 검증하세요
          </div>
        ) : (
          diagnostics.map(diagnostic => (
            <div
              key={diagnostic.id}
              className={`px-4 py-3 rounded border ${getColorClass(diagnostic.type)} flex items-start gap-3`}
            >
              {getIcon(diagnostic.type)}
              <div className="flex-1">
                <p className="text-sm leading-relaxed">{diagnostic.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
