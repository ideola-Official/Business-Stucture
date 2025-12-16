# 데이터 모델 (Data Models)

## 📋 개요

이 폴더는 MongoDB의 데이터 스키마를 정의하는 Mongoose 모델을 포함합니다. 현재는 프로젝트(Project) 모델만 정의되어 있습니다.

## 📄 파일 목록

### Project.js
비즈니스 구조 프로젝트의 데이터 스키마를 정의합니다.

## 🗄️ Project.js 상세 설명

### 전체 코드 구조

```javascript
const mongoose = require("mongoose");
const { Schema } = mongoose;

// 1. BlockSchema: 개별 블록(노드) 정의
const BlockSchema = new Schema(
  {
    type: { type: String, required: true },
    position: {
      x: { type: Number, required: true, default: 0 },
      y: { type: Number, required: true, default: 0 },
    },
    properties: { type: Schema.Types.Mixed, default: {} },
    connections: [{ type: String }],
  },
  { _id: false }
);

// 2. ProjectSchema: 프로젝트 전체 정의
const ProjectSchema = new Schema(
  {
    title: { type: String, required: true },
    userId: { type: String, required: true },
    blocks: { type: [BlockSchema], default: [] },
    connections: { type: [Schema.Types.Mixed], default: [] },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

// 3. 모델 생성 및 내보내기
module.exports = mongoose.model("Project", ProjectSchema);
```

---

## 📦 BlockSchema (블록 스키마)

블록은 캔버스에 배치되는 개별 비즈니스 컴포넌트입니다 (고객, 채널, 수익 등).

### 필드 상세 설명

#### 1. type (블록 타입)
```javascript
type: { type: String, required: true }
```

**설명:**
- 블록의 종류를 나타내는 문자열
- **필수 필드** (required: true)

**가능한 값:**
```javascript
// Customer (고객)
"customer"

// Acquisition (유입)
"paid-ads"      // 유료 광고
"seo-content"   // SEO/콘텐츠
"referral"      // 바이럴/초대
"email-campaign" // 이메일 캠페인

// Activation (전환)
"landing"       // 랜딩 페이지
"signup"        // 회원가입
"lead-magnet"   // 리드 마그넷
"consultation"  // 상담/문의
"cart"          // 장바구니
"trial"         // 무료 체험

// Revenue (수익)
"one-time"      // 단건 판매
"subscription"  // 정기 구독
"commission"    // 중개 수수료
"upsell"        // 프리미엄 업셀
"ads-revenue"   // 광고 수익

// Cost (비용)
"labor-cost"    // 인건비
"infra-cost"    // 서버/툴 비용
"refund"        // 환불/취소
"marketing-fee" // 마케팅 수수료

// Retention (재방문)
"retention"     // 재방문 캠페인
```

**사용 예시:**
```javascript
{
  type: "paid-ads"
}
```

#### 2. position (위치)
```javascript
position: {
  x: { type: Number, required: true, default: 0 },
  y: { type: Number, required: true, default: 0 }
}
```

**설명:**
- 캔버스 내 블록의 좌표 (픽셀 단위)
- `x`: 가로 위치 (왼쪽에서의 거리)
- `y`: 세로 위치 (위쪽에서의 거리)
- **기본값**: (0, 0) - 캔버스 좌측 상단

**사용 예시:**
```javascript
{
  position: {
    x: 250,  // 왼쪽에서 250px
    y: 150   // 위쪽에서 150px
  }
}
```

**주의사항:**
- 음수 값도 허용 (캔버스 확장 시)
- 프론트엔드에서 드래그 시 실시간 업데이트

#### 3. properties (속성)
```javascript
properties: { type: Schema.Types.Mixed, default: {} }
```

**설명:**
- 블록 타입별 고유한 설정 값 저장
- `Schema.Types.Mixed`: 어떤 형태의 객체든 저장 가능 (유연성)
- **기본값**: 빈 객체 `{}`

**블록 타입별 properties 예시:**

