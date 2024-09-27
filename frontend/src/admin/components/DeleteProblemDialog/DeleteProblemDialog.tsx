import { Button } from "@radix-ui/themes";
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
  onSuccess?: () => void;
}

export const DeleteProblemDialog: React.FC<DeleteProblemDialogProps> = ({
  isOpen,
  setIsOpen,
  problemId,
  onSuccess,
}) => {
  const handleDelete = useCallback(async () => {
    if (!problemId) return;

    try {
      await problemService.deleteProblem(problemId);

      toast.success("Problem deleted");
      onSuccess && onSuccess();
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
          <Button onClick={handleDelete} color="red">
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
