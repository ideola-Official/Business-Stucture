# 프론트엔드 소스 (Frontend Source)

## 📋 개요

이 폴더는 React + TypeScript로 작성된 프론트엔드 애플리케이션의 소스 코드를 포함합니다. 비즈니스 모델을 시각적으로 설계하고 시뮬레이션하는 UI를 제공합니다.

## 🏗️ 폴더 구조

```
src/
├── components/          # React 컴포넌트
│   ├── ui/             # shadcn/ui 재사용 컴포넌트
│   ├── Canvas.tsx      # 메인 캔버스 (드래그 앤 드롭 영역)
│   ├── Toolbox.tsx     # 블록 도구 상자
│   ├── Inspector.tsx   # 블록 속성 편집 패널
│   ├── SimulatorPanel.tsx   # 시뮬레이션 결과 패널
│   ├── NodeComponent.tsx    # 개별 블록 컴포넌트
│   ├── ConnectionLine.tsx   # 연결선 컴포넌트
│   ├── Console.tsx          # 콘솔 출력
│   └── Header.tsx           # 상단 헤더
│
├── utils/              # 유틸리티 함수
│   ├── businessLogic.ts     # 비즈니스 로직 진단 엔진
│   └── simulator.ts         # 수익 시뮬레이션 엔진
│
├── api/                # API 클라이언트
│   └── projects.ts     # 프로젝트 저장/로드 API
│
├── styles/             # 스타일 파일
│   └── globals.css     # 전역 CSS (Tailwind 포함)
│
├── types.ts            # TypeScript 타입 정의
├── App.tsx             # 메인 애플리케이션 컴포넌트
├── main.tsx            # React 진입점
├── index.css           # 기본 스타일
└── vite-env.d.ts       # Vite 타입 정의
```

## 🎨 주요 컴포넌트 개요

### App.tsx
애플리케이션의 루트 컴포넌트로, 전체 상태를 관리하고 자식 컴포넌트를 조율합니다.

**주요 기능:**
- 블록(Node) 및 연결(Connection) 상태 관리
- 비즈니스 진단 실행
- 시뮬레이션 자동 실행
- 프로젝트 저장

**주요 상태:**
```typescript
const [nodes, setNodes] = useState<Node[]>([]);                    // 블록 목록
const [connections, setConnections] = useState<Connection[]>([]);  // 연결 목록
const [selectedNode, setSelectedNode] = useState<Node | null>(null); // 선택된 블록
const [diagnostics, setDiagnostics] = useState<DiagnosticMessage[]>([]); // 진단 결과
const [marketingBudget, setMarketingBudget] = useState(1000000);   // 마케팅 예산
const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null); // 시뮬레이션 결과
```

**핵심 함수:**
- `handleAddNode()`: 새 블록 추가
- `handleNodeMove()`: 블록 위치 이동
- `handleNodeDataUpdate()`: 블록 데이터 수정
- `handleAddConnection()`: 블록 간 연결 생성
- `handleDeleteNode()`: 블록 삭제
- `runDiagnostics()`: 비즈니스 로직 진단 실행
- `runSimulationWithDelay()`: 수익 시뮬레이션 실행

### Canvas.tsx
블록을 배치하고 연결하는 메인 캔버스 영역입니다.

**주요 기능:**
- 드래그 앤 드롭으로 블록 추가
- 블록 위치 이동
- 연결선 그리기 (SVG)
- 캔버스 패닝 (드래그로 뷰 이동)
- 그리드 배경

**이벤트 핸들러:**
- `handleDrop()`: 툴박스에서 드래그한 블록 추가
- `handleStartConnection()`: 연결 시작
- `handleEndConnection()`: 연결 완료
- `handleMouseMove()`: 연결선 미리보기

**상세 설명:** [components/README.md](./components/README.md) 참조

### Toolbox.tsx
사용 가능한 블록 타입을 카테고리별로 표시하는 도구 상자입니다.

