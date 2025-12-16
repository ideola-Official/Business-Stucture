# 유틸리티 함수 (Utility Functions)

## 📋 개요

이 폴더는 비즈니스 로직과 시뮬레이션 엔진을 포함합니다. UI와 독립적으로 작동하며, 순수 함수로 구현되어 테스트가 용이합니다.

## 📄 파일 목록

```
utils/
├── businessLogic.ts    # 비즈니스 구조 진단 엔진
└── simulator.ts        # 수익 시뮬레이션 엔진
```

---

## 🔍 businessLogic.ts - 비즈니스 진단 엔진

### 주요 함수

#### analyzeBusiness()
비즈니스 모델의 구조적 문제를 자동으로 탐지하고 개선 제안을 생성합니다.

```typescript
export function analyzeBusiness(
  nodes: Node[], 
  connections: Connection[]
): DiagnosticMessage[]
```

**매개변수:**
- `nodes`: 현재 캔버스의 모든 블록
- `connections`: 블록 간 연결

**반환값:**
- `DiagnosticMessage[]`: 진단 메시지 배열

**DiagnosticMessage 구조:**
```typescript
interface DiagnosticMessage {
  id: string;                           // 고유 ID (예: "diag-0")
  type: 'error' | 'warning' | 'suggestion' | 'tip'; // 심각도
  message: string;                      // 사용자에게 표시할 메시지
  nodeId?: string;                      // 관련 블록 ID (선택)
  priority?: 'high' | 'medium' | 'low'; // 우선순위 (선택)
}
```

---

### 진단 로직 상세

#### 1. 빈 캔버스 체크
```typescript
if (nodes.length === 0) {
  diagnostics.push({
    id: `diag-${messageId++}`,
    type: 'error',
    message: '비즈니스 블록이 없습니다. 최소 1개 이상의 블록을 추가하세요.',
  });
  return diagnostics;
}
```

**목적:** 최소한의 블록이 있어야 분석 가능

---

#### 2. 수익 모델 존재 여부
```typescript
const hasRevenueModel = nodes.some(node => 
  node.type === 'payment' || node.type === 'subscription'
);

if (!hasRevenueModel) {
  diagnostics.push({
    id: `diag-${messageId++}`,
    type: 'error',
    message: '수익 모델이 없습니다. "일회성 결제" 또는 "구독 모델" 블록을 추가하세요.',
  });
}
```

**검증 항목:**
- `payment` (단건 판매) 블록 존재?
- `subscription` (정기 구독) 블록 존재?

**비즈니스 의미:**
- 수익 모델이 없으면 ROI 계산 불가능
- 비즈니스의 핵심 요소

---

#### 3. 타겟 고객 정의 여부
```typescript
const hasCustomer = nodes.some(node => node.type === 'customer');
if (!hasCustomer) {
  diagnostics.push({
    id: `diag-${messageId++}`,
    type: 'warning',
    message: '타겟 고객 블록이 없습니다. 명확한 고객 정의가 필요합니다.',
  });
}
```

**비즈니스 의미:**
- 타겟 고객 없이는 마케팅 전략 수립 불가
- 지불 의향 검증 불가

---

#### 4. 유입 채널 존재 여부
```typescript
const hasChannel = nodes.some(node => node.type === 'channel');
if (!hasChannel) {
  diagnostics.push({
    id: `diag-${messageId++}`,
    type: 'warning',
    message: '유입 채널 블록이 없습니다. 고객 유입 경로를 설계하세요.',
  });
}
```

**검증 항목:**
- 광고, SEO, 바이럴 등 유입 채널 존재?

**비즈니스 의미:**
- 트래픽 소스가 없으면 고객 획득 불가

---

#### 5. 고립된 블록 탐지
```typescript
const connectedNodeIds = new Set<string>();
connections.forEach(conn => {
  connectedNodeIds.add(conn.from);
  connectedNodeIds.add(conn.to);
});

const disconnectedNodes = nodes.filter(node => !connectedNodeIds.has(node.id));
if (disconnectedNodes.length > 0 && connections.length > 0) {
  disconnectedNodes.forEach(node => {
    diagnostics.push({
      id: `diag-${messageId++}`,
      type: 'warning',
      message: `"${node.data.name}" 블록이 다른 블록과 연결되지 않았습니다.`,
      nodeId: node.id,
    });
  });
}
```

