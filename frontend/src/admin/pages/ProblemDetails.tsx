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
import { useState } from "react";
import { CodeEditor } from "../../components/editor/CodeEditor";
import { Button } from "../../components/shadcn/button";
import { AddLanguageDialog } from "../components/AddLanguageDialog";

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

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const {
    data: problem,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["problem", id],
    queryFn: async () => problemService.getProblemDetails(id!),
  });

  if (isLoading) {
    return "Loading...";
  }

  if (isError || !problem || !skeletons || !templates) {
    return "Error";
  }

  return (
    <div>
      <AddLanguageDialog
        open={isAddDialogOpen}
        problemId={id!}
        onOpenChange={setIsAddDialogOpen}
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

      <Button onClick={() => setIsAddDialogOpen(true)}>Add new language</Button>
    </div>
  );
};