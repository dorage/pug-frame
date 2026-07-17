// pug-frame 소스를 URL 쿼리(`?c=...`)에 담아 URL만으로 상태를 재현·공유하기 위한 헬퍼.
// 한글 등 비-ASCII를 안전하게 담기 위해 UTF-8 → base64url 로 인코딩한다.
// (URL 길이가 문제되면 후속으로 lz-string 등 압축 도입 여지 있음.)

export const QUERY_KEY = "c";

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function encodeSource(source: string): string {
  return toBase64Url(new TextEncoder().encode(source));
}

export function decodeSource(param: string): string | null {
  try {
    return new TextDecoder().decode(fromBase64Url(param));
  } catch {
    return null;
  }
}

/** 현재 URL의 쿼리에서 소스를 읽는다. 없거나 손상되면 null. */
export function readSourceFromUrl(): string | null {
  const param = new URLSearchParams(window.location.search).get(QUERY_KEY);
  if (param === null) return null;
  return decodeSource(param);
}

/** history를 오염시키지 않도록 replaceState로 쿼리만 갱신한다. */
export function writeSourceToUrl(source: string): void {
  const url = new URL(window.location.href);
  url.searchParams.set(QUERY_KEY, encodeSource(source));
  window.history.replaceState(null, "", url.toString());
}

/** 공유용 절대 URL 문자열을 만든다. */
export function buildShareUrl(source: string): string {
  const url = new URL(window.location.href);
  url.searchParams.set(QUERY_KEY, encodeSource(source));
  return url.toString();
}
