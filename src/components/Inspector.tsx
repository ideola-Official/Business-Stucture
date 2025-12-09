import React, { useState } from "react";
import { Node } from "../types";
import {
  Settings,
  Zap,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Slider } from "./ui/slider";
import { Toggle } from "./ui/toggle";

interface InspectorProps {
  selectedNode: Node | null;
  onUpdateNode: (nodeId: string, data: any) => void;
}

const PLATFORM_CPC: Record<string, { label: string; cpc: number }> = {
  facebook: { label: "Facebook", cpc: 800 },
  instagram: { label: "Instagram", cpc: 900 },
  google: { label: "Google", cpc: 1500 },
  youtube: { label: "YouTube", cpc: 1200 },
};

// Benchmark warnings
const BENCHMARKS = {
  conversionRate: { min: 1, max: 30, avg: 10 },
  churnRate: { min: 3, max: 15, avg: 7 },
  ctr: { min: 0.5, max: 5, avg: 1.5 },
};

export function Inspector({ selectedNode, onUpdateNode }: InspectorProps) {
  if (!selectedNode) {
    return (
      <aside className="w-80 bg-neutral-900 border-l border-neutral-800 p-6">
        <div className="flex items-center gap-2 text-neutral-500 mb-4">
          <Settings className="w-4 h-4" />
          <h2 className="text-sm">속성 패널</h2>
        </div>
        <div className="text-neutral-600 text-sm text-center mt-12">
          블록을 선택하면
          <br />
          속성을 편집할 수 있습니다
        </div>
      </aside>
    );
  }

  const handleChange = (field: string, value: any) => {
    onUpdateNode(selectedNode.id, { [field]: value });
  };

  const getBenchmarkWarning = (field: string, value: number): string | null => {
    const benchmark = BENCHMARKS[field as keyof typeof BENCHMARKS];
    if (!benchmark) return null;

    if (value < benchmark.min) {
      return `너무 낮습니다. 평균: ${benchmark.avg}%`;
    }
    if (value > benchmark.max) {
      return `너무 낙관적입니다. 평균: ${benchmark.avg}%`;
    }
    return null;
  };

  const renderFields = () => {
    switch (selectedNode.type) {
      case "customer":
        return (
          <>
            <FormField
              label="타겟 명칭"
              value={selectedNode.data.name}
              onChange={(v) => handleChange("name", v)}
            />
            <FormField
              label="페르소나 요약"
              value={selectedNode.data.segment}
              onChange={(v) => handleChange("segment", v)}
              placeholder="예: 시간은 없고 돈으로 해결하려는 성향"
              multiline
            />

            <div className="pt-4 border-t border-neutral-800">
              <h4 className="text-xs text-blue-400 mb-3 flex items-center gap-2">
                <Zap className="w-3 h-3" />
                시뮬레이션 변수
              </h4>

              <FormField
                label="시장 규모 (TAM/SAM)"
                type="number"
                value={selectedNode.data.marketSize}
                onChange={(v) => handleChange("marketSize", Number(v))}
                hint="도달 가능한 최대 인원"
              />

              <FormField
                label="최대 지불 의사 (원)"
                type="number"
                value={selectedNode.data.willingnessToPay}
                onChange={(v) => handleChange("willingnessToPay", Number(v))}
                hint="이보다 높으면 구매율 0%"
              />

              <SliderField
                label="문제의 시급성"
                value={selectedNode.data.urgency}
                onChange={(v) => handleChange("urgency", v)}
                min={1}
                max={5}
                step={1}
                hint="마케팅 반응률 가중치"
              />
            </div>
          </>
        );

      case "paid-ads": {
        const warningCtr = getBenchmarkWarning("ctr", selectedNode.data.ctr);

        const handlePlatformChange = (platform: string) => {
          const preset = PLATFORM_CPC[platform];
          if (preset) {
            onUpdateNode(selectedNode.id, { platform, cpc: preset.cpc });
          } else {
            onUpdateNode(selectedNode.id, { platform });
          }
        };

        const estimatedTraffic =
          selectedNode.data.cpc > 0
            ? Math.floor(
                (selectedNode.data.dailyBudget || 0) / selectedNode.data.cpc
              )
            : 0;

        return (
          <>
            <FormField
              label="채널명"
              value={selectedNode.data.name}
              onChange={(v) => handleChange("name", v)}
            />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-neutral-400 text-xs mb-2">
                  광고 매체
                </label>
                <select
                  value={selectedNode.data.platform}
                  onChange={(e) => handlePlatformChange(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  {Object.entries(PLATFORM_CPC).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.label}
                    </option>
                  ))}
                </select>
                <p className="text-neutral-500 text-xs mt-1">
                  매체별 평균 CPC를 자동 채움
                </p>
              </div>

              <div className="flex items-end">
                <Toggle
                  checked={selectedNode.data.campaignOn}
                  onCheckedChange={(checked) =>
                    handleChange("campaignOn", checked)
                  }
                  label={
                    selectedNode.data.campaignOn ? "캠페인 ON" : "캠페인 OFF"
                  }
                />
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800 space-y-3">
              <h4 className="text-xs text-blue-400 mb-1 flex items-center gap-2">
                <Zap className="w-3 h-3" />
                시뮬레이션 변수
              </h4>

              <FormField
                label="일일 예산 (원)"
                type="number"
                value={selectedNode.data.dailyBudget}
                onChange={(v) => handleChange("dailyBudget", Number(v))}
              />

              <FormField
                label="클릭당 비용 CPC (원)"
                type="number"
                value={selectedNode.data.cpc}
                onChange={(v) => handleChange("cpc", Number(v))}
                hint={`예상 일일 유입: ${estimatedTraffic}명`}
              />

              <SliderField
                label="클릭률 CTR (%)"
                value={selectedNode.data.ctr}
                onChange={(v) => handleChange("ctr", v)}
                min={0.1}
                max={5}
                step={0.1}
                warning={warningCtr}
                hint="소재/타겟에 따라 자동 보정"
              />

              <div>
                <label className="block text-neutral-400 text-xs mb-2">
                  휘발성
                </label>
                <select
                  value={selectedNode.data.volatility}
                  onChange={(e) => handleChange("volatility", e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="high">High - 중단 시 즉시 0</option>
                  <option value="low">Low - 서서히 감소</option>
                </select>
              </div>
            </div>
          </>
        );
      }

      case "seo-content": {
        const rank = selectedNode.data.expectedRank || 3;
        const rankCtr =
          rank <= 1
            ? 30
            : rank <= 3
            ? 10
            : rank <= 5
            ? 5
            : rank <= 10
            ? 1
            : 0.5;
        return (
          <>
            <FormField
              label="콘텐츠/SEO 이름"
              value={selectedNode.data.name}
              onChange={(v) => handleChange("name", v)}
            />

            <div className="pt-4 border-t border-neutral-800 space-y-3">
              <h4 className="text-xs text-blue-400 mb-1 flex items-center gap-2">
                <Zap className="w-3 h-3" />
                시뮬레이션 변수
              </h4>

              <FormField
                label="타겟 키워드 월 검색량"
                type="number"
                value={selectedNode.data.monthlySearchVolume}
                onChange={(v) => handleChange("monthlySearchVolume", Number(v))}
              />

              <SliderField
                label="예상 노출 순위 (1~10)"
                value={selectedNode.data.expectedRank}
                onChange={(v) => handleChange("expectedRank", v)}
                min={1}
                max={10}
                step={1}
                hint={`순위별 CTR 추정: ${rankCtr}%`}
              />

              <FormField
                label="월 콘텐츠 발행 수 (개)"
                type="number"
                value={selectedNode.data.contentCount}
                onChange={(v) => handleChange("contentCount", Number(v))}
              />

              <FormField
                label="건당 제작비 (원)"
                type="number"
                value={selectedNode.data.costPerContent}
                onChange={(v) => handleChange("costPerContent", Number(v))}
                hint={`월 비용: ₩${(
                  (selectedNode.data.contentCount || 0) *
                  (selectedNode.data.costPerContent || 0)
                ).toLocaleString()}`}
              />

              <SliderField
                label="트래픽 유지율 (%)"
                value={selectedNode.data.retentionRate}
                onChange={(v) => handleChange("retentionRate", v)}
                min={50}
                max={100}
                step={1}
                hint="Evergreen 콘텐츠일수록 높음"
              />

              <SliderField
                label="롱테일 유입 가중치"
                value={selectedNode.data.longTailFactor}
                onChange={(v) => handleChange("longTailFactor", v)}
                min={0}
                max={1}
                step={0.05}
                hint="콘텐츠 누적 시 추가 유입 비율"
              />
            </div>
          </>
        );
      }

      case "referral": {
        const kFactor = selectedNode.data.kFactor;
        const reward = selectedNode.data.rewardCost;
        const rewardWarning =
          reward > 10000 ? "CAC가 높아질 수 있습니다" : null;
        return (
          <>
            <FormField
              label="캠페인 명"
              value={selectedNode.data.name}
              onChange={(v) => handleChange("name", v)}
            />

            <div className="pt-4 border-t border-neutral-800 space-y-3">
              <h4 className="text-xs text-blue-400 mb-1 flex items-center gap-2">
                <Zap className="w-3 h-3" />
                시뮬레이션 변수
              </h4>

              <SliderField
                label="바이럴 계수 K-Factor"
                value={kFactor}
                onChange={(v) => handleChange("kFactor", v)}
                min={0}
                max={2}
                step={0.05}
                hint="1.0 이상이면 기하급수 성장"
              />

              <FormField
                label="초대 보상금 (원)"
                type="number"
                value={reward}
                onChange={(v) => handleChange("rewardCost", Number(v))}
                hint="친구 초대 시 지급하는 쿠폰/포인트"
              />
              {rewardWarning && (
                <p className="text-yellow-400 text-xs">⚠️ {rewardWarning}</p>
              )}

              <FormField
                label="초대 주기 (일)"
                type="number"
                value={selectedNode.data.inviteCycleDays}
                onChange={(v) => handleChange("inviteCycleDays", Number(v))}
              />

              <FormField
                label="최대 초대 제한 (명)"
                type="number"
                value={selectedNode.data.inviteCap}
                onChange={(v) => handleChange("inviteCap", Number(v))}
                hint="어뷰징 방지를 위한 캡"
              />
            </div>
          </>
        );
      }

      case "email-campaign": {
        return (
          <>
            <FormField
              label="캠페인 명"
              value={selectedNode.data.name}
              onChange={(v) => handleChange("name", v)}
            />

            <div className="pt-4 border-t border-neutral-800 space-y-3">
              <h4 className="text-xs text-blue-400 mb-1 flex items-center gap-2">
                <Zap className="w-3 h-3" />
                시뮬레이션 변수
              </h4>

              <FormField
                label="보유 DB 수 (명)"
                type="number"
                value={selectedNode.data.listSize}
                onChange={(v) => handleChange("listSize", Number(v))}
              />

              <SliderField
                label="오픈율 (%)"
                value={selectedNode.data.openRate}
                onChange={(v) => handleChange("openRate", v)}
                min={0}
                max={100}
                step={1}
                hint="제목/발신명 개선으로 상승 가능"
              />

              <SliderField
                label="클릭률 CTR (%)"
                value={selectedNode.data.clickRate}
                onChange={(v) => handleChange("clickRate", v)}
                min={0}
                max={30}
                step={0.5}
                hint="콘텐츠/CTA 품질에 따라 변동"
              />

              <FormField
                label="발송 솔루션 비용 (원/월)"
                type="number"
                value={selectedNode.data.sendCost}
                onChange={(v) => handleChange("sendCost", Number(v))}
              />

              <FormField
                label="발송 빈도 (월 N회)"
                type="number"
                value={selectedNode.data.frequencyPerMonth}
                onChange={(v) => handleChange("frequencyPerMonth", Number(v))}
                hint="너무 높으면 이탈률 상승 페널티"
              />
            </div>
          </>
        );
      }

      case "landing":
      case "signup":
        const warningConv = getBenchmarkWarning(
          "conversionRate",
          selectedNode.data.conversionRate
        );

        return (
          <>
            <FormField
              label="단계 명칭"
              value={selectedNode.data.name}
              onChange={(v) => handleChange("name", v)}
            />

            <div className="pt-4 border-t border-neutral-800">
              <h4 className="text-xs text-blue-400 mb-3 flex items-center gap-2">
                <Zap className="w-3 h-3" />
                시뮬레이션 변수
              </h4>

              <SliderField
                label="목표 전환율 (%)"
                value={selectedNode.data.conversionRate}
                onChange={(v) => handleChange("conversionRate", v)}
                min={0.1}
                max={100}
                step={0.1}
                warning={warningConv}
                hint={`이탈률: ${(
                  100 - selectedNode.data.conversionRate
                ).toFixed(1)}%`}
              />

              <div>
                <label className="block text-neutral-400 text-xs mb-2">
                  복잡도
                </label>
                <select
                  value={selectedNode.data.complexity}
                  onChange={(e) => handleChange("complexity", e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="low">Low - 소셜 로그인</option>
                  <option value="mid">Mid - 이메일 가입</option>
                  <option value="high">High - 본인인증 필수</option>
                </select>
                {selectedNode.data.complexity === "high" && (
                  <p className="text-yellow-400 text-xs mt-1">
                    ⚠️ 전환율 -20% 패널티
                  </p>
                )}
              </div>
            </div>
          </>
        );

      case "feature":
        return (
          <>
            <FormField
              label="기능명"
              value={selectedNode.data.name}
              onChange={(v) => handleChange("name", v)}
            />
            <FormField
              label="설명"
              value={selectedNode.data.description}
              onChange={(v) => handleChange("description", v)}
              multiline
            />
          </>
        );

      case "payment":
        const margin = selectedNode.data.price - selectedNode.data.cogs;
        const marginRate =
          selectedNode.data.price > 0
            ? (margin / selectedNode.data.price) * 100
            : 0;

        return (
          <>
            <FormField
              label="결제 유형"
              value={selectedNode.data.name}
              onChange={(v) => handleChange("name", v)}
            />

            <div className="pt-4 border-t border-neutral-800">
              <h4 className="text-xs text-blue-400 mb-3 flex items-center gap-2">
                <Zap className="w-3 h-3" />
                가격 설정
              </h4>

              <FormField
                label="판매 가격 (원)"
                type="number"
                value={selectedNode.data.price}
                onChange={(v) => handleChange("price", Number(v))}
              />

              <FormField
                label="원가 COGS (원)"
                type="number"
                value={selectedNode.data.cogs}
                onChange={(v) => handleChange("cogs", Number(v))}
                hint={`마진: ₩${margin.toLocaleString()} (${marginRate.toFixed(
                  1
                )}%)`}
              />

              <SliderField
                label="재구매율 (%)"
                value={selectedNode.data.repurchaseRate}
                onChange={(v) => handleChange("repurchaseRate", v)}
                min={0}
                max={100}
                step={1}
                hint="다음 달 예상 매출에 반영"
              />

              <FormField
                label="PG 수수료 (%)"
                type="number"
                value={selectedNode.data.fee}
                onChange={(v) => handleChange("fee", Number(v))}
                step="0.1"
              />
            </div>
          </>
        );

      case "subscription":
        const warningChurn = getBenchmarkWarning(
          "churnRate",
          selectedNode.data.churnRate
        );
        const avgLifetime =
          selectedNode.data.churnRate > 0
            ? (100 / selectedNode.data.churnRate).toFixed(1)
            : "∞";
        const ltv =
          selectedNode.data.churnRate > 0
            ? (
                selectedNode.data.monthlyPrice *
                (100 / selectedNode.data.churnRate)
              ).toFixed(0)
            : "∞";

        return (
          <>
            <FormField
              label="구독 플랜"
              value={selectedNode.data.name}
              onChange={(v) => handleChange("name", v)}
            />

            <div className="pt-4 border-t border-neutral-800">
              <h4 className="text-xs text-blue-400 mb-3 flex items-center gap-2">
                <Zap className="w-3 h-3" />
                구독 설정
              </h4>

              <FormField
                label="월 구독료 (원)"
                type="number"
                value={selectedNode.data.monthlyPrice}
                onChange={(v) => handleChange("monthlyPrice", Number(v))}
              />

              <FormField
                label="무료 체험 기간 (일)"
                type="number"
                value={selectedNode.data.freeTrialDays}
                onChange={(v) => handleChange("freeTrialDays", Number(v))}
                hint={
                  selectedNode.data.freeTrialDays > 0
                    ? "첫 달 매출 발생 지연"
                    : "즉시 과금"
                }
              />

              <SliderField
                label="월 이탈률 Churn (%)"
                value={selectedNode.data.churnRate}
                onChange={(v) => handleChange("churnRate", v)}
                min={0}
                max={50}
                step={0.1}
                warning={warningChurn}
                hint={`평균 구독 기간: ${avgLifetime}개월`}
              />

              <div className="p-3 bg-green-950/30 border border-green-900 rounded mt-3">
                <div className="flex items-center gap-2 text-green-400 text-xs mb-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>예상 LTV (고객 생애 가치)</span>
                </div>
                <p className="text-green-300 text-lg">
                  ₩
                  {typeof ltv === "string" ? ltv : Number(ltv).toLocaleString()}
                </p>
              </div>
            </div>
          </>
        );

      default:
        return (
          <FormField
            label="이름"
            value={selectedNode.data.name}
            onChange={(v) => handleChange("name", v)}
          />
        );
    }
  };

  return (
    <aside className="w-80 bg-neutral-900 border-l border-neutral-800 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center gap-2 text-neutral-300 mb-6">
          <Settings className="w-4 h-4" />
          <h2 className="text-sm">속성 편집</h2>
        </div>

        <div className="mb-4 pb-4 border-b border-neutral-800">
          <span className="text-xs text-neutral-500 uppercase tracking-wide">
            블록 타입
          </span>
          <p className="text-white mt-1">{selectedNode.type}</p>
        </div>

        <div className="space-y-4">{renderFields()}</div>

        <div className="mt-6 p-3 bg-neutral-800 rounded text-xs text-neutral-400 leading-relaxed">
          <strong className="text-neutral-300">Tip:</strong> 슬라이더를 움직이면
          실시간으로 시뮬레이션이 업데이트됩니다.
        </div>
      </div>
    </aside>
  );
}

interface FormFieldProps {
  label: string;
  value: any;
  onChange: (value: any) => void;
  type?: string;
  placeholder?: string;
  step?: string;
  multiline?: boolean;
  hint?: string;
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  step,
  multiline,
  hint,
}: FormFieldProps) {
  return (
    <div>
      <label className="block text-neutral-400 text-xs mb-2">{label}</label>
      {multiline ? (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
          rows={3}
        />
      ) : (
        <input
          type={type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          step={step}
          className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
        />
      )}
      {hint && <p className="text-neutral-500 text-xs mt-1">{hint}</p>}
    </div>
  );
}

interface SliderFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  hint?: string;
  warning?: string | null;
  feedback?: (value: number) => string | null; // Real-time feedback function
}

function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  hint,
  warning,
  feedback,
}: SliderFieldProps) {
  const [recentChange, setRecentChange] = useState(null as string | null);

  const handleChange = (newValue: number) => {
    onChange(newValue);

    // Show feedback for change
    if (feedback) {
      const feedbackMsg = feedback(newValue);
      if (feedbackMsg) {
        setRecentChange(feedbackMsg);
        setTimeout(() => setRecentChange(null), 3000);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-neutral-400 text-xs">{label}</label>
        <span className="text-white text-sm font-semibold">
          {value.toFixed(step >= 1 ? 0 : 1)}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(values) => handleChange(values[0])}
        min={min}
        max={max}
        step={step}
        className="w-full mb-1"
      />
      {warning && (
        <div className="flex items-center gap-1 text-yellow-400 text-xs mt-1">
          <AlertTriangle className="w-3 h-3" />
          <span>{warning}</span>
        </div>
      )}
      {recentChange && (
        <div className="flex items-center gap-1 text-green-400 text-xs mt-1 animate-pulse">
          <TrendingUp className="w-3 h-3" />
          <span>{recentChange}</span>
        </div>
      )}
      {hint && !warning && !recentChange && (
        <p className="text-neutral-500 text-xs mt-1">{hint}</p>
      )}
    </div>
  );
}
