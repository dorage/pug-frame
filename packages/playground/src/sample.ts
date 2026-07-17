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
// pug-frame 은 클래스용 CSS 가 없으므로 각 요소에 인라인 style 속성으로 꾸민다.
const INSTAGRAM_SAMPLE = `mobile#ig-feed
    header(style='border:none;border-bottom:1px solid #dbdbdb;padding:12px 14px;display:flex;align-items:center;justify-content:space-between')
        div(style='font-family:cursive;font-size:22px;font-weight:700') Instagram
        div(style='font-size:18px') ♡ ✈
    body(style='border:none;padding:0')
        div(style='display:flex;gap:14px;padding:12px 14px;border-bottom:1px solid #efefef')
            div(style='width:56px;height:56px;border-radius:50%;background:linear-gradient(45deg,#f09433,#dc2743,#bc1888)')
            div(style='width:56px;height:56px;border-radius:50%;background:#ddd')
            div(style='width:56px;height:56px;border-radius:50%;background:#ddd')
        div(style='display:flex;align-items:center;gap:10px;padding:10px 14px')
            div(style='width:32px;height:32px;border-radius:50%;background:#ddd')
            div(style='font-weight:600') rescene
        div(style='width:100%;height:260px;background:#e9e9e9;display:flex;align-items:center;justify-content:center;color:#aaa') 사진
        div(style='padding:8px 14px;font-size:20px') ♥ 💬 ✈
        div(style='padding:0 14px;font-weight:600') 좋아요 1,234개
        div(style='padding:4px 14px 12px') rescene 오늘도 좋은 하루 ✨
        div(p-tooltip='게시물을 열어봅니다' style='padding:0 14px 14px')
            button(p-focus='ig-post' style='background:#0095f6;border-radius:8px;padding:8px 16px;margin:0') 게시물 열기
    footer(style='border:none;border-top:1px solid #dbdbdb;padding:12px 22px;display:flex;justify-content:space-between;font-size:20px')
        div ⌂
        div ○
        div ⊕
        div ▷
        div ◉

mobile#ig-post
    header(style='border:none;border-bottom:1px solid #dbdbdb;padding:10px 14px;display:flex;align-items:center;gap:12px')
        div(p-tooltip='피드로 돌아갑니다')
            button(p-focus='ig-feed' style='background:transparent;color:#000;font-size:18px;padding:0;margin:0') ←
        div(style='width:32px;height:32px;border-radius:50%;background:#ddd')
        div(style='font-weight:600') rescene
    body(style='border:none;padding:0')
        div(style='width:100%;height:340px;background:#e9e9e9;display:flex;align-items:center;justify-content:center;color:#aaa') 사진
        div(style='padding:8px 14px;font-size:20px') ♥ 💬 ✈
        div(style='padding:0 14px;font-weight:600') 좋아요 1,234개
        div(style='padding:4px 14px') rescene 오늘도 좋은 하루 ✨
        div(style='padding:4px 14px;color:#888') 댓글 88개 모두 보기
    footer(style='border:none;border-top:1px solid #dbdbdb;padding:12px 22px;display:flex;justify-content:space-between;font-size:20px')
        div ⌂
        div ○
        div ⊕
        div ▷
        div ◉
`;

// 와츠앱: 채팅 목록 → 대화.
const WHATSAPP_SAMPLE = `mobile#wa-list
    header(style='border:none;background:#075e54;color:#fff;padding:16px 14px;font-size:18px;font-weight:600') WhatsApp
    body(style='border:none;padding:0')
        button(p-focus='wa-chat' p-tooltip='대화를 엽니다' style='display:flex;width:100%;align-items:center;gap:12px;padding:12px 14px;background:#fff;color:#000;border-bottom:1px solid #eee;text-align:left;margin:0')
            div(style='width:48px;height:48px;border-radius:50%;background:#25d366;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600') A
            div(style='flex:1')
                div(style='font-weight:600') Alice
                div(style='color:#777;font-size:13px') 오늘 회의 몇 시죠?
            div(style='color:#999;font-size:12px') 09:24
        button(p-focus='wa-chat' style='display:flex;width:100%;align-items:center;gap:12px;padding:12px 14px;background:#fff;color:#000;border-bottom:1px solid #eee;text-align:left;margin:0')
            div(style='width:48px;height:48px;border-radius:50%;background:#34b7f1;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600') B
            div(style='flex:1')
                div(style='font-weight:600') Bob
                div(style='color:#777;font-size:13px') 자료 공유드려요
            div(style='color:#999;font-size:12px') 어제
        button(p-focus='wa-chat' style='display:flex;width:100%;align-items:center;gap:12px;padding:12px 14px;background:#fff;color:#000;border-bottom:1px solid #eee;text-align:left;margin:0')
            div(style='width:48px;height:48px;border-radius:50%;background:#8e44ad;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600') C
            div(style='flex:1')
                div(style='font-weight:600') Carol
                div(style='color:#777;font-size:13px') 좋아요 👍
            div(style='color:#999;font-size:12px') 어제
    footer(style='border:none;border-top:1px solid #eee;padding:12px 22px;display:flex;justify-content:space-between;color:#075e54;font-weight:600')
        div 채팅
        div 통화
        div 설정

mobile#wa-chat
    header(style='border:none;background:#075e54;color:#fff;padding:12px 14px;display:flex;align-items:center;gap:12px')
        div(p-tooltip='채팅 목록으로 돌아갑니다')
            button(p-focus='wa-list' style='background:transparent;color:#fff;font-size:18px;padding:0;margin:0') ←
        div(style='width:36px;height:36px;border-radius:50%;background:#25d366')
        div(style='font-weight:600') Alice
    body(style='border:none;background:#e5ddd5;padding:12px;display:flex;flex-direction:column;gap:8px')
        div(style='align-self:flex-start;background:#fff;padding:8px 12px;border-radius:10px;max-width:75%') 안녕하세요!
        div(style='align-self:flex-end;background:#dcf8c6;padding:8px 12px;border-radius:10px;max-width:75%') 네, 안녕하세요
        div(style='align-self:flex-start;background:#fff;padding:8px 12px;border-radius:10px;max-width:75%') 오늘 회의 몇 시죠?
        div(style='align-self:flex-end;background:#dcf8c6;padding:8px 12px;border-radius:10px;max-width:75%') 3시에 봬요
    footer(style='border:none;padding:8px;display:flex;gap:8px;align-items:center')
        div(style='flex:1;background:#fff;border-radius:20px;padding:10px 14px;color:#999') 메시지 입력…
        div(style='width:40px;height:40px;border-radius:50%;background:#075e54;color:#fff;display:flex;align-items:center;justify-content:center') ➤
`;

export const DEMOS: Demo[] = [
  { key: "basic", label: "기본", source: BASIC_SAMPLE },
  { key: "instagram", label: "인스타그램", source: INSTAGRAM_SAMPLE },
  { key: "whatsapp", label: "와츠앱", source: WHATSAPP_SAMPLE },
];

// URL fallback·기존 import 호환을 위해 기본(첫) 데모를 그대로 노출한다.
export const DEFAULT_SAMPLE = DEMOS[0].source;
