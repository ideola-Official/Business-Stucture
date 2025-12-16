# React 컴포넌트 (React Components)

## 📋 개요

이 폴더는 Business Structure 애플리케이션의 모든 React 컴포넌트를 포함합니다. 각 컴포넌트는 특정 UI 기능을 담당하며, 재사용성과 관심사의 분리 원칙을 따릅니다.

## 🏗️ 폴더 구조

```
components/
├── ui/                      # shadcn/ui 기반 재사용 UI 컴포넌트
│   ├── slider.tsx           # 슬라이더 입력
│   ├── button.tsx           # 버튼
│   ├── dialog.tsx           # 모달 다이얼로그
│   ├── select.tsx           # 드롭다운 선택
│   └── ... (35+ UI 컴포넌트)
│
├── Canvas.tsx               # 메인 캔버스 (블록 배치 및 연결)
├── Toolbox.tsx              # 블록 도구 상자
├── Inspector.tsx            # 블록 속성 편집 패널
├── SimulatorPanel.tsx       # 시뮬레이션 결과 패널
├── NodeComponent.tsx        # 개별 블록 컴포넌트
├── ConnectionLine.tsx       # 블록 간 연결선
├── Header.tsx               # 상단 헤더 바
└── Console.tsx              # 콘솔 출력 (디버깅용)
```

---

## 🎨 주요 컴포넌트 상세

### Canvas.tsx - 메인 캔버스

비즈니스 블록을 배치하고 연결하는 중심 작업 공간입니다.

#### Props
```typescript
interface CanvasProps {
  nodes: Node[];                    // 캔버스에 표시할 블록 배열
  connections: Connection[];        // 블록 간 연결 배열
  selectedNode: Node | null;        // 현재 선택된 블록
  simulationResult?: SimulationResult | null; // 시뮬레이션 결과
  profitStatus?: "profit" | "loss" | null; // 수익/손실 상태
  onNodeMove: (nodeId: string, position: {x, y}) => void; // 블록 이동 핸들러
  onSelectNode: (node: Node | null) => void; // 블록 선택 핸들러
  onAddConnection: (fromId: string, toId: string) => void; // 연결 추가
  onDeleteNode: (nodeId: string) => void; // 블록 삭제
  onDeleteConnection: (connectionId: string) => void; // 연결 삭제
  onUpdateConnectionRate?: (connId: string, rate: number) => void; // 전환율 수정
}
```

#### 주요 기능

##### 1. 드래그 앤 드롭
```typescript
const handleDrop = (e: DragEvent) => {
  const nodeType = e.dataTransfer.getData('nodeType');
  const canvas = e.currentTarget.getBoundingClientRect();
  const position = {
    x: e.clientX - canvas.left - 75,  // 블록 중심 조정
    y: e.clientY - canvas.top - 40
  };
  // Toolbox에서 드래그한 블록을 캔버스에 추가
};
```

**사용 흐름:**
1. Toolbox에서 블록 드래그 시작 → `onDragStart`에서 `nodeType` 데이터 설정
2. Canvas 위에서 드래그 → `onDragOver`로 드롭 허용
3. Canvas에 드롭 → `handleDrop`에서 위치 계산 후 블록 추가

##### 2. 캔버스 패닝 (뷰 이동)
```typescript
const [isPanning, setIsPanning] = useState(false);
const [bgOffset, setBgOffset] = useState({ x: 0, y: 0 });

const handleMouseDownCanvas = (e) => {
  // 빈 캔버스 클릭 시 패닝 시작
  if (e.target === e.currentTarget) {
    setIsPanning(true);
    panStart.current = { x: e.clientX - bgOffset.x, y: e.clientY - bgOffset.y };
  }
};

const handleMouseMove = (e) => {
  if (isPanning && panStart.current) {
    // 마우스 움직임에 따라 배경 그리드 이동
    setBgOffset({
      x: e.clientX - panStart.current.x,
      y: e.clientY - panStart.current.y
    });
  }
};
```

**효과:**
- 블록이 많아져 캔버스가 좁을 때 뷰 이동
- 배경 그리드도 함께 이동하여 자연스러운 느낌