**알고리즘:**
1. 모든 연결에서 `from`과 `to` 노드 ID 수집 (Set 사용)
2. 전체 노드 중 Set에 없는 노드 = 고립된 노드
3. 단, 연결이 하나도 없으면 경고하지 않음 (초기 상태)

**비즈니스 의미:**
- 연결 안 된 블록은 시뮬레이션에 반영되지 않음
- 의도하지 않은 고립 방지

---

#### 6. 채널-고객 적합도 분석
```typescript
const channelNode = nodes.find(node => node.type === 'channel');
const customerNode = nodes.find(node => node.type === 'customer');

if (channelNode && customerNode) {
  const platform = channelNode.data.platform?.toLowerCase() || '';
  const segment = customerNode.data.segment?.toLowerCase() || '';
  
  // 예시: TikTok과 50대의 부적합 감지
  if (platform.includes('tiktok') && segment.includes('50대')) {
    diagnostics.push({
      id: `diag-${messageId++}`,
      type: 'warning',
      message: '타겟은 50대인데 유입 채널이 TikTok입니다. 채널 적합도가 낮을 수 있습니다.',
    });
  }
}
```

**확장 가능성:**
```typescript
// 더 많은 규칙 추가
const mismatchRules = [
  { platform: 'tiktok', ageGroup: '50대', reason: '젊은층 중심 플랫폼' },
  { platform: 'facebook', ageGroup: '10대', reason: '중장년층 사용자 많음' },
  { platform: 'linkedin', segment: 'B2C', reason: 'B2B 전문 플랫폼' },
];
```

---

#### 7. 낮은 전환율 경고
```typescript
nodes.forEach(node => {
  if (node.data.conversionRate !== undefined && node.data.conversionRate < 5) {
    diagnostics.push({
      id: `diag-${messageId++}`,
      type: 'warning',
      message: `"${node.data.name}" 블록의 전환율이 ${node.data.conversionRate}%로 낮습니다. 개선이 필요할 수 있습니다.`,
      nodeId: node.id,
    });
  }
});
```

**기준값:**
- 전환율 < 5%: 경고 발생
- 산업별로 다르지만 일반적으로 5% 미만은 낮은 편

**개선 제안:**
- A/B 테스트
- UX 개선
- CTA 최적화

---

#### 8. 마케팅 비용 대비 가격 검증
```typescript
const channelWithBudget = nodes.find(node => node.type === 'channel' && node.data.cost);
const paymentNode = nodes.find(node => node.type === 'payment');

if (channelWithBudget && paymentNode) {
  const monthlyCost = channelWithBudget.data.cost || 0;
  const price = paymentNode.data.price || 0;
  
  if (monthlyCost > price * 10) {
    diagnostics.push({
      id: `diag-${messageId++}`,
      type: 'warning',
      message: `월 광고비(₩${monthlyCost.toLocaleString()})가 판매 가격 대비 높습니다. ROI를 확인하세요.`,
    });
  }
}
```

**경고 조건:**
```
월 광고비 > 판매 가격 × 10
```

**예시:**
```
판매 가격: 30,000원
월 광고비: 500,000원
500,000 > 30,000 × 10 (300,000) → 경고!
```

**비즈니스 의미:**
- 최소 10건 이상 판매해야 광고비 회수
- CAC (Customer Acquisition Cost) 너무 높음

---

#### 9. 구독 모델 제안
```typescript
const hasPayment = nodes.some(node => node.type === 'payment');
const hasSubscription = nodes.some(node => node.type === 'subscription');

if (hasPayment && !hasSubscription) {
  diagnostics.push({
    id: `diag-${messageId++}`,
    type: 'suggestion',
    message: '현재 구조는 일회성 결제입니다. 구독 모델 추가 시 안정적인 수익 확보가 가능합니다.',
  });
}
```

**비즈니스 의미:**
- MRR (Monthly Recurring Revenue) 확보
- 고객 생애 가치 (LTV) 증가
- 예측 가능한 현금 흐름

---

