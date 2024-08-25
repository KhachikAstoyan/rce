import { PanelGroup, Panel } from "react-resizable-panels";
import { EditorLayout } from "@/layouts/EditorLayout";
import { Problem } from "@/lib/types";
import { OnMount } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { useCallback, useEffect, useRef, useState } from "react";
import { CodeEditor } from "./CodeEditor";
import { ResizeHandle } from "./ResizeHandle";
import { toast } from "sonner";
import { Button } from "@/components/shadcn/button";
import { problemService } from "../../services/problems";
import { useQuery } from "@tanstack/react-query";
import { LoadingOverlay } from "../common/LoadingOverlay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../shadcn/tabs";
import { ProblemDescription } from "./ProblemDescription";
import { TestView } from "./TestView";

const INVISIBLE_DIV = document.createElement("div");

import Confetti from "react-confetti-boom";
import { SubmissionStatus } from "./SubmissionStatus";
import { createPortal } from "react-dom";
import { Language, SUPPORTED_LANGUAGES } from "../../lib/constants/languages";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";

interface Props {
  problem: Problem;
}

export const Editor: React.FC<Props> = ({ problem }) => {
  const [language, setLanguage] = useState<Language>(Language.Java);
  const codeEditorRef = useRef<editor.IStandaloneCodeEditor>();
  const handleCodeEditorMount: OnMount = (editor) => {
    codeEditorRef.current = editor;
    editor.focus();
  };
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);

  const [shouldFetchRunResults, setShouldFetchRunResults] = useState(false);
  const [shouldFetchSubmission, setShouldFetchSubmission] = useState(false);

  // panel references
  const leftPanelRef = useRef<HTMLDivElement>(INVISIBLE_DIV);
  const topRightPanelRef = useRef<HTMLDivElement>(INVISIBLE_DIV);
  const bottomRightPanelRef = useRef<HTMLDivElement>(INVISIBLE_DIV);

  const { data: tests, isLoading: testsLoading } = useQuery({
    queryKey: ["tests", problem.id],
    queryFn: () => problemService.getPublicTests(problem.id),
  });
  const { data: solutionTemplate, isLoading: isTemplateLoading } = useQuery({
    queryKey: ["template", problem.id, language],
    queryFn: () => problemService.getTemplate(problem.id, language),
  });

  const [leftTab, setLeftTab] = useState<"description" | "submission">(
    "description",
  );
  const [bottomTab, setBottomTab] = useState<"tests" | "results">("tests");

  // TODO: refactor this into a custom hook to cleanup everything a little
  const { data: submission } = useQuery({
    queryKey: ["submission", submissionId],
    queryFn: () => problemService.getSubmissionStatus(submissionId!),
    enabled: shouldFetchSubmission,
    refetchInterval: 500,
  });

  const { data: runResults } = useQuery({
    queryKey: ["run", runId],
    queryFn: () => problemService.getRunStatus(runId!),
    enabled: shouldFetchRunResults,
    refetchInterval: 500,
  });

  useEffect(() => {
    if (submission) {
      setShouldFetchSubmission(false);
      setLeftTab("submission");
      toast.success("Testing completed");
    }
  }, [submission]);

  // refactor this to not use useEffect
  useEffect(() => {
    if (runResults) {
      setShouldFetchRunResults(false);
      setBottomTab("results");
      toast.success("Code ran successfully");
    }
  }, [runResults]);

  const submitCode = useCallback(async () => {
    try {
      const code = codeEditorRef.current?.getValue();
      if (!code) {
        return;
      }

      const res = await problemService.createSubmission(
        problem.id,
        language,
        code,
      );

      setSubmissionId(res.data.id);
      setShouldFetchSubmission(true);
      toast.success("Code submission created");
      console.log(res);
    } catch (error) {
      toast.error("Failed to run code");
      console.error(error);
    }
  }, []);

  const runCode = async () => {
    try {
      const code = codeEditorRef.current?.getValue();
      if (!code) {
        return;
      }

      const res = await problemService.createSubmission(
        problem.id,
        language,
        code,
        true, // only public tests
      );

      setRunId(res.data.id);
      setShouldFetchRunResults(true);
      toast.info("Running code...");
    } catch (error) {
      toast.error("Failed to run code");
      console.error(error);
    }
  };

  return (
    <>
      {/* 
        These portal will allow to rearrange the views however the 
        user wants. Right now it's just a no-op, but I'll implement
        drag and drop once other core features are done. TODO:
      */}
      {createPortal(
        <Tabs
          value={leftTab}
          onValueChange={(v) => setLeftTab(v as any)}
          className="w-full h-full"
        >
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="submission">Submission</TabsTrigger>
          </TabsList>
          <TabsContent className="h-full" value="description">
            <ProblemDescription problem={problem} />
          </TabsContent>
          <TabsContent className="h-full" value="submission">
            <SubmissionStatus submission={submission} />
          </TabsContent>
        </Tabs>,
        leftPanelRef.current!,
      )}

      {createPortal(
        <>
          {isTemplateLoading && <LoadingOverlay />}
          {solutionTemplate && (
            <CodeEditor
              defaultValue={solutionTemplate?.template ?? ""}
              language={language}
              onMount={handleCodeEditorMount}
            />
          )}
          <div className="absolute bottom-3 px-3 w-full flex  justify-between">
            <div>
              <Select
                value={language}
                onValueChange={(v) => setLanguage(v as Language)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(SUPPORTED_LANGUAGES).map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button onClick={runCode}>Run</Button>
              <Button onClick={submitCode} variant="secondary">
                Submit
              </Button>
            </div>
          </div>
        </>,
        topRightPanelRef.current!,
      )}

      {createPortal(
        <>
          {testsLoading && <LoadingOverlay />}
          <Tabs value={bottomTab} onValueChange={(v) => setBottomTab(v as any)}>
            <TabsList>
              <TabsTrigger value="tests">Tests</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>
            <TabsContent value="tests" className="h-full">
              <TestView tests={tests!} />
            </TabsContent>
            <TabsContent value="results" className="h-full">
              <TestView tests={tests!} results={runResults?.results} />
            </TabsContent>
          </Tabs>
        </>,
        bottomRightPanelRef.current,
      )}

      <div className="relative h-screen max-h-screen flex flex-col">
        {submission?.results?.success && (
          <div className="z-50">
            <Confetti
              mode="boom"
              particleCount={150}
              effectCount={1}
              effectInterval={3000}
            />
          </div>
        )}
        {shouldFetchSubmission && <LoadingOverlay />}
        <EditorLayout>
          <PanelGroup
            autoSaveId="editorLayout"
            className="max-h-full"
            direction="horizontal"
          >
            <Panel defaultSize={25}>
              <div className="h-full" ref={leftPanelRef}></div>
            </Panel>
            <ResizeHandle />
            <Panel>
              <PanelGroup direction="vertical">
                <Panel defaultSize={50} className="relative">
                  <div className="h-full" ref={topRightPanelRef}></div>
                </Panel>
                <ResizeHandle direction="vertical" />
                <Panel
                  className="h-full max-h-full overflow-y-scroll"
                  defaultSize={50}
                  style={{ overflowY: "scroll" }}
                >
                  <div className="h-full" ref={bottomRightPanelRef}></div>
                </Panel>
              </PanelGroup>
            </Panel>
          </PanelGroup>
        </EditorLayout>
      </div>
    </>
  );
};
