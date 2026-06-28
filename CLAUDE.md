# OWL BOOKING - 프로젝트 구조 가이드

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React, Vite, Ant Design, React Router DOM, Day.js, Axios |
| Backend | Spring Boot, Spring Data JPA, Spring Security |
| DB | MySQL (`booking_database`) |

---

## 폴더 구조

```
owl/
├── frontend/                  # React (Vite)
└── backend/                   # Spring Boot
```

---

## Frontend (`frontend/src/`)

### 라우팅 규칙 (App.jsx)

`page/` 하위의 모든 `.jsx` 파일이 **자동으로 라우트 등록**됩니다.

- 파일 경로 → URL 변환: `page/admin/center/list.jsx` → `/admin/center/list`
- `index.jsx`는 상위 경로로 매핑: `page/admin/index.jsx` → `/admin`

> 단, 같은 폴더 내 페이지 전용 컴포넌트(모달 등)는 라우트로 잡히지 않도록 파일명 규칙을 지켜야 합니다.
> 현재는 `CenterFormModal.jsx`처럼 대문자로 시작하는 컴포넌트는 라우트에 포함되지만 실제 사용 시 문제 없음 (default export가 라우트로 등록될 뿐).

---

### 페이지 구조 (`frontend/src/page/`)

#### 공개 페이지 (인증 불필요)

| 파일 | 라우트 | 설명 |
|------|--------|------|
| `home.jsx` | `/home` | 홈 |
| `login.jsx` | `/login` | 로그인 — typeCode 1 → `/admin`, 그 외 → `/user` |
| `join.jsx` | `/join` | 회원가입 |

#### 관리자 페이지 (`page/admin/`)

| 파일 | 라우트 | 설명 |
|------|--------|------|
| `index.jsx` | `/admin` | 관리자 대시보드 |
| `center/list.jsx` | `/admin/center/list` | 센터 리스트 (DB 연동) |
| `center/CenterFormModal.jsx` | — | 센터 추가/편집 모달 (center 전용 컴포넌트) |
| `class/index.jsx` | `/admin/class` | 수업(Program) 관리 (DB 연동) |
| `booking/wait.jsx` | `/admin/booking/wait` | 대기 예약 관리 설정 |
| `booking/cancel.jsx` | `/admin/booking/cancel` | 예약 취소 가능 시간 설정 |
| `booking/setting.jsx` | `/admin/booking/setting` | 수업 오픈/스케줄 생성 기준 설정 |
| `booking/schedule.jsx` | `/admin/booking/schedule` | 수업 스케줄 관리 (생성/리스트/상세) |

#### 회원 페이지 (`page/user/`)

| 파일 | 라우트 | 설명 |
|------|--------|------|
| `index.jsx` | `/user` | 회원 대시보드 |
| `booking/center.jsx` | `/user/booking/center` | 센터 선택 → 수업 리스트 → 예약 |
| `mypage/history.jsx` | `/user/mypage/history` | 예약/출석/결석 내역 (월별) |
| `mypage/ticket.jsx` | `/user/mypage/ticket` | 이용권 내역 |

---

### 레이아웃 컴포넌트 (`frontend/src/components/`)

공통 레이아웃만 위치. 특정 페이지 전용 컴포넌트는 해당 `page/` 폴더 안에 둡니다.

| 파일 | 설명 |
|------|------|
| `DashboardLayout.jsx` | 관리자용 사이드바 레이아웃 |
| `UserLayout.jsx` | 회원용 사이드바 레이아웃 |

#### DashboardLayout 메뉴 경로 매핑

사이드바 메뉴 항목은 `DashboardLayout.jsx`의 `menuItems` 배열에서 관리합니다.
`path` 값이 있어야 클릭 시 라우팅됩니다.

```
센터 관리  → /admin/center/list
수업 관리  → /admin/class
예약 관리
  대기 예약 관리  → /admin/booking/wait
  예약 취소 관리  → /admin/booking/cancel
  수업 예약 설정  → /admin/booking/setting
  수업 스케줄 관리→ /admin/booking/schedule
```

#### UserLayout 메뉴 경로 매핑

```
예약 관리
  예약할 센터 선택 → /user/booking/center
마이페이지
  예약 내역        → /user/mypage/history
  이용권 내역      → /user/mypage/ticket
```

---

### API 모듈 (`frontend/src/api/`)

| 파일 | 엔드포인트 | 설명 |
|------|-----------|------|
| `centerApi.js` | `/api/centers` | 센터 CRUD |
| `programApi.js` | `/api/admin/programs` | 수업(Program) CRUD |
| `instructorApi.js` | `/api/admin/instructors` | 강사 목록 조회 |

---

## Backend (`backend/src/main/java/com/owl/booking/`)

### 패키지 구조

```
com.owl.booking/
├── admin/
│   ├── controller/   # 관리자 REST 컨트롤러
│   └── service/      # 관리자 비즈니스 로직
├── common/
│   ├── controller/   # 공용 컨트롤러 (회원, 메일, 홈)
│   └── service/
├── config/           # SecurityConfig, WebConfig
├── model/
│   ├── dto/          # 요청/응답 DTO
│   ├── entity/       # JPA 엔티티
│   │   └── type/     # Enum (MemberType, ConfirmMode 등)
│   └── repository/   # JPA Repository
└── utils/
```

### API 엔드포인트 목록

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET/POST/PUT/DELETE | `/api/admin/centers` | 센터 관리 |
| GET/POST/PUT/DELETE | `/api/admin/programs` | 수업 관리 |
| GET/POST/PUT/DELETE | `/api/admin/instructors` | 강사 관리 |
| GET/POST/PUT/DELETE | `/api/admin/memberships` | 이용권 관리 |
| GET/POST/PUT/DELETE | `/api/admin/centermembers` | 센터 회원 관리 |
| GET/POST/DELETE | `/api/realprograms` | 실제 수업 스케줄 |
| POST | `/api/member/login` | 로그인 |
| POST | `/api/member/logout` | 로그아웃 |
| GET | `/api/member/info` | 로그인 회원 정보 |

### 주요 엔티티 관계

```
Center (센터)
├── Program (수업 정의, N)
│   └── RealProgram (실제 수업 인스턴스, N)
│       └── Booking (예약, N)
├── Instructor (강사, N)
├── Membership (이용권, N)
└── CenterMember (센터 회원, N)

Member (회원)
├── MemberMembership (보유 이용권, N)
├── CenterMember (N)
└── HoldHistory (수강 보류, N)
```

### ProgramDto 필드 (수업 등록/수정 시 참고)

```json
{
  "name": "요가 기초반",
  "dayOfWeek": "월",
  "startTime": "09:00",
  "endTime": "10:00",
  "maxCapacity": 15,
  "center": { "id": "센터ID" },
  "instructor": { "id": "강사ID" }
}
```

---

## 컴포넌트 배치 원칙

- `components/` — 여러 페이지에서 공통으로 사용하는 모듈 (레이아웃 등)
- `page/{도메인}/` — 해당 페이지에만 종속된 컴포넌트는 같은 폴더에 위치

## 새 페이지 추가 방법

1. `page/admin/{기능}/index.jsx` 또는 `page/admin/{기능}/{서브}.jsx` 파일 생성
2. `DashboardLayout.jsx`의 `menuItems`에 `{ key, label, path }` 추가
3. API 연동이 필요하면 `api/{엔티티}Api.js` 생성 (페이지별이 아닌 엔티티별로 분리 — 같은 엔티티를 여러 페이지에서 재사용하기 위함)