#### 10. 완성도 체크
```typescript
const hasCompleteFlow = hasCustomer && hasChannel && hasFeature && hasRevenueModel;
if (hasCompleteFlow && diagnostics.filter(d => d.type === 'error').length === 0) {
  diagnostics.push({
    id: `diag-${messageId++}`,
    type: 'suggestion',
    message: '✓ 기본적인 비즈니스 구조가 완성되었습니다. 수익 시뮬레이션을 실행해보세요.',
  });
}
```

**완성 조건:**
- ✅ 타겟 고객 정의
- ✅ 유입 채널 존재
- ✅ 핵심 기능 정의
- ✅ 수익 모델 설정
- ✅ 에러 없음

---

### 사용 예시

```typescript
import { analyzeBusiness } from './utils/businessLogic';

const nodes = [
  { id: '1', type: 'customer', data: { name: '타겟 고객' } },
  { id: '2', type: 'paid-ads', data: { name: '광고', cost: 1000000 } },
  { id: '3', type: 'payment', data: { name: '결제', price: 30000 } },
];

const connections = [
  { id: 'c1', from: '1', to: '2' },
  { id: 'c2', from: '2', to: '3' },
];

const diagnostics = analyzeBusiness(nodes, connections);

console.log(diagnostics);
// [
//   {
//     id: 'diag-0',
//     type: 'warning',
//     message: '월 광고비(₩1,000,000)가 판매 가격 대비 높습니다. ROI를 확인하세요.'
//   },
//   {
//     id: 'diag-1',
//     type: 'suggestion',
//     message: '현재 구조는 일회성 결제입니다. 구독 모델 추가 시 안정적인 수익 확보가 가능합니다.'
//   }
// ]
```

---

## 💰 simulator.ts - 수익 시뮬레이션 엔진

### 주요 함수

#### runSimulation()
비즈니스 모델의 예상 수익과 비용을 계산합니다.

```typescript
export function runSimulation(
  nodes: Node[],
  connections: Connection[],
  marketingBudget: number
): SimulationResult
```

**매개변수:**
- `nodes`: 모든 블록
- `connections`: 모든 연결
- `marketingBudget`: 월 마케팅 예산

**반환값:**
```typescript
interface SimulationResult {
  totalRevenue: number;       // 총 수익
  totalCost: number;          // 총 비용
  netProfit: number;          // 순이익
  roi: number;                // ROI (%)
  projectedUsers: number;     // 예상 사용자 수
  conversionFunnel: {
    stage: string;            // 단계 이름
    users: number;            // 사용자 수
    dropoff: number;          // 이탈 수
  }[];
}
```

---

### 시뮬레이션 알고리즘

#### 1. 초기 트래픽 계산
```typescript
const channelNode = nodes.find(n => n.type === 'channel');
let initialTraffic = 1000; // 기본값
let dailyAdSpend = marketingBudget / 30; // 월 예산 → 일 예산

if (channelNode) {
  const { dailyBudget, cpc, ctr } = channelNode.data;
  
  if (dailyBudget && cpc) {
    // 일일 클릭 수 = 일일 예산 / CPC
    const dailyClicks = Math.floor(dailyBudget / cpc);
    
    // 고객 긴급도 가중치 적용
    const customerNode = nodes.find(n => n.type === 'customer');
    const urgencyMultiplier = customerNode 
      ? (customerNode.data.urgency || 3) / 3 
      : 1;
    
    // 월간 트래픽 = 일일 클릭 × 30일 × 긴급도
    initialTraffic = Math.floor(dailyClicks * urgencyMultiplier * 30);
    dailyAdSpend = dailyBudget;
  }
}
```

**계산 예시:**
```
일일 예산: 50,000원
CPC: 800원
고객 긴급도: 4 (1-5 스케일)

일일 클릭 수 = 50,000 / 800 = 62.5 → 62명
긴급도 가중치 = 4 / 3 = 1.33
월간 트래픽 = 62 × 1.33 × 30 = 2,473명
```

**긴급도의 의미:**
- 5: 매우 급함 (예: 화재 진압 서비스) → 클릭률 높음
- 3: 보통 (기본값)
- 1: 급하지 않음 (예: 취미 상품) → 클릭률 낮음

---

