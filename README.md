# Business Structure Design Proposal

Figma 원본: https://www.figma.com/design/msOgLurkeznkKgSwo5Wma6/Business-Structure-Design-Proposal

## 프로젝트 구조

- `src/` 프론트엔드 (Vite + React + TypeScript)
  - `components/` 캔버스, 노드, 인스펙터, 시뮬레이터 등 UI
  - `api/` 프로젝트 저장/불러오기 fetch 유틸
  - `utils/` 비즈니스 로직, 시뮬레이션 계산
- `server/` 백엔드 (Node.js + Express + MongoDB)
  - `config/db.js` MONGO_URI로 DB 연결
  - `models/Project.js` Project 스키마 (blocks + connections)
  - `routes/projectRoutes.js` `/api/projects` CRUD
  - `server.js` Express 엔트리, `/api/health`
- `vite.config.ts` Vite 설정
- `package.json` 프론트 의존성/스크립트
- `server/package.json` 백엔드 의존성/스크립트

## 실행 방법

### 프론트엔드

```bash
npm install
npm run dev   # http://localhost:3000
```

### 백엔드

```bash
cd server
npm install
# server/.env에 MONGO_URI, PORT=5001 등 설정
npm run dev   # nodemon
```

헬스체크: `GET http://localhost:5001/api/health`

## 주요 기능

### 🎯 스마트 엣지 (Smart Edge)

연결선에 비즈니스 흐름을 시각화하는 인터랙티브 기능:

- **타원형 전환율 뱃지**: 연결선 중앙에 전환율 표시 (기본 100%)
- **클릭하여 수정**: 뱃지 클릭 시 팝업으로 전환율 즉시 수정 가능
- **실시간 반영**: 수정된 전환율이 시뮬레이션에 즉시 반영되어 다음 노드 유입량 계산
- **색상 코딩**: 전환율에 따라 뱃지 색상 자동 변경 (빨강→주황→파랑→초록)
- **트래픽 표시**: 각 연결을 통과하는 사용자 수 실시간 표시

## API 개요

- `POST /api/projects` 블록/연결 저장
- `GET  /api/projects/:id` 저장된 프로젝트 조회
- `PUT  /api/projects/:id` 프로젝트 업데이트