**블록 카테고리:**
1. **Customer (고객)**: 타겟 고객
2. **Acquisition (유입)**: 유료 광고, SEO, 바이럴, 이메일
3. **Activation (전환)**: 랜딩, 회원가입, 상담, 장바구니
4. **Revenue (수익)**: 단건 판매, 구독, 수수료, 업셀
5. **Cost (비용)**: 인건비, 인프라, 환불, 마케팅 수수료
6. **Retention (재방문)**: 재방문 캠페인

**상호작용 방식:**
- 클릭: 캔버스 중앙에 블록 추가
- 드래그: 원하는 위치에 블록 배치

### Inspector.tsx
선택된 블록의 속성을 보여주고 편집하는 패널입니다.

**기능:**
- 블록 타입별 맞춤 입력 폼
- 실시간 데이터 업데이트
- 입력 검증

**예시 (유료 광고 블록):**
```typescript
- 이름: 텍스트 입력
- 플랫폼: 선택 (facebook, google, instagram, naver)
- 일일 예산: 숫자 입력
- CPC (클릭당 비용): 숫자 입력
- CTR (클릭률): 슬라이더 (0-100%)
- 캠페인 활성화: 토글 스위치
```

### SimulatorPanel.tsx
시뮬레이션 결과를 시각적으로 표시하는 패널입니다.

**표시 정보:**
- 총 수익
- 총 비용
- 순이익
- ROI (투자 대비 수익률)
- 전환 퍼널 (단계별 사용자 수)
- 비즈니스 진단 메시지

**색상 코딩:**
- 🟢 수익: 초록색
- 🔴 비용: 빨간색
- 💰 순이익 (양수): 파란색
- ⚠️ 순손실 (음수): 주황색

### NodeComponent.tsx
캔버스에 표시되는 개별 블록 컴포넌트입니다.

**표시 요소:**
- 블록 아이콘
- 블록 이름
- 실시간 트래픽 수
- 상태 인디케이터 (healthy, warning, critical)
- 연결 핸들 (우측 하단)

**상호작용:**
- 클릭: 블록 선택
- 드래그: 위치 이동
- 연결 핸들 드래그: 다른 블록과 연결
- Delete 키: 블록 삭제

### ConnectionLine.tsx
블록 간 연결선을 SVG로 렌더링하는 컴포넌트입니다.

**시각적 요소:**
- 베지어 곡선 경로
- 화살표 마커
- 전환율 라벨
- 타입별 색상 (traffic: 파란색, money: 초록색, cost: 빨간색)

**상호작용:**
- 클릭: 전환율 조정 UI 표시
- 우클릭: 연결 삭제

### Header.tsx
상단 헤더 바입니다.

**표시 정보:**
- 앱 제목 "Biz-Architect"
- 블록 개수
- 연결 개수

**액션 버튼:**
- 진단 실행
- 프로젝트 저장

## 🔧 유틸리티 함수

### businessLogic.ts
비즈니스 구조를 분석하고 진단 메시지를 생성합니다.

**주요 함수:**
```typescript
export function analyzeBusiness(
  nodes: Node[], 
  connections: Connection[]
): DiagnosticMessage[]
```

**진단 항목:**
- ❌ 수익 모델 존재 여부
- ⚠️ 타겟 고객 정의 여부
- ⚠️ 유입 채널 존재 여부
- ⚠️ 연결되지 않은 블록 감지
- 💡 채널-고객 적합도 분석
- 💡 구독 모델 제안
- ⚠️ 낮은 전환율 경고
- ⚠️ 마케팅 비용 대비 가격 검증

**상세 설명:** [utils/README.md](./utils/README.md) 참조

### simulator.ts
비즈니스 모델의 수익성을 시뮬레이션합니다.

**주요 함수:**
```typescript
export function runSimulation(
  nodes: Node[],
  connections: Connection[],
  marketingBudget: number
): SimulationResult
```

