import { PanelGroup, Panel } from "react-resizable-panels";
import { EditorLayout } from "@/layouts/EditorLayout";
import { Problem } from "@/lib/types";
import { OnMount } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { useEffect, useRef, useState } from "react";
import { CodeEditor } from "./CodeEditor";
import { ResizeHandle } from "./ResizeHandle";
import { toast } from "sonner";
import { problemService } from "../../services/problems";
import { useQuery } from "@tanstack/react-query";
import { LoadingOverlay } from "../common/LoadingOverlay";
import { ProblemDescription } from "./ProblemDescription";
import { TestView } from "./TestView";

const INVISIBLE_DIV = document.createElement("div");

import Confetti from "react-confetti-boom";
import { SubmissionStatus } from "./SubmissionStatus";
import { createPortal } from "react-dom";
import { LanguagePicker } from "../common/LanguagePicker/LanguagePicker";
import { Box, Button, Flex, Tabs } from "@radix-ui/themes";

interface Props {
  problem: Problem;
}

export const Editor: React.FC<Props> = ({ problem }) => {
  const [language, setLanguage] = useState<string>(
    problem?.supportedLanguages?.[0] || "",
  );
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
    enabled: !!language,
    queryFn: () => problemService.getTemplate(problem.id, language!),
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
    if (codeEditorRef.current && solutionTemplate) {
      codeEditorRef.current.setValue(solutionTemplate.template);
    }
  }, [solutionTemplate]);

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

  const submitCode = async () => {
    try {
      const code = codeEditorRef.current?.getValue();
      if (!code || !language) {
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
  };

  const runCode = async () => {
    try {
      const code = codeEditorRef.current?.getValue();
      if (!code || !language) {
        return;
      }

      console.log(code);

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
        <>
          <Tabs.Root
            value={leftTab}
            onValueChange={setLeftTab as any}
            defaultValue="description"
          >
            <Tabs.List>
              <Tabs.Trigger value="description">Description</Tabs.Trigger>
              <Tabs.Trigger value="submission">Submission</Tabs.Trigger>
            </Tabs.List>

            <Box className="h-full">
              <Tabs.Content value="description">
                <ProblemDescription problem={problem} />
              </Tabs.Content>

              <Tabs.Content value="submission">
                <SubmissionStatus submission={submission} />
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        </>,
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
              <LanguagePicker
                value={language}
                onChange={setLanguage}
                supportedLanguages={problem.supportedLanguages}
              />
            </div>
            <Flex gap="2">
              <Button onClick={runCode} variant="soft">
                Run
              </Button>
              <Button onClick={submitCode}>Submit</Button>
            </Flex>
          </div>
        </>,
        topRightPanelRef.current!,
      )}

      {createPortal(
        <>
          {testsLoading && <LoadingOverlay />}
          <Tabs.Root
            value={bottomTab}
            onValueChange={setBottomTab as any}
            defaultValue="tests"
          >
            <Tabs.List>
              <Tabs.Trigger value="tests">Tests</Tabs.Trigger>
              <Tabs.Trigger value="results">Results</Tabs.Trigger>
            </Tabs.List>

            <Box className="h-full">
              <Tabs.Content value="tests">
                <TestView tests={tests!} />
              </Tabs.Content>

              <Tabs.Content value="results">
                <TestView tests={tests!} results={runResults?.results} />
              </Tabs.Content>
            </Box>
          </Tabs.Root>
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
