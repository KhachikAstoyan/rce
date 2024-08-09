import { PanelGroup, Panel } from "react-resizable-panels";
import { EditorLayout } from "@/layouts/EditorLayout";
import { Language, Problem } from "@/lib/types";
import Markdown from "react-markdown";
import { ScrollArea } from "@/components/shadcn/scroll-area";
import { OnMount } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { useCallback, useEffect, useRef, useState } from "react";
import { CodeEditor } from "./CodeEditor";
import { Prose } from "@/components/common/Prose";
import { ResizeHandle } from "./ResizeHandle";
import { toast } from "sonner";
import { Button } from "@/components/shadcn/button";
import { problemService } from "../../services/problems";
import { useQuery } from "@tanstack/react-query";

interface Props {
  problem: Problem;
}

export const Editor: React.FC<Props> = ({ problem }) => {
  const codeEditorRef = useRef<editor.IStandaloneCodeEditor>();
  const handleCodeEditorMount: OnMount = (editor) => {
    codeEditorRef.current = editor;
    editor.focus();
  };
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [shouldFetchStatus, setShouldFetchStatus] = useState(false);
  const { data: submissionStatus, isLoading } = useQuery({
    queryKey: ["submission", submissionId],
    queryFn: () => problemService.getSubmissionStatus(submissionId!),
    enabled: shouldFetchStatus,
    refetchInterval: 1000,
  });

  useEffect(() => {
    if (submissionStatus?.status === "completed") {
      setShouldFetchStatus(false);
      toast.success("Code execution completed");
    }
  }, [submissionStatus]);

  const runCode = useCallback(async () => {
    try {
      const code = codeEditorRef.current?.getValue();
      if (!code) {
        return;
      }

      const res = await problemService.createSubmission(
        problem.id,
        Language.JavaScript,
        code,
      );

      setSubmissionId(res.data.id);
      setShouldFetchStatus(true);
      toast.success("Code submission created");
      console.log(res);
    } catch (error) {
      toast.error("Failed to run code");
      console.error(error);
    }
  }, []);

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
              <Panel defaultSize={50} className="relative">
                <CodeEditor onMount={handleCodeEditorMount} />
                <div className="absolute bottom-3 right-3">
                  <Button onClick={runCode}>Run</Button>
                  <Button variant="secondary">Submit</Button>
                </div>
              </Panel>
              <ResizeHandle direction="vertical" />
              <Panel defaultSize={50}>
                {isLoading && <div>Loading...</div>}
                {submissionStatus && (
                  <div>
                    <h2>Submission Status</h2>
                    <pre>{JSON.stringify(submissionStatus, null, 2)}</pre>
                  </div>
                )}
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </EditorLayout>
    </div>
  );
};