##### 유료 광고 (paid-ads)
```javascript
{
  properties: {
    name: "페이스북 광고",
    platform: "facebook",     // facebook, google, instagram, naver
    dailyBudget: 50000,       // 일일 예산 (원)
    cpc: 800,                 // 클릭당 비용 (원)
    ctr: 1.5,                 // 클릭률 (%)
    campaignOn: true,         // 캠페인 활성화 여부
    volatility: "high"        // 변동성 (high, mid, low)
  }
}
```

##### 단건 판매 (one-time)
```javascript
{
  properties: {
    name: "제품 판매",
    price: 30000,             // 판매 가격
    cogs: 10000,              // 제조 원가 (Cost of Goods Sold)
    fee: 3.5,                 // 수수료율 (%)
    repurchaseRate: 20        // 재구매율 (%)
  }
}
```

##### 정기 구독 (subscription)
```javascript
{
  properties: {
    name: "프리미엄 구독",
    monthlyPrice: 9900,       // 월 가격
    churnRate: 5.0,           // 월간 이탈률 (%)
    freeTrialDays: 14,        // 무료 체험 기간 (일)
    cogs: 0                   // 원가
  }
}
```

##### 타겟 고객 (customer)
```javascript
{
  properties: {
    name: "타겟 고객",
    segment: "20-30대",       // 세그먼트
    marketSize: 5000000,      // 시장 규모 (명)
    willingnessToPay: 50000,  // 지불 의향 금액
    urgency: 3                // 구매 긴급도 (1-5)
  }
}
```

**Mixed 타입의 장점:**
- 블록마다 다른 필드를 자유롭게 저장 가능
- 새로운 블록 타입 추가 시 스키마 수정 불필요

**주의사항:**
- Mixed 타입은 Mongoose가 자동으로 변경 감지하지 못함
- 업데이트 시 명시적으로 `markModified()` 호출 또는 전체 교체 필요

#### 4. connections (연결)
```javascript
connections: [{ type: String }]
```

**설명:**
- 이 블록에서 출발하는 연결의 대상 블록 ID 목록
- **배열 형태**: 하나의 블록에서 여러 블록으로 연결 가능
- **현재 미사용**: 실제 연결은 ProjectSchema의 `connections` 필드에서 관리

**사용 예시:**
```javascript
{
  connections: ["node-123", "node-456"]  // 두 개의 다른 블록으로 연결
}
```

**참고:**
- 현재 구현에서는 ProjectSchema의 `connections` 배열을 사용하므로 이 필드는 선택적
- 향후 블록 중심 연결 관리로 변경 시 사용 가능

#### 5. _id: false
```javascript
{ _id: false }
```

**설명:**
- 서브 스키마(BlockSchema)에는 별도의 MongoDB `_id` 생성하지 않음
- 블록은 프로젝트의 일부로만 존재하므로 독립적인 ID 불필요
- 대신 프론트엔드에서 생성한 `id`를 `properties.id` 또는 별도 필드로 관리

---

## 📋 ProjectSchema (프로젝트 스키마)

프로젝트는 사용자가 만든 비즈니스 모델 전체를 나타냅니다.

### 필드 상세 설명

#### 1. title (제목)
```javascript
title: { type: String, required: true }
```

**설명:**
- 프로젝트의 이름
- **필수 필드**

**사용 예시:**
```javascript
{
  title: "SaaS 구독 모델"
}
```

#### 2. userId (사용자 ID)
```javascript
userId: { type: String, required: true }
```

**설명:**
- 프로젝트를 생성한 사용자의 식별자
- **필수 필드**
- 향후 사용자 인증 시스템 연동 시 사용

**사용 예시:**
```javascript
{
  userId: "user-abc123"
}
```

**향후 개선:**
```javascript
// ObjectId 참조로 변경
userId: { 
  type: Schema.Types.ObjectId, 
  ref: 'User',  // User 모델과 연결
  required: true 
}

// 사용 시 populate
const project = await Project.findById(id).populate('userId');
console.log(project.userId.email); // User 정보 접근
```

#### 3. blocks (블록 배열)
```javascript
blocks: { type: [BlockSchema], default: [] }
```

