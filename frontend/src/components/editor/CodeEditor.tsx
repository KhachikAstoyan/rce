import Editor, { loader, OnMount } from "@monaco-editor/react";
import { useTheme } from "@/hooks/useTheme";
import { editor } from "monaco-editor";
import { useRef } from "react";

loader.init().then((monaco) => {
  monaco.editor.defineTheme("myDark", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#1a1a1a",
    },
  });
});

type CodeEditorProps = React.ComponentProps<typeof Editor> & {
  onChange?: (value: string) => void;
};

export const CodeEditor: React.FC<CodeEditorProps> = ({
  onChange,
  onMount: customOnMount,
  ...props
}) => {
  const codeEditorRef = useRef<editor.IStandaloneCodeEditor>();
  const { theme } = useTheme();

  const handleCodeEditorMount: OnMount = (editor) => {
    codeEditorRef.current = editor;
    editor.onDidChangeModelContent(() => {
      onChange && onChange(codeEditorRef?.current?.getValue() ?? "");
    });
  };

  return (
    <Editor
      {...props}
      height="100%"
      defaultLanguage="javascript"
      theme={theme === "light" ? "vs-light" : "myDark"}
      options={{
        fontSize: 16,
        minimap: { enabled: false },
      }}
      onMount={customOnMount || handleCodeEditorMount}
    />
  );
};
