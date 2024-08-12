import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/shadcn/button";
import { AdminLayout } from "./layout/AdminLayout";
import { Input } from "@/components/shadcn/input";
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  ChangeCodeMirrorLanguage,
  CodeToggle,
  ConditionalContents,
  InsertCodeBlock,
  ListsToggle,
  MDXEditor,
  SandpackConfig,
  ShowSandpackInfo,
  UndoRedo,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  sandpackPlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import { loader, OnMount } from "@monaco-editor/react";
import "@mdxeditor/editor/style.css";
import { problemDifficultyOptions } from "@/lib/constants/problems";
import { problemService } from "../services/problems";
import { toast } from "sonner";
import { editor } from "monaco-editor";
import { CodeEditor } from "../components/editor/CodeEditor";
import { JAVASCRIPT_SKELETON_TEMPLATE } from "./constants";
import { ITestSuite, Language } from "../lib/types";
import { TestCase } from "./components/TestCase";

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

const simpleSandpackConfig: SandpackConfig = {
  defaultPreset: "react",
  presets: [
    {
      label: "React",
      name: "react",
      meta: "live react",
      sandpackTemplate: "react",
      sandpackTheme: "light",
      snippetFileName: "/App.js",
      snippetLanguage: "jsx",
      initialSnippetContent: "",
    },
  ],
};

export const Dashboard = () => {
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [name, setName] = useState("");
  const codeEditorRef = useRef<editor.IStandaloneCodeEditor>();
  const [testSuite, setTestSuite] = useState<ITestSuite>({
    problemId: "",
    tests: [],
  });
  const [problemId, setProblemId] = useState("");

  const handleCodeEditorMount: OnMount = (editor) => {
    codeEditorRef.current = editor;
    editor.focus();
  };

  const addTestCase = () => {
    setTestSuite({
      ...testSuite,
      tests: [
        ...testSuite.tests,
        {
          inputs: {},
          isPublic: true,
          expected: { type: "string", value: "" },
        },
      ],
    });
  };

  const handleSubmit = async () => {
    try {
      const problem = await problemService.createProblem({
        description,
        difficulty,
        name,
      });

      toast.success(`Problem "${problem.name}" created successfully`);
      setProblemId(problem.id);
    } catch (error) {
      toast.error("Failed to create problem");
    }
  };

  const handleCreateTestSuite = async () => {
    try {
      await problemService.createTestSuite(
        problemId,
        codeEditorRef.current?.getValue() || "",
        Language.JavaScript,
        testSuite,
      );

      toast.success("Test suite created successfully");
    } catch (error) {
      toast.error("Failed to create test suite");
    }
  };

  useEffect(() => {
    if (problemId) {
      handleCreateTestSuite();
    }
  }, [problemId]);

  return (
    <AdminLayout>
      <div className="container flex flex-col gap-3">
        <h2 className="text-3xl">Create Problem</h2>

        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Problem name"
        />
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            {problemDifficultyOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="prose prose-neutral max-w-full">
          <MDXEditor
            className="w-full border"
            markdown={description}
            onChange={setDescription}
            placeholder="Problem description"
            plugins={[
              headingsPlugin(),
              quotePlugin(),
              listsPlugin(),
              codeBlockPlugin({ defaultCodeBlockLanguage: "js" }),
              sandpackPlugin({ sandpackConfig: simpleSandpackConfig }),
              codeMirrorPlugin({
                codeBlockLanguages: {
                  json: "JSON",
                  js: "JavaScript",
                  css: "CSS",
                },
              }),
              diffSourcePlugin(),
              thematicBreakPlugin(),
              toolbarPlugin({
                toolbarContents: () => (
                  <>
                    <ConditionalContents
                      options={[
                        {
                          when: (editor) => editor?.editorType === "codeblock",
                          contents: () => <ChangeCodeMirrorLanguage />,
                        },
                        {
                          when: (editor) => editor?.editorType === "sandpack",
                          contents: () => <ShowSandpackInfo />,
                        },
                      ]}
                    />
                    <UndoRedo />
                    <BoldItalicUnderlineToggles />
                    <BlockTypeSelect />
                    <ListsToggle />
                    <CodeToggle />
                    <InsertCodeBlock />
                  </>
                ),
              }),
            ]}
          />
        </div>

        <h2 className="text-3xl ">Skeleton code</h2>
        <div className="h-64 border">
          <CodeEditor
            defaultValue={JAVASCRIPT_SKELETON_TEMPLATE}
            onMount={handleCodeEditorMount}
          />
        </div>

        <h2 className="text-3xl my-3">Tests</h2>
        {!testSuite.tests.length && <p>No tests</p>}
        {testSuite.tests.map((test, index) => (
          <TestCase
            testCase={test}
            onChange={(newTest) => {
              const newTests = [...testSuite.tests];
              newTests[index] = newTest;
              setTestSuite({ ...testSuite, tests: newTests });
            }}
            onDelete={() => {
              const newTests = testSuite.tests.filter((_, i) => i !== index);
              setTestSuite({ ...testSuite, tests: newTests });
            }}
          />
        ))}
        <Button className="w-min" onClick={addTestCase}>
          Add test case
        </Button>

        <Button onClick={handleSubmit} className="w-min">
          Create
        </Button>
      </div>
    </AdminLayout>
  );
};
