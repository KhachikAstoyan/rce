import { Problem } from "../../lib/types";
import { ScrollArea } from "@/components/shadcn/scroll-area";
import { Prose } from "@/components/common/Prose";
import Markdown from "react-markdown";

interface Props {
  problem: Problem;
}

export const ProblemDescription: React.FC<Props> = ({ problem }) => {
  return (
    <ScrollArea className="p-4 max-w-full h-full">
      <Prose>
        <h2>{problem.name}</h2>
        <Markdown>{problem.description}</Markdown>
      </Prose>
    </ScrollArea>
  );
};
