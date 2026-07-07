export interface ControlHandlers {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export interface Controls {
  element: HTMLElement;
  destroy(): void;
}

/**
 * 캔버스 위에 겹쳐 표시되는 물리 버튼(줌 인/아웃/리셋).
 * 스타일은 인라인으로 지정해 호스트 페이지 CSS에 의존하지 않는다.
 */
export function createControls(handlers: ControlHandlers): Controls {
  const container = document.createElement("div");
  Object.assign(container.style, {
    position: "absolute",
    right: "8px",
    bottom: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    zIndex: "2",
  } satisfies Partial<CSSStyleDeclaration>);

  const buttons: Array<[label: string, title: string, action: () => void]> = [
    ["+", "줌 인", handlers.onZoomIn],
    ["−", "줌 아웃", handlers.onZoomOut],
    ["⟲", "리셋", handlers.onReset],
  ];

  const cleanups: Array<() => void> = [];

  for (const [label, title, action] of buttons) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.title = title;
    button.setAttribute("aria-label", title);
    Object.assign(button.style, {
      width: "32px",
      height: "32px",
      border: "1px solid #000",
      background: "#fff",
      color: "#000",
      font: "16px/1 sans-serif",
      cursor: "pointer",
      borderRadius: "4px",
    } satisfies Partial<CSSStyleDeclaration>);

    // 버튼 조작이 팬 제스처(pointerdown)로 이어지지 않도록 전파를 막는다.
    const stop = (event: Event) => event.stopPropagation();
    button.addEventListener("pointerdown", stop);
    button.addEventListener("click", action);
    cleanups.push(() => {
      button.removeEventListener("pointerdown", stop);
      button.removeEventListener("click", action);
    });

    container.appendChild(button);
  }

  return {
    element: container,
    destroy() {
      for (const cleanup of cleanups) cleanup();
      container.remove();
    },
  };
}
