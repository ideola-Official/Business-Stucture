# API 라우트 (API Routes)

## 📋 개요

이 폴더는 Express 라우트 핸들러를 포함합니다. RESTful API 엔드포인트를 정의하고 HTTP 요청을 처리합니다.

## 📄 파일 목록

### projectRoutes.js
프로젝트(비즈니스 모델) 관련 CRUD 작업을 처리하는 라우트입니다.

---

## 🔧 projectRoutes.js 상세 설명

### 전체 코드 구조

```javascript
const express = require('express');
const Project = require('../models/Project');

const router = express.Router();

// POST /api/projects - 프로젝트 생성
router.post('/', async (req, res) => { ... });

// GET /api/projects/:id - 프로젝트 조회
router.get('/:id', async (req, res) => { ... });

// PUT /api/projects/:id - 프로젝트 업데이트
router.put('/:id', async (req, res) => { ... });

module.exports = router;
```

---

## 📡 API 엔드포인트 상세

### 1. POST /api/projects - 프로젝트 생성

새로운 비즈니스 모델 프로젝트를 생성합니다.

#### 코드 분석

```javascript
router.post('/', async (req, res) => {
  try {
    const { title, userId, blocks = [], connections = [] } = req.body || {};

    if (!title || !userId) {
      return res.status(400).json({ error: 'title and userId are required' });
    }

    const project = await Project.create({ title, userId, blocks, connections });
    return res.status(201).json(project);
  } catch (error) {
    console.error('POST /api/projects error:', error);
    return res.status(500).json({ error: 'Failed to create project' });
  }
});
```

#### 라인별 설명

##### 1. 요청 본문 추출
```javascript
const { title, userId, blocks = [], connections = [] } = req.body || {};
```

**설명:**
- **구조 분해 할당**: `req.body`에서 필요한 필드만 추출
- **기본값 설정**: `blocks`와 `connections`가 없으면 빈 배열
- **안전한 접근**: `req.body`가 undefined일 경우 빈 객체 사용

**예시 요청 본문:**
```json
{
  "title": "SaaS 비즈니스 모델",
  "userId": "user-123",
  "blocks": [
    {
      "type": "customer",
      "position": { "x": 100, "y": 100 },
      "properties": { "name": "타겟 고객" }
    }
  ],
  "connections": [
    {
      "id": "conn-1",
      "from": "node-1",
      "to": "node-2"
    }
  ]
}
```

##### 2. 입력 검증
```javascript
if (!title || !userId) {
  return res.status(400).json({ error: 'title and userId are required' });
}
```

**설명:**
- **필수 필드 검증**: `title`과 `userId`가 반드시 존재해야 함
- **상태 코드 400**: Bad Request (잘못된 요청)
- **조기 반환**: 검증 실패 시 즉시 에러 응답

**에러 응답 예시:**
```json
{
  "error": "title and userId are required"
}
```

**테스트 케이스:**
```javascript
// ❌ 실패: title 없음
POST /api/projects
{ "userId": "user-123" }
→ 400 Bad Request

// ❌ 실패: userId 없음
POST /api/projects
{ "title": "My Project" }
→ 400 Bad Request

// ✅ 성공
POST /api/projects
{ "title": "My Project", "userId": "user-123" }
→ 201 Created
```

##### 3. 프로젝트 생성
```javascript
const project = await Project.create({ title, userId, blocks, connections });
```

**설명:**
- **Project.create()**: Mongoose 모델의 `create()` 메서드
- **비동기 작업**: MongoDB에 문서 삽입 (await 필요)
- **자동 생성 필드**:
  - `_id`: MongoDB가 자동 생성하는 고유 ID
  - `createdAt`, `updatedAt`: 타임스탬프

**생성된 프로젝트 예시:**
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  title: "SaaS 비즈니스 모델",
  userId: "user-123",
  blocks: [...],
  connections: [...],
  createdAt: ISODate("2024-12-10T10:30:00.000Z"),
  updatedAt: ISODate("2024-12-10T10:30:00.000Z"),
  __v: 0  // Mongoose 버전 키
}
```

##### 4. 성공 응답
```javascript
return res.status(201).json(project);
```

**설명:**
- **상태 코드 201**: Created (리소스 생성 성공)
- **응답 본문**: 생성된 프로젝트 전체 데이터 반환
- JSON 형식으로 자동 변환

**응답 예시:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "SaaS 비즈니스 모델",
  "userId": "user-123",
  "blocks": [...],
  "connections": [...],
  "createdAt": "2024-12-10T10:30:00.000Z",
  "updatedAt": "2024-12-10T10:30:00.000Z"
}
```

##### 5. 에러 처리
```javascript
} catch (error) {
  console.error('POST /api/projects error:', error);
  return res.status(500).json({ error: 'Failed to create project' });
}
```

