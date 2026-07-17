import CodeMirror from "@uiw/react-codemirror";
import { StreamLanguage, indentUnit } from "@codemirror/language";
import { pug } from "@codemirror/legacy-modes/mode/pug";

// pug-frame 은 표준 Pug + 추가 문법이므로, 근사 하이라이팅으로 Pug 레거시 모드를 사용한다.
const pugFrameLanguage = StreamLanguage.define(pug);

// Tab 한 번에 한 뎁스(4칸) 들여쓰기. 기본 indentUnit(2칸)은 뎁스마다 여러 번 눌러야 한다.
const INDENT = indentUnit.of("    ");

// extensions / basicSetup 은 매 렌더마다 새 참조가 되면 CodeMirror 가 통째로
// reconfigure 되면서 undo 히스토리가 초기화된다. 모듈 상수로 참조를 고정한다.
const EXTENSIONS = [pugFrameLanguage, INDENT];
const BASIC_SETUP = {
  lineNumbers: true,
  foldGutter: false,
  highlightActiveLine: true,
} as const;
const EDITOR_STYLE = { height: "100%", fontSize: 14 } as const;

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function CodeEditor({ value, onChange }: CodeEditorProps) {
  return (
    <CodeMirror
      value={value}
      height="100%"
      style={EDITOR_STYLE}
      extensions={EXTENSIONS}
      onChange={onChange}
      basicSetup={BASIC_SETUP}
    />
  );
}