**시뮬레이션 로직:**
1. **초기 트래픽 계산**: 광고 예산 / CPC
2. **BFS 순회**: 블록 간 트래픽 전파
3. **전환율 적용**: 각 연결의 전환율로 트래픽 감소
4. **수익 계산**: 
   - 단건 판매: `구매자 × 가격 - COGS - 수수료`
   - 구독: `구독자 × LTV (Lifetime Value)`
5. **ROI 계산**: `(순이익 / 총 비용) × 100`

**상세 설명:** [utils/README.md](./utils/README.md) 참조

## 📡 API 클라이언트

### projects.ts
백엔드 API와 통신하는 함수들입니다.

**함수:**
```typescript
// 프로젝트 저장
export async function saveProject(payload: SaveProjectPayload): Promise<any>

// 프로젝트 로드
export async function loadProject(id: string): Promise<any>
```

**사용 예시:**
```typescript
// 저장
await saveProject({
  title: "My Project",
  userId: "user-123",
  blocks: nodes,
  connections: connections
});

// 로드
const project = await loadProject("507f1f77bcf86cd799439011");
setNodes(project.blocks);
setConnections(project.connections);
```

## 🎨 스타일링

### Tailwind CSS
- 유틸리티 우선 CSS 프레임워크
- `globals.css`에 커스텀 스타일 정의
- 다크 모드 기본 적용

**주요 색상:**
```css
/* globals.css */
:root {
  --background: 0 0% 4%;          /* bg-neutral-950 */
  --foreground: 0 0% 98%;         /* text-white */
  --primary: 210 100% 50%;        /* 파란색 */
  --success: 142 71% 45%;         /* 초록색 */
  --destructive: 0 84% 60%;       /* 빨간색 */
}
```

### CSS Modules
- `Header.module.css`: Header 컴포넌트 전용 스타일
- 스코프가 지정된 클래스명으로 충돌 방지

## 📦 타입 정의 (types.ts)

### Node (블록)
```typescript
export interface Node {
  id: string;                    // 고유 ID (예: "node-1234567890")
  type: string;                  // 블록 타입 (예: "paid-ads")
  position: { x: number; y: number }; // 캔버스 좌표
  data: any;                     // 블록 타입별 데이터
  status?: 'healthy' | 'warning' | 'critical' | 'inactive'; // 상태
  metrics?: {
    traffic?: number;            // 트래픽 수
    conversionRate?: number;     // 전환율
    revenue?: number;            // 수익
  };
}
```

### Connection (연결)
```typescript
export interface Connection {
  id: string;                    // 고유 ID
  from: string;                  // 출발 블록 ID
  to: string;                    // 도착 블록 ID
  type?: 'traffic' | 'money' | 'cost' | 'data'; // 연결 타입
  metrics?: {
    traffic: number;             // 흐르는 트래픽 수
    conversionRate: number;      // 전환율 (%)
    dropoffRate: number;         // 이탈률 (%)
  };
}
```

### DiagnosticMessage (진단 메시지)
```typescript
export interface DiagnosticMessage {
  id: string;                    // 메시지 ID
  type: 'error' | 'warning' | 'suggestion' | 'tip'; // 타입
  message: string;               // 메시지 내용
  nodeId?: string;               // 관련 블록 ID (선택)
  priority?: 'high' | 'medium' | 'low'; // 우선순위
}
```

### SimulationResult (시뮬레이션 결과)
```typescript
export interface SimulationResult {
  totalRevenue: number;          // 총 수익
  totalCost: number;             // 총 비용
  netProfit: number;             // 순이익
  roi: number;                   // ROI (%)
  projectedUsers: number;        // 예상 사용자 수
  conversionFunnel: {
    stage: string;               // 단계 이름
    users: number;               // 사용자 수
    dropoff: number;             // 이탈 수
  }[];
}
```

