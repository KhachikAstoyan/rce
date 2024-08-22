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

export const ProblemDetails = () => {
  const { slug } = useParams({ strict: false });

  // TODO: use a custom hook
  const {
    data: problem,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["problem", slug],
    queryFn: async () => problemService.getProblemDetails(slug!),
  });

  if (isLoading) {
    return "Loading...";
  }

  if (isError || !problem) {
    return "Error";
  }

  return (
    <div>
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
    </div>
  );
};
