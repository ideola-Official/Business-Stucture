# Business Structure Design Proposal (비즈니스 구조 설계 도구)

## 📋 프로젝트 개요

**Business Structure Design Proposal**은 비즈니스 모델을 시각적으로 설계하고 시뮬레이션할 수 있는 웹 기반 도구입니다. 

드래그 앤 드롭 방식으로 고객 획득, 전환, 수익 모델, 비용 구조 등을 블록 형태로 배치하고 연결하여 비즈니스 플로우를 구성할 수 있으며, 실시간으로 수익성과 ROI를 시뮬레이션할 수 있습니다.

## 🎯 주요 기능

### 1. 비주얼 비즈니스 모델 설계
- **드래그 앤 드롭 인터페이스**: 다양한 비즈니스 블록을 캔버스에 배치
- **블록 카테고리**:
  - 👥 Customer (고객): 타겟 고객 정의
  - 📢 Acquisition (유입): 유료 광고, SEO/콘텐츠, 바이럴/초대, 이메일 캠페인
  - ⚡ Activation (전환): 랜딩 페이지, 회원가입, 리드 마그넷, 상담, 장바구니, 무료 체험
  - 💰 Revenue (수익): 단건 판매, 정기 구독, 중개 수수료, 업셀, 광고 수익
  - 💸 Cost (비용): 인건비, 인프라 비용, 환불, 마케팅 수수료
  - 🔄 Retention (재방문): 재방문 캠페인

### 2. 스마트 연결 시스템
- 블록 간 연결선으로 비즈니스 플로우 구성
- 각 연결마다 전환율 설정 가능
- 실시간 트래픽 흐름 시각화

### 3. 실시간 시뮬레이션
- 마케팅 예산 기반 트래픽 계산
- 전환율에 따른 퍼널 분석
- 수익/비용/순이익/ROI 자동 계산

### 4. 비즈니스 진단
- 구조적 문제점 자동 탐지
- 개선 제안 및 경고 메시지
- 최적화 팁 제공

## 🏗️ 프로젝트 구조

```
Business-Structure/
├── 📁 server/              # Node.js + Express 백엔드 서버
│   ├── config/             # 데이터베이스 설정
│   ├── models/             # MongoDB 스키마 모델
│   ├── routes/             # REST API 엔드포인트
│   └── server.js           # 서버 진입점
│
├── 📁 src/                 # React + TypeScript 프론트엔드
│   ├── components/         # React 컴포넌트
│   │   ├── ui/             # shadcn/ui 재사용 가능한 UI 컴포넌트
│   │   ├── Canvas.tsx      # 메인 캔버스 (블록 배치 공간)
│   │   ├── Toolbox.tsx     # 블록 도구 상자
│   │   ├── Inspector.tsx   # 블록 속성 편집 패널
│   │   ├── SimulatorPanel.tsx  # 시뮬레이션 결과 패널
│   │   ├── NodeComponent.tsx   # 개별 블록 컴포넌트
│   │   └── ConnectionLine.tsx  # 연결선 컴포넌트
│   │
│   ├── utils/              # 유틸리티 함수
│   │   ├── businessLogic.ts    # 비즈니스 로직 진단 엔진
│   │   └── simulator.ts        # 수익 시뮬레이션 엔진
│   │
│   ├── api/                # API 클라이언트 함수
│   ├── types.ts            # TypeScript 타입 정의
│   └── App.tsx             # 메인 앱 컴포넌트
│
├── index.html              # HTML 진입점
├── vite.config.ts          # Vite 번들러 설정
└── package.json            # 프론트엔드 의존성
```

## 🚀 시작하기

### 필수 조건
- Node.js 18.x 이상
- MongoDB 4.x 이상 (로컬 또는 MongoDB Atlas)

### 1. 프로젝트 클론 및 의존성 설치

```bash
# 프로젝트 클론
git clone <repository-url>
cd Business-Structure

# 프론트엔드 의존성 설치
npm install

# 백엔드 의존성 설치
cd server
npm install
cd ..
```

### 2. 환경 변수 설정

서버 폴더에 `.env` 파일 생성:

```bash
cd server
cat > .env << EOF
PORT=5000
MONGO_URI=mongodb://localhost:27017/business-structure
EOF
```

### 3. 서버 실행

**터미널 1 - 백엔드 서버:**
```bash
cd server
npm run dev
# 또는
npm start
```

서버는 `http://localhost:5000`에서 실행됩니다.

**터미널 2 - 프론트엔드 개발 서버:**
```bash
npm run dev
```

프론트엔드는 `http://localhost:5173`에서 실행됩니다.

## 💡 사용 방법

### 1. 비즈니스 모델 만들기

1. **고객 블록 추가**: 왼쪽 Toolbox에서 "타겟 고객" 블록을 클릭하거나 드래그하여 캔버스에 추가
2. **유입 채널 추가**: "유료 광고", "SEO/콘텐츠" 등의 블록 추가
3. **전환 단계 추가**: "랜딩 페이지", "회원가입", "장바구니" 등 추가
4. **수익 모델 추가**: "단건 판매" 또는 "정기 구독" 블록 추가

### 2. 블록 연결하기

- 블록 우측 하단의 연결 핸들을 클릭 후 다른 블록으로 드래그
- 연결선을 클릭하면 전환율 조정 가능 (0-100%)

