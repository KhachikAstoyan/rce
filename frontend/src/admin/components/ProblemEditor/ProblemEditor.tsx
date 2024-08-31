import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/shadcn/button";
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
import { problemService } from "@/services/problems";
import { toast } from "sonner";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { ITestSuite, IValue } from "@/lib/types";
import { TestCase } from "@/admin/components/ProblemEditor/TestCase";
import { type Language, SUPPORTED_LANGUAGES } from "@/lib/constants/languages";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shadcn/accordion";
import { TypeSelector } from "@/admin/components/TypeSelector/TypeSelector";
import { InputBuilder } from "@/admin/components/ProblemEditor/InputBuilder";
import { type IInput } from "./types";
import { convertInputsToTestInput } from "./helpers";

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

type LanguageToStringMap = Record<string, string | undefined>;

export const PropblemEditor = () => {
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [name, setName] = useState("");
  const [inputs, setInputs] = useState<IInput[]>([]);
  const [expectedType, setExpectedType] = useState<string>("");
  const [testSuite, setTestSuite] = useState<ITestSuite>({
    problemId: "",
    tests: [],
  });
  const [problemId, setProblemId] = useState("");
  const [skeletons, setSkeletons] = useState<LanguageToStringMap>({});
  const [templates, setTemplates] = useState<LanguageToStringMap>({});
  const convertedInputs: Record<string, IValue> = useMemo(
    () => convertInputsToTestInput(inputs),
    [inputs],
  );

  const addTestCase = () => {
    setTestSuite({
      ...testSuite,
      tests: [
        ...testSuite.tests,
        {
          inputs: convertedInputs,
          isPublic: true,
          expected: { type: expectedType, value: "" },
        },
      ],
    });
  };

  useEffect(() => {
    const newTestSuite = { ...testSuite };

    newTestSuite.tests.forEach((test) => {
      inputs.forEach((input) => {
        if (!test.inputs[input.name]) {
          test.inputs[input.name] = {
            type: input.type,
            value: "",
          };
        } else {
          test.inputs[input.name].type = input.type;
        }
      });
    });

    setTestSuite(newTestSuite);
  }, [inputs]);

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
      await problemService.createTestSuite(problemId, testSuite);

      toast.success("Test suite created successfully");
    } catch (error) {
      toast.error("Failed to create test suite");
    }
  };

  const handleCreateSkeletons = async () => {
    try {
      Object.entries(skeletons).forEach(async ([language, skeleton]) => {
        if (!skeleton) {
          return;
        }
        await problemService.createSkeleton(
          problemId,
          language as Language,
          skeleton,
        );
      });

      toast.success("Skeletons created successfully");
    } catch (error) {
      toast.error("Failed to create skeletons");
    }
  };

  const handleCreateTemplates = async () => {
    try {
      Object.entries(templates).forEach(async ([language, template]) => {
        if (!template) return;

        await problemService.createTemplate(problemId, {
          language: language as Language,
          template,
        });
      });

      toast.success("Templates created successfully");
    } catch (error) {
      toast.error("Failed to create templates");
    }
  };

  useEffect(() => {
    if (problemId) {
      handleCreateTemplates();
      handleCreateTestSuite();
      handleCreateSkeletons();
    }
  }, [problemId]);

  return (
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

      <h2 className="text-3xl">Skeleton code (for the executor)</h2>

      <Accordion type="single" className="w-full" collapsible>
        {Object.entries(SUPPORTED_LANGUAGES).map(([language, languageData]) => (
          <AccordionItem value={language} key={language}>
            <AccordionTrigger>{language}</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-10">
                <div className="h-64">
                  <h2>Skeleton code</h2>
                  <CodeEditor
                    defaultValue={languageData.skeletonTemplate}
                    value={skeletons[language]}
                    language={language}
                    onChange={(value) => {
                      setSkeletons({
                        ...skeletons,
                        [language as Language]: value,
                      });
                    }}
                  />
                </div>

                <div className="h-64">
                  <h2>Template code</h2>
                  <CodeEditor
                    defaultValue={""}
                    value={templates[language]}
                    language={language}
                    onChange={(value) => {
                      setTemplates({
                        ...templates,
                        [language as Language]: value,
                      });
                    }}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <h2 className="text-3xl my-3">Inputs</h2>
      {!testSuite.tests.length && <p>No tests</p>}

      <InputBuilder inputs={inputs} setInputs={setInputs} />

      <h2 className="text-3xl my-3">Expected type</h2>
      <div className="w-[300px]">
        <TypeSelector value={expectedType} onChange={setExpectedType} />
      </div>

      <h2 className="text-3xl my-3">Tests</h2>
      {testSuite.tests.map((test, index) => (
        <TestCase
          index={index}
          testCase={test}
          inputs={convertedInputs}
          expectedType={expectedType}
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
  );
};
