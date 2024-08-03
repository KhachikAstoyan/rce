import { PanelGroup, Panel } from "react-resizable-panels";
import { EditorLayout } from "@/layouts/EditorLayout";
import { Problem } from "@/lib/types";
import Markdown from "react-markdown";
import { ScrollArea } from "@/components/shadcn/scroll-area";
import { OnMount } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { useRef } from "react";
import { CodeEditor } from "./CodeEditor";
import { Prose } from "@/components/common/Prose";
import { ResizeHandle } from "./ResizeHandle";

interface Props {
  problem: Problem;
}

export const Editor: React.FC<Props> = ({ problem }) => {
  const codeEditorRef = useRef<editor.IStandaloneCodeEditor>();
  const handleCodeEditorMount: OnMount = (editor) => {
    codeEditorRef.current = editor;
    editor.focus();
  };

  return (
    <div className="h-screen flex flex-col">
      <EditorLayout>
        <PanelGroup className="max-h-full" direction="horizontal">
          <Panel defaultSize={25}>
            <ScrollArea className="p-4 max-w-full h-full">
              <Prose>
                <h2>{problem.name}</h2>
                <Markdown>{problem.description}</Markdown>
              </Prose>
            </ScrollArea>
          </Panel>
          <ResizeHandle />
          <Panel>
            <PanelGroup direction="vertical">
              <Panel defaultSize={50}>
                <CodeEditor onMount={handleCodeEditorMount} />
              </Panel>
              <ResizeHandle direction="vertical" />
              <Panel defaultSize={50}>Hello</Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </EditorLayout>
    </div>
  );
};