**설명:**
- **try-catch**: 예상치 못한 에러 포착
- **로깅**: 에러 내용을 콘솔에 출력 (디버깅용)
- **상태 코드 500**: Internal Server Error
- **일반 에러 메시지**: 보안상 상세 에러는 클라이언트에 노출하지 않음

**발생 가능한 에러:**
```javascript
// MongoDB 연결 실패
MongoNetworkError: connect ECONNREFUSED

// 검증 에러
ValidationError: Project validation failed: title: Path `title` is required

// 중복 키 에러 (인덱스가 있을 경우)
MongoError: E11000 duplicate key error
```

---

### 2. GET /api/projects/:id - 프로젝트 조회

특정 프로젝트를 ID로 조회합니다.

#### 코드 분석

```javascript
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.json(project);
  } catch (error) {
    console.error(`GET /api/projects/${req.params.id} error:`, error);
    return res.status(500).json({ error: 'Failed to fetch project' });
  }
});
```

#### 라인별 설명

##### 1. URL 파라미터 추출
```javascript
const { id } = req.params;
```

**설명:**
- **req.params**: URL 경로의 동적 세그먼트
- `/:id` → `req.params.id`

**예시:**
```http
GET /api/projects/507f1f77bcf86cd799439011

→ req.params.id = "507f1f77bcf86cd799439011"
```

##### 2. 데이터베이스 조회
```javascript
const project = await Project.findById(id);
```

**설명:**
- **findById()**: Mongoose 메서드로 `_id`로 문서 조회
- 자동으로 ObjectId 변환 시도
- 찾지 못하면 `null` 반환

**내부 동작:**
```javascript
// Mongoose가 자동으로 수행
Project.findOne({ _id: ObjectId(id) })
```

##### 3. 존재 여부 확인
```javascript
if (!project) {
  return res.status(404).json({ error: 'Project not found' });
}
```

**설명:**
- **상태 코드 404**: Not Found (리소스 없음)
- 잘못된 ID 또는 삭제된 프로젝트

**테스트 케이스:**
```javascript
// ❌ 존재하지 않는 ID
GET /api/projects/507f1f77bcf86cd799999999
→ 404 Not Found
{ "error": "Project not found" }

// ❌ 잘못된 ID 형식 (24자리 hex가 아님)
GET /api/projects/invalid-id
→ 500 Internal Server Error (CastError)

// ✅ 성공
GET /api/projects/507f1f77bcf86cd799439011
→ 200 OK
{ "_id": "507f...", "title": "..." }
```

##### 4. 성공 응답
```javascript
return res.json(project);
```

**설명:**
- **상태 코드 200**: OK (기본값, 명시 안 해도 됨)
- 프로젝트 데이터 전체 반환

**응답 예시:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "SaaS 비즈니스 모델",
  "userId": "user-123",
  "blocks": [
    {
      "type": "customer",
      "position": { "x": 100, "y": 100 },
      "properties": { "name": "타겟 고객" }
    }
  ],
  "connections": [],
  "createdAt": "2024-12-10T10:30:00.000Z",
  "updatedAt": "2024-12-10T10:30:00.000Z"
}
```

---

### 3. PUT /api/projects/:id - 프로젝트 업데이트

기존 프로젝트를 수정합니다.

#### 코드 분석

```javascript
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, userId, blocks, connections } = req.body || {};

    const project = await Project.findByIdAndUpdate(
      id,
      { title, userId, blocks, connections },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.json(project);
  } catch (error) {
    console.error(`PUT /api/projects/${req.params.id} error:`, error);
    return res.status(500).json({ error: 'Failed to update project' });
  }
});
```

#### 라인별 설명

##### 1. 파라미터 및 본문 추출
```javascript
const { id } = req.params;
const { title, userId, blocks, connections } = req.body || {};
```

**설명:**
- URL에서 프로젝트 ID 가져오기
- 요청 본문에서 업데이트할 필드 추출
- 부분 업데이트 지원 (일부 필드만 전송 가능)

**예시 요청:**
```http
PUT /api/projects/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "title": "새로운 제목",
  "blocks": [...]
}
```

##### 2. 업데이트 실행
```javascript
const project = await Project.findByIdAndUpdate(
  id,
  { title, userId, blocks, connections },
  { new: true, runValidators: true }
);
```

**메서드 파라미터:**
1. **id**: 업데이트할 문서의 ID
2. **업데이트 객체**: 변경할 필드들
3. **옵션 객체**:
   - `new: true`: 업데이트된 문서 반환 (기본값은 업데이트 전 문서)
   - `runValidators: true`: 스키마 검증 실행

**옵션 비교:**
```javascript
// new: false (기본값)
const project = await Project.findByIdAndUpdate(id, { title: "New" });
// → 업데이트 전 프로젝트 반환

