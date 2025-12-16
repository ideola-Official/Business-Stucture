# UI 컴포넌트 라이브러리 (UI Components)

## 📋 개요

이 폴더는 **shadcn/ui** 기반의 재사용 가능한 UI 컴포넌트를 포함합니다. Radix UI의 접근성 높은 헤드리스 컴포넌트를 Tailwind CSS로 스타일링하여 완전히 커스터마이징 가능합니다.

## 🎨 shadcn/ui란?

**shadcn/ui**는 단순한 컴포넌트 라이브러리가 아니라, **복사-붙여넣기 방식의 컴포넌트 컬렉션**입니다.

### 특징
- ✅ **소유권**: npm 패키지가 아닌 프로젝트에 직접 추가
- ✅ **커스터마이징**: 코드가 직접 보이므로 자유롭게 수정 가능
- ✅ **접근성**: Radix UI 기반으로 WCAG 표준 준수
- ✅ **스타일링**: Tailwind CSS 사용
- ✅ **타입 안정성**: TypeScript로 작성

### 일반 컴포넌트 라이브러리와 차이점
```
Material-UI, Ant Design 등:
- npm install → node_modules에 설치
- 수정하려면 테마 오버라이드 필요
- 번들 크기 증가

shadcn/ui:
- 컴포넌트 파일을 직접 복사 → src/components/ui/에 저장
- 코드 직접 수정 가능
- 필요한 컴포넌트만 추가 → 번들 최적화
```

---

## 📦 포함된 컴포넌트 목록

### 폼 & 입력
- **button.tsx**: 버튼 (variant: default, destructive, outline, ghost, link)
- **input.tsx**: 텍스트 입력 필드
- **textarea.tsx**: 여러 줄 텍스트 입력
- **checkbox.tsx**: 체크박스
- **radio-group.tsx**: 라디오 버튼 그룹
- **switch.tsx**: 토글 스위치
- **slider.tsx**: 범위 슬라이더
- **select.tsx**: 드롭다운 선택
- **input-otp.tsx**: OTP 입력
- **form.tsx**: 폼 래퍼 (react-hook-form 연동)

### 오버레이
- **dialog.tsx**: 모달 대화상자
- **alert-dialog.tsx**: 확인/취소 대화상자
- **sheet.tsx**: 사이드 패널
- **drawer.tsx**: 드로어 (하단에서 올라오는 패널)
- **popover.tsx**: 팝오버
- **hover-card.tsx**: 호버 시 표시되는 카드
- **tooltip.tsx**: 툴팁
- **dropdown-menu.tsx**: 드롭다운 메뉴
- **context-menu.tsx**: 우클릭 메뉴
- **command.tsx**: 명령 팔레트 (Cmd+K 스타일)

### 레이아웃
- **card.tsx**: 카드 컨테이너
- **tabs.tsx**: 탭 네비게이션
- **accordion.tsx**: 아코디언 (펼침/접힘)
- **collapsible.tsx**: 접을 수 있는 섹션
- **separator.tsx**: 구분선
- **scroll-area.tsx**: 스크롤 영역
- **resizable.tsx**: 크기 조절 가능한 패널
- **sidebar.tsx**: 사이드바
- **aspect-ratio.tsx**: 고정 비율 컨테이너

### 네비게이션
- **navigation-menu.tsx**: 네비게이션 메뉴
- **menubar.tsx**: 메뉴 바
- **breadcrumb.tsx**: 브레드크럼 (경로 표시)
- **pagination.tsx**: 페이지네이션

### 피드백
- **alert.tsx**: 알림 메시지
- **badge.tsx**: 배지 (상태 표시)
- **progress.tsx**: 진행 표시줄
- **skeleton.tsx**: 스켈레톤 로딩
- **sonner.tsx**: 토스트 알림 (toast)

### 데이터 표시
- **table.tsx**: 테이블
- **avatar.tsx**: 아바타 (프로필 이미지)
- **calendar.tsx**: 캘린더
- **chart.tsx**: 차트 (recharts 연동)
- **carousel.tsx**: 캐러셀 (슬라이더)

### 기타
- **toggle.tsx**: 토글 버튼
- **toggle-group.tsx**: 토글 버튼 그룹
- **label.tsx**: 폼 라벨

---

## 🔧 주요 컴포넌트 사용법

### Button (button.tsx)
다양한 스타일의 버튼 컴포넌트

