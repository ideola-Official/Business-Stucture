# 서버 설정 (Server Configuration)

## 📋 개요

이 폴더는 서버의 설정 파일을 포함합니다. 현재는 MongoDB 데이터베이스 연결 설정만 포함되어 있습니다.

## 📄 파일 목록

### db.js

MongoDB 데이터베이스 연결을 초기화하고 관리하는 모듈입니다.

## 🔧 db.js 상세 설명

### 전체 코드

```javascript
const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is not set in environment variables");
  }

  try {
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
```

### 코드 라인별 설명

#### 1. Mongoose 임포트

```javascript
const mongoose = require("mongoose");
```

- **Mongoose**: MongoDB를 위한 ODM(Object Data Modeling) 라이브러리
- JavaScript 객체와 MongoDB 문서 간의 매핑 제공
- 스키마 정의, 유효성 검증, 쿼리 빌더 등의 기능 제공

#### 2. 비동기 연결 함수 정의

```javascript
async function connectDB() {
```

- **async**: 비동기 함수로 선언 (await 사용 가능)
- MongoDB 연결은 시간이 걸리므로 비동기 처리 필수

#### 3. 환경 변수에서 URI 가져오기

```javascript
const uri = process.env.MONGO_URI;
```

- **process.env.MONGO_URI**: `.env` 파일에서 설정한 MongoDB 연결 문자열
- 예시:
  - 로컬: `mongodb://localhost:27017/business-structure`
  - Atlas: `mongodb+srv://user:password@cluster.mongodb.net/dbname`

#### 4. URI 유효성 검사

```javascript
if (!uri) {
  throw new Error("MONGO_URI is not set in environment variables");
}
```

- 환경 변수가 설정되지 않았을 경우 즉시 에러 발생
- 서버 시작 전에 설정 문제를 조기에 발견

#### 5. MongoDB 연결 시도

```javascript
try {
  const conn = await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
```

**mongoose.connect(uri, options)**

- **uri**: MongoDB 연결 문자열
- **옵션 설명:**
  - `useNewUrlParser: true`
    - 새로운 MongoDB 연결 문자열 파서 사용
    - 구버전 파서는 deprecated되었으므로 필수
  - `useUnifiedTopology: true`
    - 새로운 서버 탐지 및 모니터링 엔진 사용
    - 더 안정적인 연결 관리 제공

**반환값 (conn):**

```javascript
{
  connection: {
    host: 'localhost',
    port: 27017,
    name: 'business-structure',
    readyState: 1,  // 1 = connected
    // ... 기타 정보
  },
  models: {},
  // ...
}
```

#### 6. 연결 성공 로그

```javascript
console.log(`MongoDB connected: ${conn.connection.host}`);
```

- 연결된 MongoDB 서버 호스트 출력
- 예시: `MongoDB connected: localhost`
- 서버 시작 시 연결 상태를 쉽게 확인 가능

#### 7. 에러 처리

```javascript
} catch (error) {
  console.error('MongoDB connection error:', error.message);
  process.exit(1);
}
```

**에러 발생 시 동작:**

1. **console.error()**: 에러 메시지를 콘솔에 출력
2. **process.exit(1)**: 프로세스 종료
   - `1`: 비정상 종료 코드
   - `0`: 정상 종료 코드
   - MongoDB 연결 없이는 서버가 작동할 수 없으므로 종료

**일반적인 에러:**

- `MongoNetworkError`: 네트워크 연결 실패
- `MongooseServerSelectionError`: MongoDB 서버를 찾을 수 없음
- `MongoParseError`: 잘못된 연결 문자열

#### 8. 함수 내보내기

```javascript
module.exports = connectDB;
```

- CommonJS 모듈 시스템으로 함수 내보내기
- `server.js`에서 `require('./config/db')`로 임포트하여 사용

## 🔗 사용 예시

### server.js에서 사용

```javascript
const connectDB = require("./config/db");

// 서버 시작 시 DB 연결
connectDB();

// 또는 async/await 사용
(async () => {
  await connectDB();
  console.log("Database ready, starting server...");
})();
```

