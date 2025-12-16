# 백엔드 서버 (Backend Server)

## 📋 개요

이 폴더는 Business Structure 애플리케이션의 백엔드 서버입니다. Node.js와 Express 프레임워크를 사용하여 RESTful API를 제공하고, MongoDB와 연결하여 프로젝트 데이터를 영구 저장합니다.

## 🏗️ 폴더 구조

```
server/
├── config/              # 설정 파일
│   └── db.js           # MongoDB 연결 설정
│
├── models/             # 데이터 모델
│   └── Project.js      # 프로젝트 스키마 정의
│
├── routes/             # API 라우트
│   └── projectRoutes.js # 프로젝트 관련 API 엔드포인트
│
├── server.js           # 서버 진입점 및 설정
├── package.json        # 의존성 및 스크립트
└── .env               # 환경 변수 (gitignore됨)
```

## 🚀 실행 방법

### 1. 의존성 설치

```bash
cd server
npm install
```

### 2. 환경 변수 설정

`.env` 파일 생성:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/business-structure
```

**환경 변수 설명:**

- `PORT`: 서버가 실행될 포트 번호 (기본값: 5000)
- `MONGO_URI`: MongoDB 연결 문자열
  - 로컬: `mongodb://localhost:27017/business-structure`
  - Atlas: `mongodb+srv://<username>:<password>@cluster.mongodb.net/business-structure`

### 3. 서버 실행

**개발 모드 (자동 재시작):**

```bash
npm run dev
```

**프로덕션 모드:**

```bash
npm start
```

서버는 `http://localhost:5000`에서 실행됩니다.

## 📡 API 엔드포인트

### Health Check

상태 확인용 엔드포인트

**요청:**

```http
GET /api/health
```

**응답:**

```json
{
  "status": "ok"
}
```

### 프로젝트 생성

새로운 비즈니스 구조 프로젝트를 생성합니다.

**요청:**

```http
POST /api/projects
Content-Type: application/json

{
  "title": "My Business Model",
  "userId": "user123",
  "blocks": [
    {
      "id": "node-1",
      "type": "customer",
      "position": { "x": 100, "y": 100 },
      "data": { "name": "타겟 고객", "segment": "20-30대" }
    }
  ],
  "connections": [
    {
      "id": "conn-1",
      "from": "node-1",
      "to": "node-2",
      "type": "traffic"
    }
  ]
}
```

**응답:**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "My Business Model",
  "userId": "user123",
  "blocks": [...],
  "connections": [...],
  "createdAt": "2024-12-10T10:30:00.000Z",
  "updatedAt": "2024-12-10T10:30:00.000Z"
}
```

**에러 응답:**

```json
{
  "error": "title and userId are required"
}
```

### 프로젝트 조회

특정 프로젝트를 ID로 조회합니다.

**요청:**

```http
GET /api/projects/:id
```

**예시:**

```http
GET /api/projects/507f1f77bcf86cd799439011
```

**응답:**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "My Business Model",
  "userId": "user123",
  "blocks": [...],
  "connections": [...],
  "createdAt": "2024-12-10T10:30:00.000Z",
  "updatedAt": "2024-12-10T10:30:00.000Z"
}
```

**에러 응답 (404):**

```json
{
  "error": "Project not found"
}
```

### 프로젝트 업데이트

기존 프로젝트를 수정합니다.

**요청:**

```http
PUT /api/projects/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "userId": "user123",
  "blocks": [...],
  "connections": [...]
}
```

**응답:**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Updated Title",
  "userId": "user123",
  "blocks": [...],
  "connections": [...],
  "createdAt": "2024-12-10T10:30:00.000Z",
  "updatedAt": "2024-12-10T11:45:00.000Z"
}
```

## 📄 상세 파일 설명

### server.js

서버의 진입점이자 설정 파일입니다.

**주요 기능:**

```javascript
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const projectRoutes = require("./routes/projectRoutes");

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
app.use(cors()); // CORS 허용 (프론트엔드 통신)
app.use(express.json()); // JSON 파싱

// 데이터베이스 연결
connectDB();

// 라우트 등록
app.use("/api/projects", projectRoutes);

// 헬스 체크 엔드포인트
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**코드 설명:**

1. **dotenv.config()**: `.env` 파일의 환경 변수를 `process.env`로 로드
2. **cors()**: 프론트엔드(다른 도메인)에서의 요청 허용
3. **express.json()**: 요청 본문의 JSON 자동 파싱
4. **connectDB()**: MongoDB 연결 초기화
5. **app.use("/api/projects", projectRoutes)**: `/api/projects/*` 경로를 projectRoutes로 위임

### package.json