##### 3. 연결선 그리기
```typescript
const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
const [tempLine, setTempLine] = useState<{x, y} | null>(null);

// 연결 시작 (NodeComponent에서 호출)
const handleStartConnection = (nodeId: string) => {
  setConnectingFrom(nodeId);
};

// 연결 완료
const handleEndConnection = (nodeId: string) => {
  if (connectingFrom && connectingFrom !== nodeId) {
    onAddConnection(connectingFrom, nodeId); // 부모에게 연결 생성 요청
  }
  setConnectingFrom(null);
  setTempLine(null);
};

// 마우스 이동 시 임시 연결선 표시
const handleMouseMove = (e) => {
  if (connectingFrom) {
    const canvas = e.currentTarget.getBoundingClientRect();
    setTempLine({
      x: e.clientX - canvas.left,
      y: e.clientY - canvas.top
    });
  }
};
```

**연결 프로세스:**
1. 출발 블록의 연결 핸들 드래그 시작
2. 마우스 이동 → 임시 연결선 표시 (점선)
3. 도착 블록에 드롭 → 실제 연결 생성

##### 4. SVG 연결선 렌더링
```typescript
<svg className="absolute inset-0 pointer-events-none">
  {connections.map((conn) => {
    const from = getNodeCenter(conn.from);
    const to = getNodeCenter(conn.to);
    
    return (
      <ConnectionLine
        key={conn.id}
        from={from}
        to={to}
        connection={conn}
        onDelete={onDeleteConnection}
        onUpdateConversionRate={onUpdateConnectionRate}
      />
    );
  })}
</svg>
```

**좌표 계산:**
```typescript
const getNodeCenter = (nodeId: string) => {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return { x: 0, y: 0 };
  return {
    x: node.position.x + 75,  // 블록 너비의 절반
    y: node.position.y + 40   // 블록 높이의 절반
  };
};
```

##### 5. 그리드 배경
```typescript
<div
  style={{
    backgroundImage: `
      linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
    `,
    backgroundSize: "20px 20px",
    backgroundPosition: `${bgOffset.x}px ${bgOffset.y}px`
  }}
>
```

**효과:**
- 20px 간격 격자 무늬
- 패닝 시 함께 이동하여 무한 캔버스 느낌

---

### Toolbox.tsx - 블록 도구 상자

사용 가능한 모든 블록 타입을 카테고리별로 표시합니다.

#### 블록 카테고리

```typescript
const nodeTypes: NodeType[] = [
  // 👥 Customer (보라색)
  { id: 'customer', label: '타겟 고객', category: 'customer', color: 'purple' },
  
  // 📣 Acquisition (주황색)
  { id: 'paid-ads', label: '유료 광고', category: 'acquisition', color: 'orange' },
  { id: 'seo-content', label: 'SEO/콘텐츠', category: 'acquisition', color: 'orange' },
  { id: 'referral', label: '바이럴/초대', category: 'acquisition', color: 'orange' },
  { id: 'email-campaign', label: '이메일 캠페인', category: 'acquisition', color: 'orange' },
  
  // ⚡ Activation (파란색)
  { id: 'landing', label: '랜딩 페이지', category: 'activation', color: 'blue' },
  { id: 'signup', label: '회원가입', category: 'activation', color: 'blue' },
  { id: 'lead-magnet', label: '리드 마그넷', category: 'activation', color: 'blue' },
  { id: 'consultation', label: '상담/문의', category: 'activation', color: 'blue' },
  { id: 'cart', label: '장바구니', category: 'activation', color: 'blue' },
  { id: 'trial', label: '무료 체험', category: 'activation', color: 'blue' },
  
  // 💰 Revenue (초록색)
  { id: 'one-time', label: '단건 판매', category: 'revenue', color: 'green' },
  { id: 'subscription', label: '정기 구독', category: 'revenue', color: 'green' },
  { id: 'commission', label: '중개 수수료', category: 'revenue', color: 'green' },
  { id: 'upsell', label: '프리미엄/업셀', category: 'revenue', color: 'green' },
  { id: 'ads-revenue', label: '광고 수익', category: 'revenue', color: 'green' },
  
  // 💸 Cost (빨간색)
  { id: 'labor-cost', label: '인건비', category: 'cost', color: 'red' },
  { id: 'infra-cost', label: '서버/툴 비용', category: 'cost', color: 'red' },
  { id: 'refund', label: '환불/취소', category: 'cost', color: 'red' },
  { id: 'marketing-fee', label: '마케팅 수수료', category: 'cost', color: 'red' },
  
  // 🔄 Retention (청록색)
  { id: 'retention', label: '재방문 캠페인', category: 'retention', color: 'cyan' },
];
```