## 🛠️ MongoDB 연결 문자열 형식

### 로컬 MongoDB

```
mongodb://[username:password@]host[:port]/database[?options]
```

**예시:**

```bash
# 인증 없이
mongodb://localhost:27017/business-structure

# 인증 포함
mongodb://admin:password123@localhost:27017/business-structure

# 옵션 추가
mongodb://localhost:27017/business-structure?authSource=admin
```

### MongoDB Atlas (클라우드)

```
mongodb+srv://[username:password@]cluster.mongodb.net/database[?options]
```

**예시:**

```bash
mongodb+srv://myuser:mypassword@cluster0.abcde.mongodb.net/business-structure?retryWrites=true&w=majority
```

**URI 구성 요소:**

- `mongodb+srv://`: SRV 레코드 사용 (DNS 자동 검색)
- `myuser:mypassword`: 데이터베이스 사용자 인증 정보
- `cluster0.abcde.mongodb.net`: Atlas 클러스터 주소
- `business-structure`: 데이터베이스 이름
- `retryWrites=true`: 쓰기 재시도 활성화
- `w=majority`: 쓰기 확인 수준 (과반수 노드)

## 🔒 보안 모범 사례

### 1. .env 파일 사용

```bash
# .env
MONGO_URI=mongodb://localhost:27017/business-structure
```

### 2. .gitignore에 추가

```gitignore
# .gitignore
.env
.env.local
.env.production
```

### 3. 예시 파일 제공

```bash
# .env.example
MONGO_URI=mongodb://localhost:27017/your-database-name
PORT=5000
```

### 4. 프로덕션 환경 설정

```bash
# 환경 변수로 직접 설정 (Heroku, AWS 등)
heroku config:set MONGO_URI="mongodb+srv://..."

# 또는 .env.production 파일 사용
```

## 🧪 연결 테스트

### Mongoose 이벤트 리스너 추가

연결 상태를 더 세밀하게 모니터링할 수 있습니다:

```javascript
const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is not set in environment variables");
  }

  // 연결 이벤트 리스너
  mongoose.connection.on("connected", () => {
    console.log("✅ Mongoose connected to MongoDB");
  });

  mongoose.connection.on("error", (err) => {
    console.error("❌ Mongoose connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("⚠️ Mongoose disconnected from MongoDB");
  });

  // Graceful shutdown
  process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("Mongoose connection closed due to app termination");
    process.exit(0);
  });

  try {
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
```

### 연결 재시도 로직

```javascript
async function connectDB(retries = 5) {
  const uri = process.env.MONGO_URI;

  for (let i = 0; i < retries; i++) {
    try {
      const conn = await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // 5초 타임아웃
      });
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`Connection attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) {
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2초 대기
    }
  }
}
```

## 📊 Mongoose 연결 상태

```javascript
// 연결 상태 확인
console.log(mongoose.connection.readyState);

// readyState 값:
// 0 = disconnected
// 1 = connected
// 2 = connecting
// 3 = disconnecting
```

## 🐛 문제 해결

### 연결 타임아웃

```javascript
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // 10초로 증가
  socketTimeoutMS: 45000,
});
```

### 연결 풀 설정

```javascript
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10, // 최대 연결 수
  minPoolSize: 2, // 최소 연결 수
});
```

## 📚 추가 리소스

- [Mongoose 공식 문서](https://mongoosejs.com/docs/connections.html)
- [MongoDB 연결 문자열 문서](https://docs.mongodb.com/manual/reference/connection-string/)
- [MongoDB Atlas 가이드](https://www.mongodb.com/cloud/atlas)

---

**연결 설정 시 주의사항:**

- 환경 변수는 반드시 `.env` 파일에 보관
- 프로덕션에서는 연결 풀 크기 조정 필요
- Atlas 사용 시 IP 화이트리스트 설정 확인
- 연결 실패 시 재시도 로직 구현 권장







