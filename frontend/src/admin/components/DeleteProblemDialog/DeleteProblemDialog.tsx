import { Button } from "@/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/dialog";
import { problemService } from "@/services/problems";
import { useCallback } from "react";
import { toast } from "sonner";

interface DeleteProblemDialogProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  problemId: string;
}

export const DeleteProblemDialog: React.FC<DeleteProblemDialogProps> = ({
  isOpen,
  setIsOpen,
  problemId,
}) => {
  const handleDelete = useCallback(async () => {
    if (!problemId) return;

    try {
      await problemService.deleteProblem(problemId);

      toast.success("Problem deleted");
    } catch (error) {
      toast.error("Couldn't delete the problem :(");
    } finally {
      setIsOpen(false);
    }
  }, [problemId]);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleDelete} variant="destructive">
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