**설명:**
- 프로젝트에 포함된 모든 블록의 배열
- 각 블록은 위에서 정의한 `BlockSchema` 구조를 따름
- **기본값**: 빈 배열 `[]`

**사용 예시:**
```javascript
{
  blocks: [
    {
      type: "customer",
      position: { x: 100, y: 100 },
      properties: {
        name: "타겟 고객",
        segment: "20-30대",
        marketSize: 5000000
      }
    },
    {
      type: "paid-ads",
      position: { x: 300, y: 100 },
      properties: {
        name: "페이스북 광고",
        platform: "facebook",
        dailyBudget: 50000,
        cpc: 800
      }
    }
  ]
}
```

**쿼리 예시:**
```javascript
// 특정 타입의 블록만 조회
const project = await Project.findOne({ 
  "blocks.type": "paid-ads" 
});

// 블록 추가
await Project.findByIdAndUpdate(
  projectId,
  { $push: { blocks: newBlock } }
);

// 블록 제거
await Project.findByIdAndUpdate(
  projectId,
  { $pull: { blocks: { type: "customer" } } }
);
```

#### 4. connections (연결 배열)
```javascript
connections: { type: [Schema.Types.Mixed], default: [] }
```

**설명:**
- 블록 간 연결선 정보를 저장
- `Schema.Types.Mixed`: 유연한 구조 허용
- **기본값**: 빈 배열 `[]`

**연결 객체 구조:**
```javascript
{
  id: "conn-1234567890",       // 연결 고유 ID
  from: "node-abc",             // 출발 블록 ID
  to: "node-xyz",               // 도착 블록 ID
  type: "traffic",              // 연결 타입: traffic, money, cost, data
  metrics: {
    traffic: 1000,              // 트래픽 수
    conversionRate: 15.5,       // 전환율 (%)
    dropoffRate: 84.5           // 이탈률 (%)
  }
}
```

**사용 예시:**
```javascript
{
  connections: [
    {
      id: "conn-1",
      from: "node-customer",
      to: "node-landing",
      type: "traffic",
      metrics: {
        traffic: 5000,
        conversionRate: 15.0,
        dropoffRate: 85.0
      }
    },
    {
      id: "conn-2",
      from: "node-landing",
      to: "node-payment",
      type: "traffic",
      metrics: {
        traffic: 750,
        conversionRate: 30.0,
        dropoffRate: 70.0
      }
    }
  ]
}
```

**연결 타입 설명:**
- `traffic`: 사용자 흐름 (파란색)
- `money`: 수익 흐름 (초록색)
- `cost`: 비용 흐름 (빨간색)
- `data`: 데이터 흐름 (보라색)

#### 5. timestamps (타임스탬프)
```javascript
{
  timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }
}
```

**설명:**
- Mongoose가 자동으로 생성/수정 시간 추가
- `createdAt`: 프로젝트 생성 시각
- `updatedAt`: 마지막 수정 시각

**자동 생성 필드:**
```javascript
{
  createdAt: ISODate("2024-12-10T10:30:00.000Z"),
  updatedAt: ISODate("2024-12-10T15:45:00.000Z")
}
```

**활용 예시:**
```javascript
// 최근 수정된 프로젝트 조회
const recentProjects = await Project.find()
  .sort({ updatedAt: -1 })
  .limit(10);

// 특정 기간 내 생성된 프로젝트
const lastWeekProjects = await Project.find({
  createdAt: { 
    $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
  }
});
```

---

## 🔧 모델 사용 예시

### 1. 프로젝트 생성
```javascript
const Project = require('./models/Project');

const newProject = await Project.create({
  title: "E-커머스 비즈니스 모델",
  userId: "user-123",
  blocks: [
    {
      type: "customer",
      position: { x: 100, y: 100 },
      properties: {
        name: "20대 여성",
        segment: "패션 관심층",
        marketSize: 1000000,
        willingnessToPay: 50000,
        urgency: 4
      }
    },
    {
      type: "paid-ads",
      position: { x: 300, y: 100 },
      properties: {
        name: "인스타그램 광고",
        platform: "instagram",
        dailyBudget: 100000,
        cpc: 500,
        ctr: 2.5,
        campaignOn: true
      }
    }
  ],
  connections: [
    {
      id: "conn-1",
      from: "node-customer",
      to: "node-ads",
      type: "traffic"
    }
  ]
});

console.log(newProject._id); // MongoDB가 자동 생성한 ID
```

