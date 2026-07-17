import { useEffect, useRef, useState } from "react";
import { CodeEditor } from "./components/CodeEditor";
import { CanvasPane } from "./components/CanvasPane";
import { DEFAULT_SAMPLE } from "./sample";
import { buildShareUrl, readSourceFromUrl, writeSourceToUrl } from "./lib/urlState";

const DEBOUNCE_MS = 300;

export function App() {
  // 최초 마운트 시 URL 쿼리에서 소스를 복원하고, 없으면 기본 샘플을 쓴다.
  const [source, setSource] = useState<string>(() => readSourceFromUrl() ?? DEFAULT_SAMPLE);
  // 오른쪽 canvas / URL 갱신에 쓰는 디바운스된 소스.
  const [debounced, setDebounced] = useState<string>(source);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | null>(null);

  // 입력을 디바운스해 canvas render 와 URL 갱신 부하를 줄인다.
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(source), DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [source]);

  // 디바운스된 소스를 URL 쿼리에 반영한다(replaceState).
  useEffect(() => {
    writeSourceToUrl(debounced);
  }, [debounced]);

  const handleShare = async () => {
    const url = buildShareUrl(debounced);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("아래 URL을 복사하세요", url);
      return;
    }
    setCopied(true);
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 1500);
  };

  const handleReset = () => setSource(DEFAULT_SAMPLE);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">
          pug-frame <span className="app-title-accent">playground</span>
        </h1>
        <div className="app-actions">
          <button type="button" onClick={handleReset}>
            리셋
          </button>
          <button type="button" onClick={handleShare}>
            {copied ? "복사됨!" : "URL 복사"}
          </button>
        </div>
      </header>

      <main className="app-body">
        <section className="pane pane-editor" aria-label="pug-frame 코드">
          <CodeEditor value={source} onChange={setSource} />
        </section>
        <section className="pane pane-preview" aria-label="canvas 미리보기">
          <CanvasPane source={debounced} />
        </section>
      </main>
    </div>
  );
}