#### 2. BFS를 통한 트래픽 흐름 계산
```typescript
// 방문 순서 결정 (너비 우선 탐색)
const visitedNodes = new Set<string>();
const nodeOrder: Node[] = [];
const queue = [...entryNodes]; // 시작 노드 (customer, channel)

while (queue.length > 0) {
  const currentNode = queue.shift()!;
  if (visitedNodes.has(currentNode.id)) continue;
  
  visitedNodes.add(currentNode.id);
  nodeOrder.push(currentNode);
  
  // 현재 노드에서 나가는 연결 찾기
  const outgoing = connections.filter(c => c.from === currentNode.id);
  outgoing.forEach(conn => {
    const targetNode = nodes.find(n => n.id === conn.to);
    if (targetNode && !visitedNodes.has(targetNode.id)) {
      queue.push(targetNode);
    }
  });
}
```

**BFS가 필요한 이유:**
- 블록이 임의의 순서로 저장되어 있음
- 트래픽은 시작점 → 끝점 순서로 흘러야 함
- BFS로 올바른 순회 순서 보장

**예시 그래프:**
```
Customer → Ads → Landing → Signup → Payment
```

**BFS 결과:**
```
[Customer, Ads, Landing, Signup, Payment]
```

---

#### 3. 노드별 트래픽 계산 (전환율 적용)
```typescript
trafficMap.set(entryNodes[0].id, initialTraffic); // 시작점

nodeOrder.forEach((node, index) => {
  // 들어오는 연결 찾기
  const incomingConnections = connections.filter(c => c.to === node.id);
  
  let nodeTraffic = 0;
  
  if (index === 0) {
    // 첫 번째 노드: 초기 트래픽
    nodeTraffic = initialTraffic;
  } else {
    // 이후 노드: 들어오는 연결의 트래픽 합산
    incomingConnections.forEach(conn => {
      const sourceTraffic = trafficMap.get(conn.from) || 0;
      
      // 전환율 결정 (연결 우선, 없으면 노드 기본값)
      let conversionRate = 100; // 기본값
      
      if (conn.metrics?.conversionRate !== undefined && conn.metrics.conversionRate > 0) {
        // 스마트 엣지: 연결에 설정된 전환율 사용
        conversionRate = conn.metrics.conversionRate;
      } else if (node.data.conversionRate) {
        // 노드 자체의 전환율 사용
        conversionRate = node.data.conversionRate;
        
        // 복잡도 페널티 적용
        if (node.data.complexity === 'mid') {
          conversionRate *= 0.9; // -10%
        } else if (node.data.complexity === 'high') {
          conversionRate *= 0.8; // -20%
        }
      }
      
      // 전환 계산
      nodeTraffic += Math.floor(sourceTraffic * (conversionRate / 100));
    });
  }
  
  trafficMap.set(node.id, nodeTraffic);
});
```

**계산 예시:**
```
Landing Page 트래픽: 1,000명
Landing → Signup 전환율: 15%

Signup 트래픽 = 1,000 × 0.15 = 150명
```

**복잡도 페널티:**
```
회원가입 기본 전환율: 60%

Low (소셜 로그인): 60% × 1.0 = 60%
Mid (이메일 가입): 60% × 0.9 = 54%
High (본인인증): 60% × 0.8 = 48%
```

---

#### 4. 지불 의향 검증
```typescript
if (node.type === 'payment') {
  const customerNode = nodes.find(n => n.type === 'customer');
  if (customerNode && node.data.price > customerNode.data.willingnessToPay) {
    nodeTraffic = 0; // 가격이 너무 높으면 구매 안 함
  }
}
```

**예시:**
```
타겟 고객의 최대 지불 의사: 50,000원
상품 가격: 80,000원

→ 전환율 0% (아무도 구매하지 않음)
```

---

#### 5. 수익 계산

##### 단건 판매 (one-time)
```typescript
if (paymentNode.type === 'payment') {
  const { price, cogs, fee, repurchaseRate } = paymentNode.data;
  
  // 초기 구매
  const grossRevenue = traffic * price;              // 총 매출
  const cost = traffic * cogs;                       // 원가
  const feeAmount = grossRevenue * (fee / 100);      // PG 수수료
  const netRevenue = grossRevenue - cost - feeAmount; // 순수익
  
  totalRevenue += grossRevenue;
  totalMargin += netRevenue;
  
  // 재구매 (다음 달)
  if (repurchaseRate > 0) {
    const repurchasers = Math.floor(traffic * (repurchaseRate / 100));
    const repurchaseRevenue = repurchasers * price;
    const repurchaseCost = repurchasers * cogs;
    const repurchaseFee = repurchaseRevenue * (fee / 100);
    
    totalRevenue += repurchaseRevenue;
    totalMargin += (repurchaseRevenue - repurchaseCost - repurchaseFee);
  }
}
```

