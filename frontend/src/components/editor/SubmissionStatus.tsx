import clsx from "clsx";
import { ISubmission } from "../../lib/types";
import { formatDate } from "../../lib/utils";

interface Props {
  submission?: ISubmission;
}

export const SubmissionStatus: React.FC<Props> = ({ submission }) => {
  if (!submission) return null;
  const isSuccess = submission.results.success;
  return (
    <div className="p-2 flex flex-col justify-center items-center h-full">
      <h2
        className={clsx("text-2xl mb-1 font-bold", {
          "text-green-600": isSuccess,
          "text-red-600": !isSuccess,
        })}
      >
        {isSuccess ? "Correct!" : "Incorrect"}
      </h2>
      <span className="text-neutral-400">
        Submitted at {formatDate(submission.createdAt)}
      </span>
    </div>
  );
};
