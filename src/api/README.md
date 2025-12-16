# API 클라이언트 (API Client)

## 📋 개요

이 폴더는 백엔드 서버와 통신하기 위한 API 클라이언트 함수를 포함합니다. Fetch API를 사용하여 HTTP 요청을 보내고, JSON 형태로 데이터를 주고받습니다.

## 📄 파일 목록

```
api/
└── projects.ts     # 프로젝트 저장/로드 API
```

---

## 📡 projects.ts - 프로젝트 API

### 타입 정의

#### SaveProjectPayload
프로젝트 저장 시 전송하는 데이터 구조입니다.

```typescript
export interface SaveProjectPayload {
  title: string;              // 프로젝트 제목
  userId: string;             // 사용자 ID
  blocks: Node[];             // 블록 배열
  connections: Connection[];  // 연결 배열
}
```

**예시:**
```typescript
const payload: SaveProjectPayload = {
  title: "나의 SaaS 비즈니스 모델",
  userId: "user-123",
  blocks: [
    {
      id: "node-1",
      type: "customer",
      position: { x: 100, y: 100 },
      data: { name: "타겟 고객", segment: "20-30대" }
    },
    {
      id: "node-2",
      type: "paid-ads",
      position: { x: 300, y: 100 },
      data: { name: "페이스북 광고", dailyBudget: 50000, cpc: 800 }
    }
  ],
  connections: [
    {
      id: "conn-1",
      from: "node-1",
      to: "node-2",
      type: "traffic",
      metrics: { traffic: 1000, conversionRate: 100, dropoffRate: 0 }
    }
  ]
};
```

---

### 주요 함수

#### saveProject()
프로젝트를 서버에 저장합니다.

```typescript
export async function saveProject(payload: SaveProjectPayload): Promise<any>
```

**매개변수:**
- `payload`: 저장할 프로젝트 데이터 (SaveProjectPayload 타입)

**반환값:**
- `Promise<any>`: 서버에서 반환한 생성된 프로젝트 객체 (MongoDB `_id` 포함)

**동작 과정:**

##### 1. HTTP POST 요청 생성
```typescript
const res = await fetch("/api/projects", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});
```

**요청 구성 요소:**
- **URL**: `/api/projects`
  - 프로덕션: `https://your-domain.com/api/projects`
  - 개발: Vite 프록시를 통해 `http://localhost:5000/api/projects`로 전달
- **Method**: POST (새 리소스 생성)
- **Headers**:
  - `Content-Type: application/json`: JSON 데이터 전송
- **Body**: payload를 JSON 문자열로 변환

##### 2. 에러 처리
```typescript
if (!res.ok) {
  const message = await res.text();
  throw new Error(message || "Failed to save project");
}
```

**에러 시나리오:**
- **400 Bad Request**: `title` 또는 `userId` 누락
  ```json
  {
    "error": "title and userId are required"
  }
  ```
- **500 Internal Server Error**: 서버 오류 (MongoDB 연결 실패 등)
  ```json
  {
    "error": "Failed to create project"
  }
  ```

**에러 처리 흐름:**
```
1. res.ok 확인 (상태 코드 200-299 범위?)
2. 아니면 → res.text()로 에러 메시지 읽기
3. Error 객체로 throw
4. 호출한 곳에서 try-catch로 잡음
```

##### 3. 성공 시 응답 반환
```typescript
return res.json();
```