**계산 예시:**
```
구매자: 100명
판매 가격: 30,000원
원가 (COGS): 10,000원
PG 수수료: 3.5%
재구매율: 20%

초기 구매:
  총 매출: 100 × 30,000 = 3,000,000원
  원가: 100 × 10,000 = 1,000,000원
  PG 수수료: 3,000,000 × 0.035 = 105,000원
  순수익: 3,000,000 - 1,000,000 - 105,000 = 1,895,000원

재구매 (다음 달):
  재구매자: 100 × 0.2 = 20명
  매출: 20 × 30,000 = 600,000원
  원가: 20 × 10,000 = 200,000원
  수수료: 600,000 × 0.035 = 21,000원
  순수익: 600,000 - 200,000 - 21,000 = 379,000원

총 순수익: 1,895,000 + 379,000 = 2,274,000원
```

##### 정기 구독 (subscription)
```typescript
if (paymentNode.type === 'subscription') {
  const { monthlyPrice, churnRate, freeTrialDays, cogs } = paymentNode.data;
  
  // 평균 구독 기간 = 100 / 이탈률
  const avgLifetimeMonths = churnRate > 0 ? (100 / churnRate) : 12;
  
  // LTV (Lifetime Value) = 월 가격 × 평균 구독 기간
  const ltv = monthlyPrice * avgLifetimeMonths;
  const totalCost = cogs * avgLifetimeMonths;
  
  // 전체 구독자의 LTV 합산
  const subscriptionRevenue = traffic * ltv;
  const subscriptionCost = traffic * totalCost;
  
  totalRevenue += subscriptionRevenue;
  totalMargin += (subscriptionRevenue - subscriptionCost);
}
```

**LTV 계산 예시:**
```
구독자: 50명
월 구독료: 9,900원
월 이탈률: 5%
원가: 0원

평균 구독 기간 = 100 / 5 = 20개월

LTV = 9,900 × 20 = 198,000원

총 수익 = 50 × 198,000 = 9,900,000원
```

**이탈률의 의미:**
```
5% 이탈률 → 매월 5%씩 구독 취소
100명 구독 시작 →
  1개월 후: 95명
  2개월 후: 90명
  ...
  20개월 후: 약 36명 (절반 이탈)
```

---

#### 6. ROI 계산
```typescript
const totalCost = dailyAdSpend * 30; // 월 마케팅 비용
const netProfit = totalMargin - totalCost;
const roi = totalCost > 0 ? ((netProfit / totalCost) * 100) : 0;

return {
  totalRevenue,
  totalCost,
  netProfit,
  roi,
  projectedUsers: currentTraffic,
  conversionFunnel: funnel,
};
```

**ROI 공식:**
```
ROI = (순이익 / 총 비용) × 100

예시:
순이익: 2,000,000원
총 비용: 1,000,000원

ROI = (2,000,000 / 1,000,000) × 100 = 200%
```

**ROI 해석:**
- 200%: 투자 대비 2배 수익 (매우 좋음)
- 100%: 투자 대비 1배 수익 (수지 맞음)
- 50%: 투자 대비 0.5배 수익 (손해)
- -50%: 총 손실 50%

---

### 보조 함수

#### calculateNodeStatus()
트래픽과 전환율을 기반으로 블록 상태를 결정합니다.

```typescript
export function calculateNodeStatus(
  node: Node,
  traffic: number,
  avgConversionRate: number
): 'healthy' | 'warning' | 'critical' | 'inactive'
{
  if (traffic === 0) return 'inactive';
  
  if (node.data.conversionRate !== undefined) {
    const rate = node.data.conversionRate;
    if (rate < 5) return 'critical';
    if (rate < avgConversionRate * 0.7) return 'warning';
  }
  
  return 'healthy';
}
```

