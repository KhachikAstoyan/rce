import Editor, { loader } from "@monaco-editor/react";
import { useTheme } from "@/hooks/useTheme";

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

export const CodeEditor: React.FC<React.ComponentProps<typeof Editor>> = (
  props,
) => {
  const { theme } = useTheme();

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
    />
  );
};