```typescript
import { Button } from "@/components/ui/button";

// 기본 버튼
<Button>클릭</Button>

// 변형
<Button variant="destructive">삭제</Button>
<Button variant="outline">외곽선</Button>
<Button variant="ghost">고스트</Button>
<Button variant="link">링크</Button>

// 크기
<Button size="sm">작음</Button>
<Button size="default">기본</Button>
<Button size="lg">큼</Button>
<Button size="icon">아이콘</Button>

// 비활성화
<Button disabled>비활성화</Button>

// 클릭 핸들러
<Button onClick={() => console.log('클릭!')}>
  클릭하세요
</Button>
```

**Variant 스타일:**
```typescript
const buttonVariants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline: "border border-input hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
};
```

---

### Slider (slider.tsx)
숫자 범위 입력을 위한 슬라이더

```typescript
import { Slider } from "@/components/ui/slider";

const [value, setValue] = useState([50]);

<Slider
  value={value}
  onValueChange={setValue}
  min={0}
  max={100}
  step={1}
/>

// 범위 슬라이더 (두 개의 핸들)
const [range, setRange] = useState([20, 80]);

<Slider
  value={range}
  onValueChange={setRange}
  min={0}
  max={100}
  step={5}
/>
```

**Inspector.tsx에서 사용 예시:**
```typescript
<Slider
  value={[selectedNode.data.conversionRate]}
  onValueChange={(values) => handleChange("conversionRate", values[0])}
  min={0}
  max={100}
  step={0.1}
/>
```

---

### Dialog (dialog.tsx)
모달 대화상자

```typescript
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

<Dialog>
  <DialogTrigger asChild>
    <Button>설정 열기</Button>
  </DialogTrigger>
  
  <DialogContent>
    <DialogHeader>
      <DialogTitle>프로젝트 설정</DialogTitle>
      <DialogDescription>
        프로젝트 이름과 설명을 변경할 수 있습니다.
      </DialogDescription>
    </DialogHeader>
    
    <div className="grid gap-4 py-4">
      <Input placeholder="프로젝트 이름" />
      <Textarea placeholder="설명" />
    </div>
    
    <DialogFooter>
      <Button variant="outline">취소</Button>
      <Button>저장</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**제어 가능한 Dialog:**
```typescript
const [isOpen, setIsOpen] = useState(false);

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  {/* ... */}
</Dialog>

// 프로그래밍 방식으로 열기/닫기
setIsOpen(true);
setIsOpen(false);
```

---

### Select (select.tsx)
드롭다운 선택

```typescript
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const [platform, setPlatform] = useState("facebook");

<Select value={platform} onValueChange={setPlatform}>
  <SelectTrigger>
    <SelectValue placeholder="플랫폼 선택" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="facebook">Facebook</SelectItem>
    <SelectItem value="google">Google</SelectItem>
    <SelectItem value="instagram">Instagram</SelectItem>
    <SelectItem value="naver">Naver</SelectItem>
  </SelectContent>
</Select>
```

---

### Card (card.tsx)
콘텐츠 그룹화를 위한 카드

```typescript
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>수익 요약</CardTitle>
    <CardDescription>이번 달 예상 수익</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-3xl font-bold">₩5,000,000</p>
  </CardContent>
  <CardFooter>
    <p className="text-sm text-muted-foreground">전월 대비 +12%</p>
  </CardFooter>
</Card>
```

---

### Tabs (tabs.tsx)
탭 네비게이션

```typescript
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">개요</TabsTrigger>
    <TabsTrigger value="analytics">분석</TabsTrigger>
    <TabsTrigger value="settings">설정</TabsTrigger>
  </TabsList>
  
  <TabsContent value="overview">
    <p>개요 내용...</p>
  </TabsContent>
  
  <TabsContent value="analytics">
    <p>분석 내용...</p>
  </TabsContent>
  
  <TabsContent value="settings">
    <p>설정 내용...</p>
  </TabsContent>
</Tabs>
```

---

### Tooltip (tooltip.tsx)
간단한 설명 팝업

```typescript
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">?</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>이것은 도움말입니다</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

### Alert (alert.tsx)
알림 메시지

```typescript
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

// 기본 알림
<Alert>
  <AlertTitle>알림</AlertTitle>
  <AlertDescription>
    변경 사항이 저장되었습니다.
  </AlertDescription>
</Alert>

// 경고 알림
<Alert variant="destructive">
  <AlertTriangle className="h-4 w-4" />
  <AlertTitle>에러</AlertTitle>
  <AlertDescription>
    파일을 저장하는 중 오류가 발생했습니다.
  </AlertDescription>
</Alert>
```

---

### Progress (progress.tsx)
진행 표시줄

```typescript
import { Progress } from "@/components/ui/progress";

const [progress, setProgress] = useState(0);

useEffect(() => {
  const timer = setInterval(() => {
    setProgress((prev) => (prev >= 100 ? 0 : prev + 10));
  }, 500);
  return () => clearInterval(timer);
}, []);

<Progress value={progress} />
```