**성공 응답 예시:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "나의 SaaS 비즈니스 모델",
  "userId": "user-123",
  "blocks": [...],
  "connections": [...],
  "createdAt": "2024-12-10T10:30:00.000Z",
  "updatedAt": "2024-12-10T10:30:00.000Z"
}
```

---

#### loadProject()
서버에서 프로젝트를 불러옵니다.

```typescript
export async function loadProject(id: string): Promise<any>
```

**매개변수:**
- `id`: 프로젝트 MongoDB ID (예: "507f1f77bcf86cd799439011")

**반환값:**
- `Promise<any>`: 프로젝트 객체 (블록 및 연결 포함)

**동작 과정:**

##### 1. HTTP GET 요청
```typescript
const res = await fetch(`/api/projects/${id}`);
```

**URL 예시:**
```
/api/projects/507f1f77bcf86cd799439011
```

**요청 특징:**
- Method: GET (리소스 조회)
- Headers 불필요 (읽기 전용)
- Body 없음

##### 2. 에러 처리
```typescript
if (!res.ok) {
  const message = await res.text();
  throw new Error(message || "Failed to load project");
}
```

**에러 시나리오:**
- **404 Not Found**: 존재하지 않는 ID
  ```json
  {
    "error": "Project not found"
  }
  ```
- **500 Internal Server Error**: 서버 오류
  ```json
  {
    "error": "Failed to fetch project"
  }
  ```

##### 3. 성공 시 프로젝트 반환
```typescript
return res.json();
```

**성공 응답:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "나의 SaaS 비즈니스 모델",
  "userId": "user-123",
  "blocks": [
    {
      "id": "node-1",
      "type": "customer",
      "position": { "x": 100, "y": 100 },
      "data": { "name": "타겟 고객" }
    }
  ],
  "connections": [
    {
      "id": "conn-1",
      "from": "node-1",
      "to": "node-2",
      "type": "traffic"
    }
  ],
  "createdAt": "2024-12-10T10:30:00.000Z",
  "updatedAt": "2024-12-10T10:30:00.000Z"
}
```

---

### 사용 예시

#### App.tsx에서 프로젝트 저장
```typescript
import { saveProject } from './api/projects';

const handleSaveProject = async () => {
  try {
    const payload = {
      title: "Biz-Architect Project",
      userId: "demo-user",
      blocks: nodes,
      connections: connections
    };
    
    const savedProject = await saveProject(payload);
    
    console.log("저장 성공! ID:", savedProject._id);
    alert("프로젝트가 저장되었습니다.");
  } catch (error) {
    console.error("저장 실패:", error);
    alert("저장 중 오류가 발생했습니다: " + error.message);
  }
};
```

#### 프로젝트 불러오기
```typescript
import { loadProject } from './api/projects';

const handleLoadProject = async (projectId: string) => {
  try {
    const project = await loadProject(projectId);
    
    // 불러온 데이터로 상태 업데이트
    setNodes(project.blocks);
    setConnections(project.connections);
    
    console.log("불러오기 성공:", project.title);
    alert("프로젝트를 불러왔습니다.");
  } catch (error) {
    console.error("불러오기 실패:", error);
    alert("불러오기 중 오류가 발생했습니다: " + error.message);
  }
};
```

---

### 개선 사항

#### 1. 타입 안정성 강화
현재 `Promise<any>`를 `Promise<Project>`로 변경:

```typescript
// types.ts에 추가
export interface Project {
  _id: string;
  title: string;
  userId: string;
  blocks: Node[];
  connections: Connection[];
  createdAt: string;
  updatedAt: string;
}

// projects.ts에서 사용
export async function saveProject(payload: SaveProjectPayload): Promise<Project> {
  // ... 기존 코드
  return res.json() as Promise<Project>;
}

export async function loadProject(id: string): Promise<Project> {
  // ... 기존 코드
  return res.json() as Promise<Project>;
}
```

#### 2. 로딩 상태 관리
```typescript
// App.tsx에서 사용
const [isSaving, setIsSaving] = useState(false);

const handleSaveProject = async () => {
  setIsSaving(true);
  try {
    await saveProject(payload);
    alert("저장 성공!");
  } catch (error) {
    alert("저장 실패: " + error.message);
  } finally {
    setIsSaving(false);
  }
};

// UI
<Button onClick={handleSaveProject} disabled={isSaving}>
  {isSaving ? "저장 중..." : "저장"}
</Button>
```

