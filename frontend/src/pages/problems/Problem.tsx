import { useParams } from "@tanstack/react-router";
import { Editor } from "@/components/editor/Editor";
import { useQuery } from "@tanstack/react-query";
import { problemService } from "../../services/problems";

export const Problem = () => {
  const { problemSlug } = useParams({ strict: false });
  const { data, isLoading, isError } = useQuery({
    queryKey: ["problem", problemSlug],
    queryFn: async () => {
      return await problemService.getProblemDetails(problemSlug!);
    },
  });

  if (isLoading) {
    return "Loading...";
  }

  if (isError || !data) {
    return "Error";
  }

  return <Editor problem={data} />;
};