### 2. 프로젝트 조회
```javascript
// ID로 조회
const project = await Project.findById("507f1f77bcf86cd799439011");

// 사용자별 조회
const userProjects = await Project.find({ userId: "user-123" });

// 제목 검색
const searchResults = await Project.find({ 
  title: { $regex: "커머스", $options: "i" }  // 대소문자 무시
});
```

### 3. 프로젝트 업데이트
```javascript
// 전체 교체
await Project.findByIdAndUpdate(
  projectId,
  { 
    title: "새 제목",
    blocks: [...],
    connections: [...]
  },
  { new: true }  // 업데이트된 문서 반환
);

// 블록 추가
await Project.findByIdAndUpdate(
  projectId,
  { 
    $push: { 
      blocks: {
        type: "subscription",
        position: { x: 500, y: 100 },
        properties: { name: "구독", monthlyPrice: 9900 }
      }
    }
  }
);

// 특정 블록 수정
await Project.updateOne(
  { _id: projectId, "blocks.type": "customer" },
  { 
    $set: { 
      "blocks.$.properties.segment": "30대 남성" 
    }
  }
);
```

### 4. 프로젝트 삭제
```javascript
// ID로 삭제
await Project.findByIdAndDelete(projectId);

// 조건부 삭제 (사용자의 모든 프로젝트)
await Project.deleteMany({ userId: "user-123" });
```

## 📊 인덱스 추가 (성능 최적화)

```javascript
// ProjectSchema에 인덱스 추가
ProjectSchema.index({ userId: 1 });                    // 사용자별 조회
ProjectSchema.index({ createdAt: -1 });                // 최신순 정렬
ProjectSchema.index({ userId: 1, updatedAt: -1 });     // 복합 인덱스
ProjectSchema.index({ title: "text" });                // 텍스트 검색

// 사용 예시
const projects = await Project.find({ userId: "user-123" })
  .sort({ updatedAt: -1 });  // 인덱스 활용으로 빠른 조회
```

## 🔍 유효성 검증 추가

```javascript
// ProjectSchema에 커스텀 검증 추가
const ProjectSchema = new Schema({
  title: { 
    type: String, 
    required: [true, '프로젝트 제목은 필수입니다'],
    minlength: [3, '제목은 최소 3자 이상이어야 합니다'],
    maxlength: [100, '제목은 100자를 초과할 수 없습니다']
  },
  userId: { 
    type: String, 
    required: [true, '사용자 ID는 필수입니다'],
    validate: {
      validator: function(v) {
        return /^user-\d+$/.test(v);  // user-123 형식 검증
      },
      message: 'userId는 user-숫자 형식이어야 합니다'
    }
  },
  blocks: {
    type: [BlockSchema],
    validate: {
      validator: function(v) {
        return v.length <= 50;  // 최대 50개 블록
      },
      message: '블록은 최대 50개까지만 추가할 수 있습니다'
    }
  }
});
```

## 🎯 가상 필드 (Virtual Fields)

```javascript
// 블록 개수 계산
ProjectSchema.virtual('blockCount').get(function() {
  return this.blocks.length;
});

// 연결선 개수 계산
ProjectSchema.virtual('connectionCount').get(function() {
  return this.connections.length;
});

// JSON 변환 시 포함
ProjectSchema.set('toJSON', { virtuals: true });
ProjectSchema.set('toObject', { virtuals: true });

// 사용
const project = await Project.findById(id);
console.log(project.blockCount);       // 10
console.log(project.connectionCount);  // 15
```

---

**모델 설계 시 주의사항:**
- Mixed 타입은 편리하지만 타입 안정성 낮음
- 대규모 데이터 시 인덱스 필수
- 배열 필드는 크기 제한 고려 (MongoDB 문서 크기 16MB 제한)
- 중첩된 업데이트 시 `markModified()` 호출 필요