서버의 의존성과 스크립트를 정의합니다.

**주요 의존성:**

```json
{
  "dependencies": {
    "cors": "^2.8.5", // Cross-Origin 요청 허용
    "dotenv": "^16.4.5", // 환경 변수 관리
    "express": "^4.19.2", // 웹 프레임워크
    "mongoose": "^8.8.1" // MongoDB ODM
  }
}
```

**스크립트:**

```json
{
  "scripts": {
    "start": "node server.js", // 프로덕션 실행
    "dev": "nodemon server.js" // 개발 모드 (자동 재시작)
  }
}
```

**참고:** `nodemon`은 파일 변경 시 자동으로 서버를 재시작하는 개발 도구입니다.

## 🗄️ 데이터베이스

### MongoDB 연결

- **ORM/ODM**: Mongoose 사용
- **연결 방식**: `config/db.js`에서 관리
- **데이터베이스명**: `business-structure` (기본값)

### 컬렉션 구조

- **projects**: 사용자의 비즈니스 모델 프로젝트 저장
  - 자세한 스키마는 [models/README.md](./models/README.md) 참조

## 🔒 보안 고려사항

### 현재 구현

- ✅ CORS 활성화
- ✅ JSON 파싱 제한 (Express 기본값)
- ✅ 환경 변수로 민감 정보 관리

### 프로덕션 적용 시 추가 필요

- 🔐 인증/인가 (JWT, Passport 등)
- 🛡️ Rate Limiting (요청 속도 제한)
- 🔍 입력 값 검증 (express-validator)
- 🚫 Helmet.js (보안 헤더)
- 📝 로깅 (Winston, Morgan)

**예시 (인증 추가):**

```javascript
const jwt = require("jsonwebtoken");

// 미들웨어: 토큰 검증
function authenticateToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

// 보호된 라우트
app.use("/api/projects", authenticateToken, projectRoutes);
```

## 🐛 에러 처리

현재 각 라우트에서 `try-catch`로 에러를 처리합니다.

**일반 에러 응답 형식:**

```json
{
  "error": "에러 메시지"
}
```

**상태 코드:**

- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `404`: 리소스 없음
- `500`: 서버 에러

## 📊 로깅

**콘솔 로그:**

```javascript
// MongoDB 연결 성공
MongoDB connected: localhost

// 서버 시작
Server running on port 5000

// 에러 로그
POST /api/projects error: [에러 상세]
```

**프로덕션 로깅 개선 예시:**

```javascript
const morgan = require("morgan");
const winston = require("winston");

// HTTP 요청 로깅
app.use(morgan("combined"));

// 파일 로깅
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});
```

## 🧪 테스트

**수동 테스트 (curl):**

```bash
# Health check
curl http://localhost:5000/api/health

# 프로젝트 생성
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","userId":"user1","blocks":[],"connections":[]}'

# 프로젝트 조회
curl http://localhost:5000/api/projects/<project-id>
```

**자동화 테스트 (향후 추가):**

```javascript
// Jest + Supertest 예시
const request = require("supertest");
const app = require("./server");

describe("POST /api/projects", () => {
  it("should create a new project", async () => {
    const res = await request(app)
      .post("/api/projects")
      .send({ title: "Test", userId: "user1", blocks: [], connections: [] });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
  });
});
```

## 🔗 관련 문서

- [config/README.md](./config/README.md) - 데이터베이스 설정
- [models/README.md](./models/README.md) - 데이터 모델 스키마
- [routes/README.md](./routes/README.md) - API 라우트 상세

## 📞 문제 해결

### MongoDB 연결 실패

```
MongoDB connection error: MongooseServerSelectionError
```

**해결 방법:**

1. MongoDB가 실행 중인지 확인: `mongod --version`
2. MONGO_URI가 올바른지 확인
3. 네트워크/방화벽 설정 확인

### 포트 이미 사용 중

```
Error: listen EADDRINUSE: address already in use :::5000
```

**해결 방법:**

```bash
# 포트 사용 프로세스 확인 (macOS/Linux)
lsof -i :5000

# 프로세스 종료
kill -9 <PID>

# 또는 .env에서 다른 포트 사용
PORT=5001
```

### CORS 에러

```
Access to fetch at 'http://localhost:5000/api/projects' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**해결 방법:**
`server.js`에 CORS가 이미 적용되어 있으므로, 서버 재시작 후 확인.

---

**서버 개발 시 참고사항:**

- 모든 API는 `/api` 접두사 사용
- 에러는 명확한 메시지와 적절한 상태 코드 반환
- 비동기 작업은 항상 `async/await` 또는 Promise 사용
- 데이터 검증은 라우트 레벨에서 수행