#### 상호작용 방식

##### 1. 드래그 앤 드롭
```typescript
const handleDragStart = (e: DragEvent, type: string) => {
  e.dataTransfer.setData('nodeType', type);
};

<div
  draggable
  onDragStart={(e) => handleDragStart(e, nodeType.id)}
  className="cursor-grab active:cursor-grabbing"
>
```

##### 2. 클릭 추가
```typescript
const handleClick = (type: string) => {
  const canvas = canvasRef.current;
  if (canvas) {
    const rect = canvas.getBoundingClientRect();
    // 캔버스 중앙에 약간의 랜덤 오프셋을 더하여 배치
    const position = {
      x: rect.width / 2 - 100 + Math.random() * 200 - 100,
      y: rect.height / 2 - 60 + Math.random() * 120 - 60,
    };
    onAddNode(type, position);
  }
};
```

**랜덤 오프셋 이유:**
- 같은 타입을 여러 번 클릭해도 겹치지 않음
- ± 100px 범위로 분산 배치

---

### Inspector.tsx - 속성 편집 패널

선택된 블록의 속성을 편집하는 우측 사이드 패널입니다.

#### 주요 기능

##### 1. 블록 타입별 동적 폼 렌더링
```typescript
const renderFields = () => {
  switch (selectedNode.type) {
    case "customer":
      return <CustomerFields />;
    case "paid-ads":
      return <PaidAdsFields />;
    case "subscription":
      return <SubscriptionFields />;
    // ... 각 블록 타입마다 다른 입력 폼
  }
};
```

##### 2. 유료 광고 블록 예시
```typescript
case "paid-ads": {
  // 플랫폼별 CPC 프리셋
  const PLATFORM_CPC = {
    facebook: { label: "Facebook", cpc: 800 },
    instagram: { label: "Instagram", cpc: 900 },
    google: { label: "Google", cpc: 1500 },
    youtube: { label: "YouTube", cpc: 1200 },
  };

  const handlePlatformChange = (platform: string) => {
    const preset = PLATFORM_CPC[platform];
    if (preset) {
      // 플랫폼 선택 시 해당 평균 CPC 자동 설정
      onUpdateNode(selectedNode.id, { 
        platform, 
        cpc: preset.cpc 
      });
    }
  };

  // 예상 트래픽 실시간 계산
  const estimatedTraffic = selectedNode.data.cpc > 0
    ? Math.floor(selectedNode.data.dailyBudget / selectedNode.data.cpc)
    : 0;

  return (
    <>
      <SelectField 
        label="광고 매체"
        value={selectedNode.data.platform}
        onChange={handlePlatformChange}
        options={PLATFORM_CPC}
      />
      
      <NumberField
        label="일일 예산 (원)"
        value={selectedNode.data.dailyBudget}
        onChange={(v) => handleChange("dailyBudget", v)}
      />
      
      <NumberField
        label="클릭당 비용 CPC (원)"
        value={selectedNode.data.cpc}
        onChange={(v) => handleChange("cpc", v)}
        hint={`예상 일일 유입: ${estimatedTraffic}명`}
      />
      
      <SliderField
        label="클릭률 CTR (%)"
        value={selectedNode.data.ctr}
        onChange={(v) => handleChange("ctr", v)}
        min={0.1}
        max={5}
        step={0.1}
      />
    </>
  );
}
```

##### 3. 구독 모델 블록 예시
```typescript
case "subscription": {
  // LTV (Lifetime Value) 자동 계산
  const avgLifetime = selectedNode.data.churnRate > 0
    ? (100 / selectedNode.data.churnRate).toFixed(1)
    : "∞";
  
  const ltv = selectedNode.data.churnRate > 0
    ? (selectedNode.data.monthlyPrice * (100 / selectedNode.data.churnRate))
    : Infinity;

  return (
    <>
      <NumberField
        label="월 구독료 (원)"
        value={selectedNode.data.monthlyPrice}
        onChange={(v) => handleChange("monthlyPrice", v)}
      />
      
      <NumberField
        label="무료 체험 기간 (일)"
        value={selectedNode.data.freeTrialDays}
        onChange={(v) => handleChange("freeTrialDays", v)}
        hint={selectedNode.data.freeTrialDays > 0 ? "첫 달 매출 발생 지연" : "즉시 과금"}
      />
      
      <SliderField
        label="월 이탈률 Churn (%)"
        value={selectedNode.data.churnRate}
        onChange={(v) => handleChange("churnRate", v)}
        min={0}
        max={50}
        step={0.1}
        hint={`평균 구독 기간: ${avgLifetime}개월`}
      />
      
      {/* LTV 표시 카드 */}
      <div className="p-3 bg-green-950/30 border border-green-900 rounded">
        <div className="text-green-400 text-xs mb-1">
          예상 LTV (고객 생애 가치)
        </div>
        <p className="text-green-300 text-lg">
          ₩{ltv.toLocaleString()}
        </p>
      </div>
    </>
  );
}
```

