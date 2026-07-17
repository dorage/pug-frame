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
// 와이어프레임이므로 색/브랜드 요소 없이 레이아웃과 자리표시자(회색 박스·아웃라인)만 쓴다.
const INSTAGRAM_SAMPLE = `mobile#ig-feed
    header(style='display:flex;align-items:center;justify-content:space-between')
        div(style='font-weight:700') Instagram
        div(style='display:flex;gap:8px')
            div(style='width:22px;height:22px;border:1px solid #999')
            div(style='width:22px;height:22px;border:1px solid #999')
    body(style='padding:0')
        div(style='display:flex;gap:12px;padding:12px;border-bottom:1px solid #ddd')
            div(style='width:52px;height:52px;border-radius:50%;border:1px solid #999')
            div(style='width:52px;height:52px;border-radius:50%;border:1px solid #999')
            div(style='width:52px;height:52px;border-radius:50%;border:1px solid #999')
        div(style='display:flex;align-items:center;gap:8px;padding:8px 12px')
            div(style='width:32px;height:32px;border-radius:50%;border:1px solid #999')
            div rescene
        div(style='height:220px;background:#eee;display:flex;align-items:center;justify-content:center;color:#999') 이미지
        div(style='display:flex;gap:14px;padding:10px 12px')
            div(style='width:22px;height:22px;border:1px solid #999')
            div(style='width:22px;height:22px;border:1px solid #999')
            div(style='width:22px;height:22px;border:1px solid #999')
        div(style='padding:0 12px') 좋아요 1,234
        div(style='padding:4px 12px;color:#555') rescene 캡션 텍스트
        div(p-tooltip='게시물을 열어봅니다' style='padding:8px 12px')
            button(p-focus='ig-post') 게시물 열기
    footer(style='display:flex;justify-content:space-between')
        div(style='width:24px;height:24px;border:1px solid #999')
        div(style='width:24px;height:24px;border:1px solid #999')
        div(style='width:24px;height:24px;border:1px solid #999')
        div(style='width:24px;height:24px;border:1px solid #999')
        div(style='width:24px;height:24px;border:1px solid #999')

mobile#ig-post
    header(style='display:flex;align-items:center;gap:12px')
        div(p-tooltip='피드로 돌아갑니다')
            button(p-focus='ig-feed' style='background:#fff;color:#000;border:1px solid #999;padding:2px 8px;margin:0') 뒤로
        div(style='width:32px;height:32px;border-radius:50%;border:1px solid #999')
        div rescene
    body(style='padding:0')
        div(style='height:320px;background:#eee;display:flex;align-items:center;justify-content:center;color:#999') 이미지
        div(style='display:flex;gap:14px;padding:10px 12px')
            div(style='width:22px;height:22px;border:1px solid #999')
            div(style='width:22px;height:22px;border:1px solid #999')
            div(style='width:22px;height:22px;border:1px solid #999')
        div(style='padding:0 12px') 좋아요 1,234
        div(style='padding:4px 12px;color:#555') rescene 캡션 텍스트
        div(style='padding:4px 12px;color:#999') 댓글 88개 모두 보기
    footer(style='display:flex;justify-content:space-between')
        div(style='width:24px;height:24px;border:1px solid #999')
        div(style='width:24px;height:24px;border:1px solid #999')
        div(style='width:24px;height:24px;border:1px solid #999')
        div(style='width:24px;height:24px;border:1px solid #999')
        div(style='width:24px;height:24px;border:1px solid #999')
`;

// 와츠앱: 채팅 목록 → 대화.
const WHATSAPP_SAMPLE = `mobile#wa-list
    header(style='font-weight:600') WhatsApp
    body(style='padding:0')
        button(p-focus='wa-chat' p-tooltip='대화를 엽니다' style='display:flex;width:100%;align-items:center;gap:12px;padding:12px;background:#fff;color:#000;border:none;border-bottom:1px solid #ddd;text-align:left;margin:0')
            div(style='width:44px;height:44px;border-radius:50%;border:1px solid #999')
            div(style='flex:1')
                div(style='font-weight:600') Alice
                div(style='color:#999') 오늘 회의 몇 시죠?
            div(style='color:#999') 09:24
        button(p-focus='wa-chat' style='display:flex;width:100%;align-items:center;gap:12px;padding:12px;background:#fff;color:#000;border:none;border-bottom:1px solid #ddd;text-align:left;margin:0')
            div(style='width:44px;height:44px;border-radius:50%;border:1px solid #999')
            div(style='flex:1')
                div(style='font-weight:600') Bob
                div(style='color:#999') 자료 공유드려요
            div(style='color:#999') 어제
        button(p-focus='wa-chat' style='display:flex;width:100%;align-items:center;gap:12px;padding:12px;background:#fff;color:#000;border:none;border-bottom:1px solid #ddd;text-align:left;margin:0')
            div(style='width:44px;height:44px;border-radius:50%;border:1px solid #999')
            div(style='flex:1')
                div(style='font-weight:600') Carol
                div(style='color:#999') 좋아요
            div(style='color:#999') 어제
    footer(style='display:flex;justify-content:space-between')
        div 채팅
        div 통화
        div 설정

mobile#wa-chat
    header(style='display:flex;align-items:center;gap:12px')
        div(p-tooltip='채팅 목록으로 돌아갑니다')
            button(p-focus='wa-list' style='background:#fff;color:#000;border:1px solid #999;padding:2px 8px;margin:0') 뒤로
        div(style='width:32px;height:32px;border-radius:50%;border:1px solid #999')
        div Alice
    body(style='display:flex;flex-direction:column;gap:8px')
        div(style='align-self:flex-start;border:1px solid #999;padding:8px 12px;border-radius:8px;max-width:75%') 안녕하세요!
        div(style='align-self:flex-end;background:#eee;padding:8px 12px;border-radius:8px;max-width:75%') 네, 안녕하세요
        div(style='align-self:flex-start;border:1px solid #999;padding:8px 12px;border-radius:8px;max-width:75%') 오늘 회의 몇 시죠?
        div(style='align-self:flex-end;background:#eee;padding:8px 12px;border-radius:8px;max-width:75%') 3시에 봬요
    footer(style='display:flex;gap:8px;align-items:center')
        div(style='flex:1;border:1px solid #999;border-radius:16px;padding:8px 12px;color:#999') 메시지 입력…
        button(style='margin:0') 전송
`;

export const DEMOS: Demo[] = [
  { key: "basic", label: "기본", source: BASIC_SAMPLE },
  { key: "instagram", label: "인스타그램", source: INSTAGRAM_SAMPLE },
  { key: "whatsapp", label: "와츠앱", source: WHATSAPP_SAMPLE },
];

// URL fallback·기존 import 호환을 위해 기본(첫) 데모를 그대로 노출한다.
export const DEFAULT_SAMPLE = DEMOS[0].source;
