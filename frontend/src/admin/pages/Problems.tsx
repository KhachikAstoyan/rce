import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { problemService } from "@/services/problems";
import { DataGrid } from "../../components/common/DataGrid";
import { ProblemStatus } from "../../components/problem/ProblemStatus";
import { ProblemDifficulty } from "../../components/problem/ProblemDifficulty";
import { formatDate } from "../../lib/utils";

export const Problems = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["problems"],
    queryFn: problemService.getProblems,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const problems = data || [];

  return (
    <>
      <h1>Problems</h1>
      <DataGrid
        data={problems}
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
              <Link to={`/admin/problems/${cell.row.original.slug}`}>
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
            cell: (cell) => formatDate(cell.getValue() as string),
          },
        ]}
      />
    </>
  );
};