**LTV 계산 공식:**
```
평균 구독 기간 = 100 / 이탈률
예: 이탈률 5% → 100 / 5 = 20개월

LTV = 월 구독료 × 평균 구독 기간
예: 9,900원 × 20개월 = 198,000원
```

##### 4. 벤치마크 경고
```typescript
const BENCHMARKS = {
  conversionRate: { min: 1, max: 30, avg: 10 },
  churnRate: { min: 3, max: 15, avg: 7 },
  ctr: { min: 0.5, max: 5, avg: 1.5 },
};

const getBenchmarkWarning = (field: string, value: number): string | null => {
  const benchmark = BENCHMARKS[field];
  if (!benchmark) return null;

  if (value < benchmark.min) {
    return `너무 낮습니다. 평균: ${benchmark.avg}%`;
  }
  if (value > benchmark.max) {
    return `너무 낙관적입니다. 평균: ${benchmark.avg}%`;
  }
  return null;
};
```

**경고 표시:**
```typescript
<SliderField
  label="전환율 (%)"
  value={selectedNode.data.conversionRate}
  onChange={(v) => handleChange("conversionRate", v)}
  warning={getBenchmarkWarning("conversionRate", selectedNode.data.conversionRate)}
/>
```

---

### SimulatorPanel.tsx - 시뮬레이션 결과 패널

하단에 표시되는 시뮬레이션 결과 및 AI 제안 패널입니다.

#### 레이아웃 구조

```
┌────────────────────────────────────────────────────────────────┐
│  Simulator Panel (h-72)                                        │
├──────────────┬─────────────────────────────┬───────────────────┤
│              │                             │                   │
│  마케팅 예산  │      예상 결과               │    AI 제안         │
│  조절        │   (매출/비용/순이익/ROI)      │    (진단 메시지)    │
│              │                             │                   │
│  (w-96)      │      (flex-1)               │    (w-80)         │
└──────────────┴─────────────────────────────┴───────────────────┘
```

#### 주요 섹션

##### 1. 마케팅 예산 조절 (왼쪽)
```typescript
<Slider
  value={[marketingBudget]}
  onValueChange={(values) => onBudgetChange(values[0])}
  min={100000}
  max={10000000}
  step={100000}
/>

{/* 빠른 프리셋 버튼 */}
{[500000, 1000000, 3000000, 5000000].map(preset => (
  <button
    onClick={() => onBudgetChange(preset)}
    className={marketingBudget === preset ? 'bg-blue-600' : 'bg-neutral-800'}
  >
    {preset >= 1000000 ? `${preset / 1000000}백만` : `${preset / 10000}만`}
  </button>
))}
```

**동작:**
- 슬라이더 또는 프리셋 버튼 클릭 시 `onBudgetChange` 호출
- App.tsx에서 `marketingBudget` 상태 업데이트
- `useEffect`가 감지하여 시뮬레이션 자동 재실행

