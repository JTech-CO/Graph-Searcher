# Graph Searcher

> **Gemini 2.5 AI와 Google Search를 활용한 데이터 검색 및 분석 도구**

## 1. 소개 (Introduction)

이 프로젝트는 Google의 Gemini 2.5 AI 모델과 Google Search를 통합하여 수치 데이터, 통계, 그래프 정보를 효율적으로 검색하고 분석하기 위해 개발된 웹 애플리케이션입니다. 
**Summary 모드**와 **Deep Scan 모드**를 통해 사용자의 요구에 맞는 수준의 분석 결과를 제공하며, 실시간 스트리밍과 소스 필터링 기능을 통해 최적의 사용자 경험을 제공합니다.

**주요 기능**
- **AI 기반 데이터 검색**: Gemini 2.5 Flash/Pro 모델을 활용한 지능형 데이터 검색
- **이중 분석 모드**: 빠른 요약(Summary)과 심층 분석(Deep Scan) 모드 지원
- **실시간 스트리밍**: 검색 결과를 실시간으로 스트리밍하여 즉각적인 피드백 제공
- **소스 필터링**: 한국/국제 소스, 그래프/표/뉴스 타입별 필터링 기능
- **다크 테마 UI**: 사이버펑크 스타일의 모던한 다크 테마 인터페이스
- **로컬 저장**: API 키를 로컬 스토리지에 안전하게 저장

## 2. 기술 스택 (Tech Stack)

- **Frontend**: React 18, JSX (Babel Standalone)
- **AI/ML**: Google Gemini 2.5 (Flash & Pro)
- **Search**: Google Search API (via Gemini)
- **Styling**: Tailwind CSS, Custom CSS
- **Icons**: Font Awesome 6.0
- **Fonts**: JetBrains Mono
- **State Management**: React Hooks (useState, useEffect)
- **Storage**: LocalStorage

## 3. 설치 및 실행 (Quick Start)

**요구 사항**: 최신 웹 브라우저 (Chrome, Firefox, Edge, Safari)

0. **[바로 실행하기](<https://jtech-co.github.io/Graph-Searcher/index.html>)**

1. **다운로드 (Download)**
   ```bash
   git clone [레포지토리 URL]
   cd GRAPH-SEARCHER
   ```

2. **API 키 설정 (API Key Setup)**
   - [Google AI Studio](https://makersuite.google.com/app/apikey)에서 Gemini API 키를 발급받습니다.
   - 애플리케이션을 실행하면 초기 설정 모달이 표시됩니다.
   - API 키를 입력하고 "Initialize System" 버튼을 클릭합니다.
   - API 키는 브라우저의 LocalStorage에 저장됩니다.

3. **실행 (Run)**
   - `index.html` 파일을 웹 브라우저에서 직접 열거나
   - 로컬 웹 서버를 사용하여 실행합니다:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (http-server)
   npx http-server
   ```
   - 브라우저에서 `http://localhost:8000` 접속

## 4. 폴더 구조 (Structure)

```text
GRAPH SEARCHER/
├── css/
│   └── main.css          # 커스텀 스타일시트
├── js/
│   └── main.js           # React 컴포넌트 및 로직
├── index.html            # 메인 HTML (분리된 버전)
├── Graph Searcher.html   # 원본 HTML (인라인 버전)
├── README.md             # 프로젝트 문서
└── Simplified README 템플릿.md  # README 템플릿
```

## 5. 사용 방법 (Usage)

1. **검색 시작**
   - 검색창에 수치 데이터, 통계, 그래프 관련 질문을 입력합니다.
   - Enter 키를 누르거나 "EXECUTE" 버튼을 클릭합니다.

2. **분석 모드 선택**
   - **SUMMARY**: 빠른 요약 (Gemini 2.5 Flash 사용)
     - 핵심 숫자와 주요 트렌드만 간결하게 제공
   - **DEEP SCAN**: 심층 분석 (Gemini 2.5 Pro 사용)
     - 상세한 데이터 포인트와 종합적인 분석 리포트 제공

3. **결과 확인**
   - 왼쪽 패널에서 실시간으로 스트리밍되는 분석 결과를 확인합니다.
   - 오른쪽 사이드바에서 참조된 소스들을 확인하고 필터링할 수 있습니다.

4. **소스 필터링**
   - **지역 필터**: ALL / KOREA / GLOBAL

   - **타입 필터**: 그래프, 표, 뉴스 등 (추가 예정)


## 6. 이미지 (Image)

<img width="2560" height="4712" alt="image" src="https://i.imgur.com/Fu3MFez.png" /> 
