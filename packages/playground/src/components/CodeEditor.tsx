import CodeMirror from "@uiw/react-codemirror";
import { StreamLanguage } from "@codemirror/language";
import { pug } from "@codemirror/legacy-modes/mode/pug";

// pug-frame 은 표준 Pug + 추가 문법이므로, 근사 하이라이팅으로 Pug 레거시 모드를 사용한다.
const pugFrameLanguage = StreamLanguage.define(pug);

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function CodeEditor({ value, onChange }: CodeEditorProps) {
  return (
    <CodeMirror
      value={value}
      height="100%"
      style={{ height: "100%", fontSize: 14 }}
      extensions={[pugFrameLanguage]}
      onChange={onChange}
      basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: true }}
    />
  );
}