---

## 🎨 스타일 커스터마이징

### 1. Tailwind CSS 클래스 추가
```typescript
<Button className="mt-4 shadow-lg">
  커스텀 스타일 버튼
</Button>
```

### 2. 컴포넌트 코드 직접 수정
예를 들어 Button의 기본 색상을 바꾸려면:

```typescript
// components/ui/button.tsx 파일 열기
const buttonVariants = cva(
  "inline-flex items-center justify-center ...",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700", // 여기 수정!
        // ...
      },
    },
  }
);
```

### 3. globals.css에서 CSS 변수 수정
```css
/* src/styles/globals.css */
@layer base {
  :root {
    --primary: 210 100% 50%;  /* 파란색 */
    --destructive: 0 84% 60%;  /* 빨간색 */
    /* ... */
  }
}
```

---

## 🔗 의존성

### Radix UI
접근성 높은 헤드리스 컴포넌트

```json
"dependencies": {
  "@radix-ui/react-dialog": "^1.1.6",
  "@radix-ui/react-dropdown-menu": "^2.1.6",
  "@radix-ui/react-select": "^2.1.6",
  "@radix-ui/react-slider": "^1.2.3",
  "@radix-ui/react-switch": "^1.1.3",
  "@radix-ui/react-tabs": "^1.1.3",
  "@radix-ui/react-tooltip": "^1.1.8",
  // ... 총 30+ 패키지
}
```

### 유틸리티
```json
"dependencies": {
  "class-variance-authority": "^0.7.1",  // variant 관리
  "clsx": "*",                           // 클래스명 조합
  "tailwind-merge": "*"                  // Tailwind 클래스 병합
}
```

---

## 📚 유틸리티 함수

### cn() - 클래스명 병합
```typescript
// components/ui/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**사용 예시:**
```typescript
<div className={cn(
  "px-4 py-2",
  isActive && "bg-blue-500",
  "hover:bg-blue-600"
)}>
  내용
</div>

// 결과: 
// isActive=true → "px-4 py-2 bg-blue-500 hover:bg-blue-600"
// isActive=false → "px-4 py-2 hover:bg-blue-600"
```

**장점:**
- 조건부 클래스 쉽게 추가
- Tailwind 충돌 자동 해결 (나중 클래스 우선)

---

## 🧪 접근성 (Accessibility)

모든 컴포넌트는 Radix UI 기반으로 WCAG 2.1 표준을 준수합니다.

### 지원 기능
- ✅ 키보드 네비게이션 (Tab, Enter, Esc, 화살표)
- ✅ 스크린 리더 지원 (ARIA 속성)
- ✅ 포커스 관리
- ✅ 적절한 의미론적 HTML

**예시:**
```typescript
// Dialog는 자동으로:
// - Esc 키로 닫기
// - 포커스 트래핑 (Dialog 내에서만 Tab 이동)
// - role="dialog", aria-labelledby, aria-describedby 자동 설정
<Dialog>
  <DialogContent>
    {/* 내용 */}
  </DialogContent>
</Dialog>
```

---

## 🎯 사용 가이드라인

### 1. 일관성 유지
같은 기능은 같은 variant 사용
```typescript
// ✅ 좋음: 삭제 버튼은 항상 destructive
<Button variant="destructive">삭제</Button>

// ❌ 나쁨: 삭제인데 기본 스타일
<Button>삭제</Button>
```

### 2. 적절한 크기 사용
```typescript
// 모바일: small
<Button size="sm">저장</Button>

// 데스크톱: default
<Button>저장</Button>

// 강조: large
<Button size="lg">시작하기</Button>
```

### 3. 접근성 고려
```typescript
// ✅ 좋음: 아이콘 버튼에 라벨 추가
<Button variant="ghost" aria-label="설정">
  <Settings className="h-4 w-4" />
</Button>

// ❌ 나쁨: 아이콘만 있고 라벨 없음
<Button variant="ghost">
  <Settings className="h-4 w-4" />
</Button>
```

---

## 📖 추가 리소스

- [shadcn/ui 공식 문서](https://ui.shadcn.com/)
- [Radix UI 문서](https://www.radix-ui.com/)
- [Tailwind CSS 문서](https://tailwindcss.com/)

---

**UI 컴포넌트 사용 원칙:**
- ✅ 제공된 컴포넌트 최대한 활용
- ✅ 커스터마이징 필요 시 파일 직접 수정
- ✅ 일관된 디자인 시스템 유지
- ✅ 접근성 표준 준수
- ✅ 성능 최적화 (불필요한 리렌더링 방지)








