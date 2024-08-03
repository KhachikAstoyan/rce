import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { problemService } from "../services/problems";
import { Container } from "@/components/shadcn/container";
import { DataGrid } from "@/components/common/DataGrid";
import { format } from "date-fns";
import { ProblemDifficulty } from "@/components/problem/ProblemDifficulty";
import { ProblemStatus } from "@/components/problem/ProblemStatus";
import { DefaultLayout } from "@/layouts/DefaultLayout";

export const Home = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["problems"],
    queryFn: problemService.getProblems,
  });

  if (isLoading || !data) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error</div>;
  }

  return (
    <DefaultLayout>
      <Container>
        <h1>Problems</h1>
        <DataGrid
          data={data}
          columns={[
            {
              accessorKey: "solved",
              header: "Solved",
              cell: (cell) => <ProblemStatus solved={!!cell.getValue()} />,
            },
            {
              accessorKey: "name",
              header: "Name",
              cell: (cell) => (
                <Link to={`/problems/${cell.row.original.slug}`}>
                  {cell.getValue() as string}
                </Link>
              ),
            },
            {
              accessorKey: "difficulty",
              header: "Difficulty",
              cell: (cell) => (
                <ProblemDifficulty difficulty={cell.getValue() as any} />
              ),
            },
            {
              accessorKey: "createdAt",
              header: "Created At",
              cell: (cell) =>
                format(new Date(cell.getValue() as any), "MM/dd/yyyy"),
            },
          ]}
        />
      </Container>
    </DefaultLayout>
  );
};
