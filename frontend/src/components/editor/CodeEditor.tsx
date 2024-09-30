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
      "editor.background": "#111113",
    },
  });
});

type CodeEditorProps = React.ComponentProps<typeof Editor> & {
  onChange?: (value: string) => void;
};

export const CodeEditor: React.FC<CodeEditorProps> = ({
  onChange,
  onMount: customOnMount,
  options,
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
      theme={theme === "light" ? "vs-light" : "myDark"}
      options={{
        suggest: {
          showFields: false,
          showFunctions: false,
        },
        fontSize: 16,
        quickSuggestions: false,
        minimap: { enabled: false },
        ...options,
      }}
      onMount={customOnMount || handleCodeEditorMount}
    />
  );
};
