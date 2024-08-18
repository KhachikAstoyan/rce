import { useEffect, useState } from "react";
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
import "@mdxeditor/editor/style.css";
import { problemDifficultyOptions } from "@/lib/constants/problems";
import { problemService } from "../services/problems";
import { toast } from "sonner";
import { CodeEditor } from "../components/editor/CodeEditor";
import { ITestSuite, Language } from "../lib/types";
import { TestCase } from "./components/TestCase";
import { SUPPORTED_LANGUAGES } from "../lib/constants/languages";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/shadcn/accordion";

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

  const [testSuite, setTestSuite] = useState<ITestSuite>({
    problemId: "",
    tests: [],
  });
  const [problemId, setProblemId] = useState("");
  const [skeletons, setSkeletons] = useState<Record<Language, string>>({
    javascript: "",
  });

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
      const test = await problemService.createTestSuite(problemId, testSuite);

      await handleCreateSkeletons(test.id);
      toast.success("Test suite created successfully");
    } catch (error) {
      toast.error("Failed to create test suite");
    }
  };

  const handleCreateSkeletons = async (testId: string) => {
    try {
      Object.entries(skeletons).forEach(async ([language, skeleton]) => {
        await problemService.createSkeleton(
          testId,
          language as Language,
          skeleton,
        );
      });

      toast.success("Skeletons created successfully");
    } catch (error) {
      toast.error("Failed to create skeletons");
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

        <Accordion type="single" className="w-full" collapsible>
          {SUPPORTED_LANGUAGES.map((language) => (
            <AccordionItem
              value={language.name}
              key={language.name}
              // className="border p-2"
            >
              <AccordionTrigger>{language.name}</AccordionTrigger>
              <AccordionContent>
                <div className="h-64">
                  <CodeEditor
                    defaultValue={language.skeletonTemplate}
                    onChange={(value) => {
                      setSkeletons({ ...skeletons, [language.name]: value });
                    }}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

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