**상태 기준:**
- `inactive`: 트래픽 0 (연결 안 됨)
- `critical`: 전환율 < 5%
- `warning`: 전환율 < 평균의 70%
- `healthy`: 정상

---

#### calculateConnectionMetrics()
연결의 실제 전환율과 이탈률을 계산합니다.

```typescript
export function calculateConnectionMetrics(
  connection: Connection,
  fromNode: Node,
  toNode: Node,
  trafficMap: Map<string, number>
): Connection['metrics']
{
  const fromTraffic = trafficMap.get(connection.from) || 0;
  const toTraffic = trafficMap.get(connection.to) || 0;
  
  const conversionRate = fromTraffic > 0 ? (toTraffic / fromTraffic) * 100 : 0;
  const dropoffRate = 100 - conversionRate;
  
  return {
    traffic: toTraffic,
    conversionRate: Math.round(conversionRate * 10) / 10,  // 소수점 1자리
    dropoffRate: Math.round(dropoffRate * 10) / 10,
  };
}
```

**예시:**
```
Ads → Landing 연결
Ads 트래픽: 1,000명
Landing 트래픽: 150명

전환율 = (150 / 1,000) × 100 = 15.0%
이탈률 = 100 - 15 = 85.0%
```

---

### 사용 예시

```typescript
import { runSimulation } from './utils/simulator';

const nodes = [
  { 
    id: '1', 
    type: 'customer', 
    data: { urgency: 4, willingnessToPay: 100000 } 
  },
  { 
    id: '2', 
    type: 'paid-ads', 
    data: { dailyBudget: 50000, cpc: 800 } 
  },
  { 
    id: '3', 
    type: 'landing', 
    data: { conversionRate: 20 } 
  },
  { 
    id: '4', 
    type: 'payment', 
    data: { price: 30000, cogs: 10000, fee: 3.5, repurchaseRate: 15 } 
  },
];

const connections = [
  { id: 'c1', from: '1', to: '2' },
  { id: 'c2', from: '2', to: '3', metrics: { conversionRate: 100 } },
  { id: 'c3', from: '3', to: '4', metrics: { conversionRate: 20 } },
];

const result = runSimulation(nodes, connections, 1500000);

console.log(result);
// {
//   totalRevenue: 5000000,
//   totalCost: 1500000,
//   netProfit: 3500000,
//   roi: 233.33,
//   projectedUsers: 2473,
//   conversionFunnel: [
//     { stage: '타겟 고객', users: 2473, dropoff: 0 },
//     { stage: '유료 광고', users: 2473, dropoff: 0 },
//     { stage: '랜딩 페이지', users: 495, dropoff: 1978 },
//     { stage: '단건 판매', users: 99, dropoff: 396 }
//   ]
// }
```

---

## 🧪 테스트 전략

### 단위 테스트 예시 (Vitest)

```typescript
// businessLogic.test.ts
import { describe, it, expect } from 'vitest';
import { analyzeBusiness } from './businessLogic';

describe('analyzeBusiness', () => {
  it('빈 캔버스 시 에러 반환', () => {
    const result = analyzeBusiness([], []);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('error');
    expect(result[0].message).toContain('블록이 없습니다');
  });

  it('수익 모델 없으면 에러', () => {
    const nodes = [
      { id: '1', type: 'customer', data: {} },
      { id: '2', type: 'channel', data: {} },
    ];
    const result = analyzeBusiness(nodes, []);
    expect(result.some(d => d.message.includes('수익 모델'))).toBe(true);
  });
});
```

```typescript
// simulator.test.ts
import { describe, it, expect } from 'vitest';
import { runSimulation } from './simulator';

describe('runSimulation', () => {
  it('초기 트래픽 계산 정확성', () => {
    const nodes = [
      { 
        id: '1', 
        type: 'channel', 
        data: { dailyBudget: 50000, cpc: 1000 } 
      },
    ];
    const result = runSimulation(nodes, [], 0);
    // 50000 / 1000 = 50명/일 × 30일 = 1500명
    expect(result.projectedUsers).toBe(1500);
  });
});
```

---

**유틸리티 개발 원칙:**
- ✅ 순수 함수로 구현 (부수 효과 없음)
- ✅ UI와 완전히 분리
- ✅ 단위 테스트 용이
- ✅ 명확한 입출력
- ✅ 비즈니스 로직에 집중