#### 3. 재시도 로직
```typescript
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  retries = 3
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.ok || i === retries - 1) return res;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // 지수 백오프
    }
  }
  throw new Error("Max retries reached");
}

export async function saveProject(payload: SaveProjectPayload): Promise<any> {
  const res = await fetchWithRetry("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Failed to save project");
  }
  
  return res.json();
}
```

#### 4. 인증 토큰 추가
```typescript
export async function saveProject(
  payload: SaveProjectPayload,
  token?: string
): Promise<any> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const res = await fetch("/api/projects", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  
  // ... 나머지 코드
}
```

#### 5. API 베이스 URL 설정
```typescript
// config.ts
export const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV 
    ? 'http://localhost:5000' 
    : 'https://api.your-domain.com');

// projects.ts
import { API_BASE_URL } from './config';

export async function saveProject(payload: SaveProjectPayload): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  
  // ... 나머지 코드
}
```

**환경 변수 (.env):**
```bash
# .env.development
VITE_API_BASE_URL=http://localhost:5000

# .env.production
VITE_API_BASE_URL=https://api.your-domain.com
```

---

### 추가 API 함수 (향후)

#### updateProject()
기존 프로젝트 수정

```typescript
export async function updateProject(
  id: string, 
  payload: SaveProjectPayload
): Promise<any> {
  const res = await fetch(`/api/projects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Failed to update project");
  }

  return res.json();
}
```

#### deleteProject()
프로젝트 삭제

```typescript
export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`/api/projects/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Failed to delete project");
  }
}
```

#### listProjects()
사용자의 모든 프로젝트 조회

```typescript
export async function listProjects(
  userId: string, 
  page = 1, 
  limit = 10
): Promise<any> {
  const res = await fetch(
    `/api/projects?userId=${userId}&page=${page}&limit=${limit}`
  );

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Failed to fetch projects");
  }

  return res.json();
}
```

---

### 에러 처리 전략

#### 커스텀 에러 클래스
```typescript
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any
  ) {
    super(message);
    this.name = "APIError";
  }
}

export async function saveProject(payload: SaveProjectPayload): Promise<any> {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new APIError(
      errorData.error || "Failed to save project",
      res.status,
      errorData
    );
  }

  return res.json();
}
```

**사용:**
```typescript
try {
  await saveProject(payload);
} catch (error) {
  if (error instanceof APIError) {
    if (error.statusCode === 400) {
      alert("입력 데이터를 확인하세요.");
    } else if (error.statusCode === 500) {
      alert("서버 오류입니다. 잠시 후 다시 시도하세요.");
    }
  }
}
```

---

## 🧪 테스트

### Mock을 사용한 단위 테스트 (Vitest)

```typescript
// projects.test.ts
import { describe, it, expect, vi } from 'vitest';
import { saveProject, loadProject } from './projects';

global.fetch = vi.fn();

describe('saveProject', () => {
  it('성공 시 프로젝트 반환', async () => {
    const mockResponse = { _id: '123', title: 'Test' };
    
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await saveProject({
      title: 'Test',
      userId: 'user1',
      blocks: [],
      connections: [],
    });

    expect(result).toEqual(mockResponse);
  });

  it('실패 시 에러 throw', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      text: async () => 'Error message',
    });

    await expect(
      saveProject({
        title: 'Test',
        userId: 'user1',
        blocks: [],
        connections: [],
      })
    ).rejects.toThrow('Error message');
  });
});
```

---

**API 클라이언트 개발 원칙:**
- ✅ 타입 안정성 확보
- ✅ 명확한 에러 메시지
- ✅ 비동기 처리 (async/await)
- ✅ 환경별 URL 분리
- ✅ 재시도 로직 (네트워크 불안정 대비)
- ✅ 로딩 상태 제공
- ✅ 인증 토큰 지원 (향후)