## 🔄 데이터 흐름

### 1. 블록 추가 플로우
```
Toolbox (클릭/드래그)
  → App.handleAddNode()
  → setNodes([...nodes, newNode])
  → Canvas (렌더링)
  → NodeComponent 표시
```

### 2. 블록 속성 수정 플로우
```
NodeComponent (클릭 선택)
  → App.handleSelectNode()
  → setSelectedNode(node)
  → Inspector (선택된 노드 표시)
  → Inspector (입력 변경)
  → App.handleNodeDataUpdate()
  → setNodes(업데이트된 배열)
  → runDiagnostics() 자동 실행
```

### 3. 시뮬레이션 플로우
```
App.useEffect() [nodes, connections, marketingBudget 변경 감지]
  → runSimulationWithDelay()
  → simulator.runSimulation()
  → 트래픽 계산 (BFS)
  → 수익/비용 계산
  → setSimulationResult()
  → SimulatorPanel 업데이트
  → Canvas의 연결선 메트릭 업데이트
```

### 4. 프로젝트 저장 플로우
```
Header (저장 버튼 클릭)
  → App.handleSaveProject()
  → api.saveProject({ blocks: nodes, connections })
  → POST /api/projects
  → MongoDB 저장
  → 성공 알림
```

## 🎯 상태 관리 전략

### 현재: React useState
- 간단한 로컬 상태 관리
- Props drilling으로 데이터 전달

### 향후 개선 옵션:
1. **Context API**: 전역 상태 공유
2. **Zustand**: 간단한 상태 관리 라이브러리
3. **Redux Toolkit**: 복잡한 상태 로직 관리

**Context API 예시:**
```typescript
// AppContext.tsx
export const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  
  return (
    <AppContext.Provider value={{ nodes, setNodes, connections, setConnections }}>
      {children}
    </AppContext.Provider>
  );
}

// 컴포넌트에서 사용
const { nodes, setNodes } = useContext(AppContext);
```

## 🧪 테스트 전략

### 단위 테스트 (추천: Vitest)
```typescript
// businessLogic.test.ts
import { analyzeBusiness } from './businessLogic';

describe('analyzeBusiness', () => {
  it('should return error if no revenue model', () => {
    const nodes = [{ id: '1', type: 'customer', ... }];
    const result = analyzeBusiness(nodes, []);
    
    expect(result).toContainEqual({
      type: 'error',
      message: expect.stringContaining('수익 모델이 없습니다')
    });
  });
});
```

### 통합 테스트 (추천: React Testing Library)
```typescript
// App.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('adds a node when toolbox item is clicked', () => {
  render(<App />);
  
  const customerButton = screen.getByText('타겟 고객');
  fireEvent.click(customerButton);
  
  const nodes = screen.getAllByTestId('node-component');
  expect(nodes).toHaveLength(1);
});
```

## 📚 관련 문서

- [components/README.md](./components/README.md) - 컴포넌트 상세 설명
- [utils/README.md](./utils/README.md) - 유틸리티 함수 상세 설명
- [api/README.md](./api/README.md) - API 클라이언트 설명

## 🔗 외부 라이브러리

- **React 18.3**: UI 라이브러리
- **Radix UI**: 접근성 높은 헤드리스 UI 컴포넌트
- **Lucide React**: 아이콘 라이브러리
- **Tailwind CSS**: 유틸리티 CSS 프레임워크
- **class-variance-authority**: 조건부 클래스 관리
- **clsx**: 클래스명 조합 유틸리티

---

**개발 시 주의사항:**
- 컴포넌트는 단일 책임 원칙 준수
- 상태는 최대한 하위 컴포넌트로 위임
- useCallback/useMemo로 불필요한 리렌더링 방지
- TypeScript strict 모드 활용
- 접근성(a11y) 고려 (키보드 네비게이션, ARIA 속성)








