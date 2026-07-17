import { useEffect, useRef } from "react";
import { pugFrameCanvas, type PugFrameCanvas } from "@pug-frame/canvas";

interface CanvasPaneProps {
  /** 이미 디바운스된 pug-frame 소스. */
  source: string;
}

// 명령형 pugFrameCanvas 뷰어를 React 컴포넌트로 감싼다.
// - 마운트 시 한 번만 인스턴스를 만들고, 언마운트 시 destroy 한다.
// - source 가 바뀔 때마다 instance.render(source) 로 다시 그린다.
export function CanvasPane({ source }: CanvasPaneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<PugFrameCanvas | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    const instance = pugFrameCanvas(hostRef.current, { controls: true });
    canvasRef.current = instance;
    return () => {
      instance.destroy();
      canvasRef.current = null;
    };
  }, []);

  useEffect(() => {
    const instance = canvasRef.current;
    if (!instance) return;
    // 편집 도중 문법이 깨져도 앱이 죽지 않도록 방어한다.
    // (canvas 자체도 실패 시 폴백 메시지를 표시한다.)
    void instance.render(source).catch(() => {});
  }, [source]);

  return <div ref={hostRef} className="canvas-host" />;
}
