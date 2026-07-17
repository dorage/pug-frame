// playground 헤더의 데모 드롭다운에서 고를 수 있는 pug-frame 소스 모음.
// 각 데모는 다화면 + p-focus 네비게이션 와이어프레임이며, 표준 Pug 텍스트 표기를 쓴다.

export interface Demo {
  /** 안정적인 식별자(내부용). */
  key: string;
  /** 드롭다운에 표시할 이름. */
  label: string;
  /** pug-frame 소스. */
  source: string;
}

// README / canvas 데모의 2-화면 예시(p-focus, p-tooltip 포함).
const BASIC_SAMPLE = `mobile#main-1
    header
        div Rescene
    body
        div Ilsan!
        div(p-tooltip='다음 화면으로 이동합니다')
            button(p-focus='main-2') Next
    footer
        div 2026.07.07

mobile#main-2
    header
        div Rescene
    body
        div Yaho!
        div(p-tooltip='이전 화면으로 돌아갑니다')
            button(p-focus='main-1') Prev
    footer
        div 2026.07.07
`;

// 인스타그램: 피드 → 게시물 상세.
const INSTAGRAM_SAMPLE = `mobile#ig-feed
    header
        div Instagram
    body
        div Stories
        div @rescene
        div [ 사진 ]
        div ♥ 1,234
        div(p-tooltip='게시물을 열어봅니다')
            button(p-focus='ig-post') 게시물 열기
    footer
        div 홈 · 검색 · 릴스 · 프로필

mobile#ig-post
    header
        div(p-tooltip='피드로 돌아갑니다')
            button(p-focus='ig-feed') ← 뒤로
    body
        div @rescene
        div [ 사진 ]
        div ♥ 1,234
        div 좋아요 1,234개
        div 댓글 88개 모두 보기
    footer
        div 홈 · 검색 · 릴스 · 프로필
`;

// 와츠앱: 채팅 목록 → 대화.
const WHATSAPP_SAMPLE = `mobile#wa-list
    header
        div WhatsApp
    body
        div 채팅
        div(p-tooltip='대화를 엽니다')
            button(p-focus='wa-chat') Alice
        div
            button(p-focus='wa-chat') Bob
        div
            button(p-focus='wa-chat') Carol
    footer
        div 채팅 · 통화 · 설정

mobile#wa-chat
    header
        div(p-tooltip='채팅 목록으로 돌아갑니다')
            button(p-focus='wa-list') ← 채팅 목록
        div Alice
    body
        div 안녕하세요!
        div 네, 안녕하세요
        div 오늘 회의 몇 시죠?
        div 3시에 봬요
    footer
        div 메시지 입력…
`;

export const DEMOS: Demo[] = [
  { key: "basic", label: "기본", source: BASIC_SAMPLE },
  { key: "instagram", label: "인스타그램", source: INSTAGRAM_SAMPLE },
  { key: "whatsapp", label: "와츠앱", source: WHATSAPP_SAMPLE },
];

// URL fallback·기존 import 호환을 위해 기본(첫) 데모를 그대로 노출한다.
export const DEFAULT_SAMPLE = DEMOS[0].source;