##### 2. 예상 결과 대시보드 (중앙)
```typescript
<div className="grid grid-cols-5 gap-4">
  {/* 매출 카드 */}
  <div className="bg-neutral-800 rounded-xl p-4">
    <div className="text-neutral-400 text-xs">매출</div>
    <p className="text-2xl text-blue-400">
      ₩{(simulationResult.totalRevenue / 10000).toFixed(0)}만
    </p>
  </div>

  {/* 전환 고객 카드 */}
  <div className="bg-neutral-800 rounded-xl p-4">
    <div className="text-neutral-400 text-xs">전환 고객</div>
    <p className="text-2xl text-purple-400">
      {simulationResult.projectedUsers.toLocaleString()}
    </p>
  </div>

  {/* 총 비용 카드 */}
  <div className="bg-neutral-800 rounded-xl p-4">
    <div className="text-neutral-400 text-xs">총 비용</div>
    <p className="text-2xl text-orange-400">
      ₩{(simulationResult.totalCost / 10000).toFixed(0)}만
    </p>
  </div>

  {/* 순수익 카드 (2x 크기, 하이라이트) */}
  <div className={`
    col-span-2 rounded-2xl p-6
    ${isProfit 
      ? 'bg-gradient-to-br from-green-950/50 to-green-900/30 border-green-500' 
      : 'bg-gradient-to-br from-red-950/50 to-red-900/30 border-red-500'
    }
  `}>
    <p className={`text-5xl font-black ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
      {isProfit ? '+' : ''}₩{Math.abs(simulationResult.netProfit / 10000).toFixed(0)}만
    </p>
    
    <div className={`px-4 py-2 rounded-full font-bold ${roi > 100 ? 'bg-green-500' : roi > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}>
      ROI {roi.toFixed(0)}%
    </div>
  </div>
</div>
```

**ROI 색상 로직:**
- ROI > 100%: 초록색 (매우 좋음)
- ROI > 0%: 노란색 (수익이지만 낮음)
- ROI < 0%: 빨간색 (손실)

##### 3. AI 제안 (우측)
```typescript
{/* 에러 메시지 (빨간색) */}
{diagnostics.filter(d => d.type === 'error').map(diagnostic => (
  <div className="p-4 bg-red-950/30 border border-red-900 rounded-xl">
    <AlertTriangle className="w-4 h-4 text-red-400" />
    <p className="text-sm text-red-300">{diagnostic.message}</p>
  </div>
))}

{/* 경고 메시지 (노란색) */}
{diagnostics.filter(d => d.type === 'warning').map(diagnostic => (
  <div className="p-4 bg-yellow-950/20 border border-yellow-900 rounded-xl">
    <AlertTriangle className="w-4 h-4 text-yellow-400" />
    <p className="text-sm text-yellow-300">{diagnostic.message}</p>
  </div>
))}

{/* 제안 메시지 (파란색) */}
{diagnostics.filter(d => d.type === 'suggestion').map(diagnostic => (
  <div className="p-4 bg-blue-950/20 border border-blue-900 rounded-xl">
    <Lightbulb className="w-4 h-4 text-blue-400" />
    <p className="text-sm text-blue-300">{diagnostic.message}</p>
  </div>
))}
```

**메시지 우선순위:**
1. **Error**: 치명적 문제 (예: 수익 모델 없음)
2. **Warning**: 개선 필요 (예: 전환율 낮음)
3. **Suggestion**: 최적화 제안 (예: 구독 모델 추가)

---

### NodeComponent.tsx - 개별 블록 컴포넌트

캔버스에 표시되는 각 블록의 시각적 표현입니다.

#### 주요 기능

##### 1. 드래그 가능한 블록
```typescript
const [isDragging, setIsDragging] = useState(false);
const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

const handleMouseDown = (e: MouseEvent) => {
  if (e.button !== 0) return; // 좌클릭만
  setIsDragging(true);
  setDragOffset({
    x: e.clientX - node.position.x,
    y: e.clientY - node.position.y
  });
  onSelect(node);
};

const handleMouseMove = (e: MouseEvent) => {
  if (isDragging) {
    onMove(node.id, {
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  }
};
```

##### 2. 상태 표시
```typescript
const getStatusColor = (status?: Node['status']) => {
  switch (status) {
    case 'healthy': return 'border-green-500';
    case 'warning': return 'border-yellow-500';
    case 'critical': return 'border-red-500';
    case 'inactive': return 'border-neutral-600';
    default: return 'border-neutral-700';
  }
};
```

##### 3. 연결 핸들
```typescript
{/* 우측 하단 연결 핸들 */}
<div
  className="absolute bottom-2 right-2 w-4 h-4 bg-blue-500 rounded-full cursor-pointer hover:scale-125 transition-transform"
  onMouseDown={(e) => {
    e.stopPropagation();
    onStartConnection(node.id);
  }}
  onMouseUp={(e) => {
    e.stopPropagation();
    onEndConnection(node.id);
  }}
/>
```

---

### ConnectionLine.tsx - 연결선 컴포넌트

SVG를 사용하여 블록 간 연결을 시각화합니다.

#### 베지어 곡선 경로
```typescript
const path = `
  M ${from.x} ${from.y}
  C ${from.x + (to.x - from.x) / 2} ${from.y},
    ${to.x - (to.x - from.x) / 2} ${to.y},
    ${to.x} ${to.y}
`;

<path
  d={path}
  stroke={getConnectionColor(connection.type)}
  strokeWidth="3"
  fill="none"
  markerEnd="url(#arrowhead)"
/>
```

**베지어 곡선 제어점:**
- 시작: `(from.x, from.y)`
- 제어점1: `(from.x + dx/2, from.y)` - 가로로 절반 이동
- 제어점2: `(to.x - dx/2, to.y)` - 가로로 절반 이동
- 끝: `(to.x, to.y)`

**결과:** 부드러운 S자 곡선

#### 타입별 색상
```typescript
const getConnectionColor = (type?: Connection['type']) => {
  switch (type) {
    case 'traffic': return '#3b82f6';  // 파란색 (사용자 흐름)
    case 'money': return '#22c55e';    // 초록색 (수익)
    case 'cost': return '#ef4444';     // 빨간색 (비용)
    case 'data': return '#a855f7';     // 보라색 (데이터)
    default: return '#6b7280';         // 회색
  }
};
```

#### 전환율 라벨
```typescript
{connection.metrics && (
  <text
    x={(from.x + to.x) / 2}
    y={(from.y + to.y) / 2 - 10}
    className="text-xs fill-white"
    textAnchor="middle"
  >
    {connection.metrics.conversionRate.toFixed(1)}%
  </text>
)}
```

---

## 🎨 UI 컴포넌트 라이브러리 (ui 폴더)

### shadcn/ui 기반
- Radix UI를 기반으로 한 접근성 높은 컴포넌트
- Tailwind CSS로 스타일링
- 완전히 커스터마이징 가능

### 주요 컴포넌트

#### Slider (slider.tsx)
범위 입력 컨트롤
```typescript
<Slider
  value={[value]}
  onValueChange={(values) => onChange(values[0])}
  min={0}
  max={100}
  step={1}
/>
```

#### Button (button.tsx)
다양한 변형의 버튼
```typescript
<Button variant="default">기본</Button>
<Button variant="destructive">삭제</Button>
<Button variant="outline">외곽선</Button>
<Button variant="ghost">고스트</Button>
```

#### Dialog (dialog.tsx)
모달 대화상자
```typescript
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger>열기</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>제목</DialogTitle>
    </DialogHeader>
    <DialogDescription>내용...</DialogDescription>
  </DialogContent>
</Dialog>
```

---

## 🔄 컴포넌트 간 데이터 흐름

### 상향식 데이터 흐름 (Bottom-Up)
```
NodeComponent (블록 이동)
  → Canvas.onNodeMove
  → App.handleNodeMove
  → setNodes 상태 업데이트
  → Canvas 리렌더링
  → NodeComponent 새 위치로 표시
```

### 하향식 데이터 흐름 (Top-Down)
```
App (시뮬레이션 실행)
  → setSimulationResult
  → Canvas props 업데이트
  → ConnectionLine에 metrics 전달
  → 연결선에 트래픽 수치 표시
```

---

## 🎯 컴포넌트 설계 원칙

### 1. 단일 책임 원칙
- 각 컴포넌트는 하나의 기능만 담당
- 예: `Toolbox`는 블록 목록 표시만, 추가 로직은 부모에게 위임

### 2. Props Drilling 최소화
- 깊은 중첩 시 Context API 고려
- 예: `ThemeContext`, `AppStateContext`

### 3. 재사용성
- UI 컴포넌트는 `ui/` 폴더에 분리
- 비즈니스 로직 분리

### 4. 타입 안정성
- 모든 Props는 TypeScript 인터페이스로 정의
- `types.ts`에서 공통 타입 공유

---

**컴포넌트 개발 체크리스트:**
- ✅ Props 인터페이스 정의
- ✅ 기본값 설정 (defaultProps 또는 구조 분해)
- ✅ 이벤트 핸들러 `useCallback`으로 메모이제이션
- ✅ 불필요한 리렌더링 방지 (`React.memo`, `useMemo`)
- ✅ 접근성 속성 추가 (ARIA 라벨, 키보드 네비게이션)
- ✅ 로딩/에러 상태 처리
- ✅ 반응형 디자인 고려