### 3. 블록 속성 편집

- 블록을 클릭하면 우측 Inspector 패널에서 속성 편집
- 각 블록마다 고유한 속성 설정 가능 (가격, 예산, 전환율 등)

### 4. 시뮬레이션 실행

- 하단 Simulator Panel에서 마케팅 예산 설정
- 자동으로 실시간 시뮬레이션 실행
- 수익, 비용, 순이익, ROI 확인

### 5. 프로젝트 저장

- 상단 Header의 "저장" 버튼 클릭
- MongoDB에 프로젝트 저장

## 🧮 시뮬레이션 엔진 작동 원리

### 트래픽 계산
1. **초기 트래픽**: 유료 광고 블록의 예산과 CPC(클릭당 비용)로 계산
   - `일일 클릭 수 = 일일 예산 / CPC`
   - `월간 트래픽 = 일일 클릭 수 × 30`

2. **전환 흐름**: BFS(너비 우선 탐색)로 블록 간 트래픽 계산
   - 각 연결의 전환율 적용: `도착 트래픽 = 출발 트래픽 × (전환율 / 100)`

### 수익 계산
- **단건 판매**: `수익 = 구매자 수 × 가격 - COGS - 수수료`
- **정기 구독**: `LTV = 월 가격 × (100 / 이탈률)`, `수익 = 구독자 수 × LTV`

### ROI 계산
```
순이익 = 총 수익 - 총 비용
ROI = (순이익 / 총 비용) × 100
```

## 📊 블록 타입별 상세 설명

### 📢 Acquisition (유입)

#### 유료 광고 (paid-ads)
```typescript
{
  platform: "facebook" | "google" | "instagram" | "naver",
  dailyBudget: number,      // 일일 예산 (원)
  cpc: number,              // 클릭당 비용 (원)
  ctr: number,              // 클릭률 (%)
  campaignOn: boolean       // 캠페인 활성화 여부
}
```

#### SEO/콘텐츠 (seo-content)
```typescript
{
  monthlySearchVolume: number,  // 월간 검색량
  expectedRank: number,         // 예상 순위 (1-10)
  contentCount: number,         // 월 발행 콘텐츠 수
  costPerContent: number        // 콘텐츠당 제작 비용
}
```

### ⚡ Activation (전환)

#### 랜딩 페이지 (landing)
```typescript
{
  conversionRate: number,   // 전환율 (%)
  complexity: "low" | "mid" | "high"  // 복잡도 (패널티 적용)
}
```

### 💰 Revenue (수익)

#### 단건 판매 (one-time)
```typescript
{
  price: number,           // 판매 가격
  cogs: number,           // 제조 원가
  fee: number,            // 수수료율 (%)
  repurchaseRate: number  // 재구매율 (%)
}
```

#### 정기 구독 (subscription)
```typescript
{
  monthlyPrice: number,   // 월 가격
  churnRate: number,      // 월간 이탈률 (%)
  freeTrialDays: number,  // 무료 체험 기간 (일)
  cogs: number           // 원가
}
```

## 🔧 기술 스택

### Frontend
- **React 18.3** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite 6.3** - 빌드 도구
- **Tailwind CSS** - 스타일링
- **Radix UI** - 접근성 높은 UI 컴포넌트
- **Lucide React** - 아이콘

### Backend
- **Node.js** - 런타임
- **Express 4.19** - 웹 프레임워크
- **MongoDB + Mongoose** - 데이터베이스
- **CORS** - Cross-Origin 허용
- **dotenv** - 환경 변수 관리

## 📝 API 엔드포인트

### POST /api/projects
프로젝트 생성
```json
{
  "title": "프로젝트 제목",
  "userId": "사용자 ID",
  "blocks": [...],
  "connections": [...]
}
```

### GET /api/projects/:id
프로젝트 조회

### PUT /api/projects/:id
프로젝트 업데이트

### GET /api/health
서버 상태 확인

## 🎨 UI/UX 특징

- **다크 모드**: 눈의 피로를 줄이는 다크 테마
- **드래그 앤 드롭**: 직관적인 블록 배치
- **실시간 피드백**: 즉각적인 시뮬레이션 결과
- **색상 코딩**: 연결 타입별 시각적 구분 (트래픽, 수익, 비용, 데이터)
- **반응형 디자인**: 다양한 화면 크기 지원

## 🐛 문제 해결

### MongoDB 연결 오류
```bash
# MongoDB가 실행 중인지 확인
mongod --version

# MongoDB 서비스 시작 (macOS)
brew services start mongodb-community

# MongoDB 서비스 시작 (Linux)
sudo systemctl start mongod
```

### 포트 충돌
- 프론트엔드: `vite.config.ts`에서 포트 변경
- 백엔드: `server/.env`에서 PORT 변경

## 📚 더 알아보기

- [서버 폴더 README](./server/README.md) - 백엔드 상세 설명
- [컴포넌트 README](./src/components/README.md) - 프론트엔드 컴포넌트 설명
- [유틸리티 README](./src/utils/README.md) - 비즈니스 로직 및 시뮬레이터 설명

## 📄 라이선스

Private - 개인 프로젝트

## 🙏 기여

이 프로젝트는 개인 학습 및 연구 목적으로 개발되었습니다.

---

**Made with ❤️ for entrepreneurs and business analysts**