// new: true
const project = await Project.findByIdAndUpdate(
  id, 
  { title: "New" },
  { new: true }
);
// → 업데이트 후 프로젝트 반환
```

**runValidators 동작:**
```javascript
// runValidators: false (기본값)
// → 검증 생략, 잘못된 데이터도 저장 가능

// runValidators: true
// → 스키마 검증 실행
// → 예: title이 100자 초과하면 ValidationError 발생
```

##### 3. 존재 여부 확인
```javascript
if (!project) {
  return res.status(404).json({ error: 'Project not found' });
}
```

**설명:**
- 존재하지 않는 ID로 업데이트 시도하면 `null` 반환
- 404 에러 응답

##### 4. 성공 응답
```javascript
return res.json(project);
```

**설명:**
- 업데이트된 프로젝트 데이터 반환
- `updatedAt` 필드가 자동으로 갱신됨

**응답 예시:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "새로운 제목",  // ← 변경됨
  "userId": "user-123",
  "blocks": [...],
  "connections": [...],
  "createdAt": "2024-12-10T10:30:00.000Z",
  "updatedAt": "2024-12-10T15:45:00.000Z"  // ← 갱신됨
}
```

---

## 🧪 API 테스트

### curl을 사용한 테스트

#### 1. 프로젝트 생성
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "테스트 프로젝트",
    "userId": "user-123",
    "blocks": [],
    "connections": []
  }'
```

#### 2. 프로젝트 조회
```bash
# ID는 위 명령 결과에서 받은 _id 사용
curl http://localhost:5000/api/projects/507f1f77bcf86cd799439011
```

#### 3. 프로젝트 업데이트
```bash
curl -X PUT http://localhost:5000/api/projects/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "수정된 제목",
    "userId": "user-123",
    "blocks": [
      {
        "type": "customer",
        "position": {"x": 100, "y": 100},
        "properties": {"name": "고객"}
      }
    ],
    "connections": []
  }'
```

### Postman 컬렉션

```json
{
  "info": {
    "name": "Business Structure API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create Project",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/api/projects",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"title\": \"My Project\",\n  \"userId\": \"user-123\",\n  \"blocks\": [],\n  \"connections\": []\n}"
        }
      }
    },
    {
      "name": "Get Project",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/projects/{{projectId}}"
      }
    },
    {
      "name": "Update Project",
      "request": {
        "method": "PUT",
        "url": "http://localhost:5000/api/projects/{{projectId}}",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"title\": \"Updated Title\"\n}"
        }
      }
    }
  ]
}
```

---

## 🔒 보안 개선 사항

### 1. 인증 미들웨어 추가

```javascript
const jwt = require('jsonwebtoken');

// JWT 검증 미들웨어
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

// 모든 라우트에 적용
router.use(authenticate);

// 또는 개별 라우트에 적용
router.post('/', authenticate, async (req, res) => { ... });
```

### 2. 권한 검증

```javascript
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // 권한 확인: 프로젝트 소유자만 조회 가능
    if (project.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return res.json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch project' });
  }
});
```

### 3. 입력 검증 강화

```javascript
const { body, validationResult } = require('express-validator');

router.post('/',
  [
    body('title')
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be 3-100 characters'),
    body('userId')
      .matches(/^user-\d+$/)
      .withMessage('Invalid userId format'),
    body('blocks')
      .isArray({ max: 50 })
      .withMessage('Blocks must be an array with max 50 items')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 나머지 로직...
  }
);
```

### 4. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const createProjectLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 10, // 최대 10개 프로젝트 생성
  message: 'Too many projects created, please try again later'
});

router.post('/', createProjectLimiter, async (req, res) => { ... });
```

---

## 🚀 추가 엔드포인트 제안

### DELETE /api/projects/:id - 프로젝트 삭제

```javascript
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.json({ message: 'Project deleted successfully', project });
  } catch (error) {
    console.error(`DELETE /api/projects/${req.params.id} error:`, error);
    return res.status(500).json({ error: 'Failed to delete project' });
  }
});
```

### GET /api/projects - 프로젝트 목록 조회

```javascript
router.get('/', async (req, res) => {
  try {
    const { userId, page = 1, limit = 10 } = req.query;
    
    const query = userId ? { userId } : {};
    
    const projects = await Project.find(query)
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Project.countDocuments(query);
    
    return res.json({
      projects,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalProjects: count
    });
  } catch (error) {
    console.error('GET /api/projects error:', error);
    return res.status(500).json({ error: 'Failed to fetch projects' });
  }
});
```

---

**라우트 개발 시 체크리스트:**
- ✅ try-catch로 에러 처리
- ✅ 적절한 HTTP 상태 코드 사용
- ✅ 입력 검증 수행
- ✅ 에러 로깅
- ✅ 일관된 응답 형식
- 🔲 인증/인가 추가 (프로덕션)
- 🔲 Rate limiting (프로덕션)
- 🔲 API 문서화 (Swagger/OpenAPI)








