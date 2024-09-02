import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { problemService } from "../../services/problems";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "../../components/shadcn/accordion";
import { AccordionContent } from "@radix-ui/react-accordion";
import Markdown from "react-markdown";
import { useCallback, useRef, useState } from "react";
import { CodeEditor } from "../../components/editor/CodeEditor";
import { Button } from "../../components/shadcn/button";
import { AddLanguageDialog } from "../components/AddLanguageDialog/AddLanguageDialog";
import { toast } from "sonner";
import { EditLanguageDialog } from "../components/EditLanguageDialog/EditLanguageDialog";
import { TestEditor, TestEditorRef } from "../components/TestEditor/TestEditor";

export const ProblemDetails = () => {
  const { id } = useParams({ strict: false });

  const { data: skeletons } = useQuery({
    queryKey: ["skeletons", id],
    queryFn: async () => problemService.getProblemSkeletons(id!),
  });

  const { data: templates } = useQuery({
    queryKey: ["templates", id],
    queryFn: async () => problemService.getProblemTemplates(id!),
  });

  const { data: tests } = useQuery({
    queryKey: ["allTests", id],
    queryFn: async () => problemService.getAllTests(id!),
  });

  const [addLanguageDialogOpen, setAddLanguageDialogOpen] = useState(false);
  const [editLanguageDialogOpen, setEditLanguageDialogOpen] = useState(false);
  const [isTestEditMode, setIsTestEditMode] = useState(false);
  const testEditRef = useRef<TestEditorRef | null>(null);

  const [editingLanguage, setEditingLanguage] = useState<{
    language: string;
    skeleton: string;
    template: string;
  } | null>(null);

  const {
    data: problem,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["problem", id],
    queryFn: async () => problemService.getProblemDetails(id!),
  });

  const handleDeleteLanguageSupport = async (language: string) => {
    try {
      if (!id) throw new Error("");

      const deleteSkeleton = problemService.deleteSkeleton(id, language);
      const deleteTemplate = problemService.deleteSolutionTemplate(
        id,
        language,
      );

      await Promise.all([deleteSkeleton, deleteTemplate]);

      toast.success(`${language} support delete for this problem`);
    } catch (_e) {
      toast.error(`Couldn't delete support for ${language}`);
    }
  };

  const cancelTestEdits = useCallback(() => {
    testEditRef.current?.resetState();
    setIsTestEditMode(false);
  }, [testEditRef, setIsTestEditMode]);

  const saveTestEdits = useCallback(async () => {
    const testSuite = testEditRef.current?.getTestSuite();
    if(!testSuite) {
      toast.error("Error! Please create test suite");
      return;
    }

    try {
      await problemService.updateTestSuite(id!, testSuite)

      toast.success("Test cases successfully updated")
    } catch (error) {
      toast.error("Error occured! Please try again later.")
    }
  }, [testEditRef])

  if (isLoading) {
    return "Loading...";
  }

  if (isError || !problem || !skeletons || !templates) {
    return "Error";
  }

  return (
    <div>
      <AddLanguageDialog
        open={addLanguageDialogOpen}
        problemId={id!}
        onOpenChange={setAddLanguageDialogOpen}
      />

      <EditLanguageDialog
        open={editLanguageDialogOpen}
        onOpenChange={setEditLanguageDialogOpen}
        problemId={id!}
        language={editingLanguage?.language!}
        skeleton={editingLanguage?.skeleton!}
        template={editingLanguage?.template!}
      />

      <h1 className="text-3xl font-bold border-b pb-3 mb-10">
        {problem?.name}
      </h1>
      <Accordion type="single" className="w-full" collapsible>
        <AccordionItem value="description">
          <AccordionTrigger>Description</AccordionTrigger>
          <AccordionContent>
            <Markdown>{problem?.description}</Markdown>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <h2 className="text-xl font-bold mt-10">Supported Languages</h2>

      <Accordion className="mb-10 w-full" type="single" collapsible>
        {Object.keys(skeletons).map((language) => (
          <AccordionItem value={language} key={language}>
            <AccordionTrigger>{language}</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-10">
                <div className="flex gap-2">
                  <Button
                    className="self-start"
                    onClick={() => handleDeleteLanguageSupport(language)}
                  >
                    Delete support
                  </Button>
                  <Button
                    variant="outline"
                    className="self-start"
                    onClick={() => {
                      setEditingLanguage({
                        language,
                        skeleton: skeletons[language],
                        template: templates[language],
                      });
                      setEditLanguageDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                </div>
                <div className="h-64">
                  <h2>Skeleton code</h2>
                  <CodeEditor
                    value={skeletons[language]}
                    defaultValue={skeletons[language]}
                    language={language}
                    options={{ readOnly: true }}
                  />
                </div>

                <div className="h-64">
                  <h2>Template code</h2>
                  <CodeEditor
                    value={templates[language]}
                    defaultValue={templates[language]}
                    language={language}
                    options={{ readOnly: true }}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Button onClick={() => setAddLanguageDialogOpen(true)}>
        Add new language
      </Button>

      {tests && (
        <TestEditor
          problemId={id!}
          currentTestSuite={tests.testSuite}
          allowEdits={isTestEditMode}
          ref={testEditRef}
        />
      )}

      <div className="mt-3">
        {isTestEditMode ? (
          <div className="flex gap-2">
            <Button onClick={saveTestEdits}>Save</Button>
            <Button variant="outline" onClick={cancelTestEdits}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button onClick={() => setIsTestEditMode(true)}>Edit tests</Button>
        )}
      </div>
    </div>
  );
};
