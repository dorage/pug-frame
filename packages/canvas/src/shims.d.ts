// Vite 가상 모듈: Tailwind 기본 테마 CSS 문자열(vite.config의 tailwindThemePlugin).
declare module "virtual:tailwind-theme" {
  const content: string;
  export default content;
}
