import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, AlertTriangle, Lightbulb, Zap, Target } from 'lucide-react';
import { SimulationResult, DiagnosticMessage } from '../types';
import { Slider } from './ui/slider';

interface SimulatorPanelProps {
  diagnostics: DiagnosticMessage[];
  simulationResult: SimulationResult | null;
  marketingBudget: number;
  onBudgetChange: (value: number) => void;
  isSimulating: boolean;
}

export function SimulatorPanel({
  diagnostics,
  simulationResult,
  marketingBudget,
  onBudgetChange,
  isSimulating,
}: SimulatorPanelProps) {
  const hasErrors = diagnostics.some(d => d.type === 'error');
  const hasWarnings = diagnostics.some(d => d.type === 'warning');
  
  const roi = simulationResult?.roi || 0;
  const isProfit = (simulationResult?.netProfit || 0) > 0;

  return (
    <div className={`
      h-72 flex border-t-2 transition-all
      ${hasErrors 
        ? 'bg-neutral-900 border-red-500' 
        : hasWarnings 
          ? 'bg-neutral-900 border-yellow-500' 
          : 'bg-neutral-900 border-neutral-700'
      }
    `}>
      {/* Left: Simulator Controls */}
      <div className="w-96 border-r border-neutral-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-5 h-5 text-blue-400" />
          <h3 className="text-white uppercase tracking-wider text-sm">실시간 시뮬레이터</h3>
        </div>

        <div className="space-y-6">
          {/* Marketing Budget Slider */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-neutral-400 text-sm">월 마케팅 예산</label>
              <span className="text-blue-400 text-xl font-bold">
                ₩{(marketingBudget / 10000).toFixed(0)}만
              </span>
            </div>
            <Slider
              value={[marketingBudget]}
              onValueChange={(values) => onBudgetChange(values[0])}
              min={100000}
              max={10000000}
              step={100000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>10만</span>
              <span>1,000만</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex gap-2">
            {[500000, 1000000, 3000000, 5000000].map(preset => (
              <button
                key={preset}
                onClick={() => onBudgetChange(preset)}
                className={`
                  flex-1 px-3 py-2 rounded text-xs transition-all font-medium
                  ${marketingBudget === preset 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50' 
                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                  }
                `}
              >
                {preset >= 1000000 ? `${preset / 1000000}백만` : `${preset / 10000}만`}
              </button>
            ))}
          </div>
        </div>

        {isSimulating && (
          <div className="mt-6 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
            <p className="text-xs text-neutral-500 mt-2">계산 중...</p>
          </div>
        )}
      </div>

      {/* Center: Results Dashboard */}
      <div className="flex-1 p-6">
        {simulationResult ? (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white uppercase tracking-wider text-sm">예상 결과</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs text-neutral-500">실시간 업데이트</span>
              </div>
            </div>
            
            <div className="grid grid-cols-5 gap-4 flex-1">
              {/* Revenue Card */}
              <div className="bg-neutral-800 rounded-xl p-4 border border-neutral-700 hover:border-blue-500 transition-all">
                <div className="flex items-center gap-2 text-neutral-400 text-xs mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span>매출</span>
                </div>
                <p className="text-2xl text-blue-400 mb-1">
                  ₩{(simulationResult.totalRevenue / 10000).toFixed(0)}만
                </p>
                <p className="text-xs text-neutral-500">
                  {simulationResult.totalRevenue.toLocaleString()}원
                </p>
              </div>

              {/* Users Card */}
              <div className="bg-neutral-800 rounded-xl p-4 border border-neutral-700 hover:border-purple-500 transition-all">
                <div className="flex items-center gap-2 text-neutral-400 text-xs mb-2">
                  <Users className="w-4 h-4" />
                  <span>전환 고객</span>
                </div>
                <p className="text-2xl text-purple-400 mb-1">
                  {simulationResult.projectedUsers.toLocaleString()}
                </p>
                <p className="text-xs text-neutral-500">명</p>
              </div>

              {/* Cost Card */}
              <div className="bg-neutral-800 rounded-xl p-4 border border-neutral-700 hover:border-orange-500 transition-all">
                <div className="flex items-center gap-2 text-neutral-400 text-xs mb-2">
                  <Target className="w-4 h-4" />
                  <span>총 비용</span>
                </div>
                <p className="text-2xl text-orange-400 mb-1">
                  ₩{(simulationResult.totalCost / 10000).toFixed(0)}만
                </p>
                <p className="text-xs text-neutral-500">
                  {simulationResult.totalCost.toLocaleString()}원
                </p>
              </div>

              {/* NET PROFIT - HERO CARD (2x size) */}
              <div className={`
                col-span-2 rounded-2xl p-6 border-2 transition-all
                ${isProfit 
                  ? 'bg-gradient-to-br from-green-950/50 to-green-900/30 border-green-500 shadow-xl shadow-green-500/20' 
                  : 'bg-gradient-to-br from-red-950/50 to-red-900/30 border-red-500 shadow-xl shadow-red-500/20'
                }
              `}>
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="flex items-center gap-3 mb-3">
                    {isProfit ? (
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-red-400" />
                    )}
                    <span className={`text-sm uppercase tracking-wider ${isProfit ? 'text-green-300' : 'text-red-300'}`}>
                      순수익
                    </span>
                  </div>
                  
                  <p className={`text-5xl font-black mb-2 ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                    {isProfit ? '+' : ''}₩{Math.abs(simulationResult.netProfit / 10000).toFixed(0)}만
                  </p>
                  
                  <p className={`text-sm mb-4 ${isProfit ? 'text-green-300/70' : 'text-red-300/70'}`}>
                    {simulationResult.netProfit.toLocaleString()}원
                  </p>
                  
                  {/* ROI Badge */}
                  <div className={`
                    px-4 py-2 rounded-full font-bold text-lg
                    ${roi > 100 
                      ? 'bg-green-500 text-white' 
                      : roi > 0 
                        ? 'bg-yellow-500 text-black'
                        : 'bg-red-500 text-white'
                    }
                  `}>
                    ROI {roi.toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-neutral-600">
            <div className="text-center">
              <Zap className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-sm">블록을 추가하고 연결하면<br />실시간으로 수익이 계산됩니다</p>
            </div>
          </div>
        )}
      </div>

      {/* Right: AI Tips */}
      <div className="w-80 border-l border-neutral-800 p-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <h3 className="text-white uppercase tracking-wider text-sm">AI 제안</h3>
        </div>

        <div className="space-y-3">
          {diagnostics.filter(d => d.type === 'error').map(diagnostic => (
            <div
              key={diagnostic.id}
              className="p-4 bg-red-950/30 border border-red-900 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300 leading-relaxed">{diagnostic.message}</p>
              </div>
            </div>
          ))}

          {diagnostics.filter(d => d.type === 'warning').map(diagnostic => (
            <div
              key={diagnostic.id}
              className="p-4 bg-yellow-950/20 border border-yellow-900 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-300 leading-relaxed">{diagnostic.message}</p>
              </div>
            </div>
          ))}

          {diagnostics.filter(d => d.type === 'suggestion').map(diagnostic => (
            <div
              key={diagnostic.id}
              className="p-4 bg-blue-950/20 border border-blue-900 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <Lightbulb className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-300 leading-relaxed">{diagnostic.message}</p>
              </div>
            </div>
          ))}

          {diagnostics.length === 0 && (
            <div className="p-4 bg-neutral-800 border border-neutral-700 rounded-xl text-center">
              <p className="text-sm text-neutral-500">
                블록을 추가하면<br />AI가 개선 방안을 제안합니다
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
