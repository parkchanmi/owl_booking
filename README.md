# 🚀 Project Name (owl_booking)

> **Ant Design 6**와 **Spring Boot 4**를 결합한 풀스택 웹 애플리케이션입니다.

---

## 🛠 Tech Stack

### **Backend**
![Java](https://img.shields.io/badge/Java-17-007396?style=flat&logo=java&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0.0-6DB33F?style=flat&logo=springboot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring_Security-6.0-6DB33F?style=flat&logo=springsecurity&logoColor=white)

### **Frontend**
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat&logo=react&logoColor=black)
![Ant Design](https://img.shields.io/badge/Ant_Design-6.0.0-0170FE?style=flat&logo=antdesign&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?style=flat&logo=vite&logoColor=white)

---

## ⚙️ 실행 방법 및 포트 정보

### 🟢 **BackEnd (Spring Boot)**
* **실행 방식**: IDE(IntelliJ/Eclipse)에서 `SpringBoot Run` 실행
* **포트**: `http://localhost:8080`
* **핵심 기능**:
    * 세션 기반 사용자 인증
    * **BCrypt**를 활용한 패스워드 암호화 처리
    * RESTful API 제공 (`/api/**`)

### 🔵 **FrontEnd (React + Vite)**
* **실행 방식**: `/front` 경로로 이동 후 아래 명령어 실행
* **포트**: `http://localhost:5173`
  ```bash
  npm install
  npm run build  # 빌드 결과물이 Spring static 폴더로 복사됩니다.
  npm run dev    # 개발 모드 실행

## 🔐 주요 보안 설정 (Security)

프로젝트의 보안 및 인증은 **Spring Security**를 기반으로 설계되었습니다.

| 구분 | 상세 내용 |
| :--- | :--- |
| **인증 방식** | **Session-based Authentication** (JSESSIONID 활용) |
| **비밀번호 암호화** | **BCryptPasswordEncoder**를 사용하여 DB 내 단방향 해시 저장 |
| **권한 관리** | `ROLE_USER`, `ROLE_ADMIN` 등 역할별 URL 접근 제어 |
| **API 보안** | `/api/**` 경로에 대한 인증 필터 적용 |
| **통신 설정** | Vite Proxy 설정을 통한 CORS 이슈 해결 및 API 우회 |

---

## 📂 프로젝트 구조 (Project Structure)

프로젝트는 `backend`와 `front`로 분리되어 관리되며, 각 디렉토리에 독립적인 설정(`.gitignore` 등)이 포함되어 있습니다.

```text
root/
├── backend/                    # Spring Boot 기반 백엔드 프로젝트
│   ├── src/main/java/          # Java 소스 코드
│   │   └── com.owl.booking/    # 서비스 로직 및 설정
│   ├── src/main/resources/
│   │   ├── static/             # Front 빌드 결과물 (Git Ignore 적용)
│   │   └── application.properties
│   └── .gitignore              # Backend 전용 Ignore 설정
├── front/                      # React 기반 프론트엔드 프로젝트 (Vite)
│   ├── src/                    # React 컴포넌트 및 로직
│   ├── public/                 # 정적 리소스
│   ├── vite.config.js          # Proxy 및 Build 경로 설정
│   └── .gitignore              # Frontend 전용 Ignore 설정
└── README.md                   # 프로젝트 메인 가이드

```

## 👤 테스트 계정 (Test Account)

애플리케이션 기능을 즉시 확인하기 위한 기본 계정 정보입니다.

| 구분 | 아이디 (ID) | 비밀번호 (PW) | 권한 (Role) |
| :--- | :--- | :--- | :--- |
| **관리자** | `admin` | `1234` | `ROLE_ADMIN` |
| **사용자** | `user` | `1234` | `ROLE_USER` |

> [!IMPORTANT]
> **보안 안내**
> - 모든 비밀번호는 DB 저장 시 **BCrypt**로 암호화 처리됩니다.
> - 테스트 계정 외에 새로운 계정을 수동으로 DB에 삽입할 경우, 반드시 `passwordEncoder.encode()`를 거친 암호화된 값을 넣어야 로그인이 가능합니다.

