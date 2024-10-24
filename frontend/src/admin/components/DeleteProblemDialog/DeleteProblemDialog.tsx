import { problemService } from "@/services/problems";
import { useCallback } from "react";
import { toast } from "sonner";
import { Button, Modal, Text } from "@mantine/core";

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
    <Modal
      title="Are you absolutely sure?"
      opened={isOpen}
      onClose={() => setIsOpen(false)}
    >
      <Modal.Body>
        <Text>
          This action cannot be undone. This will permanently delete your
          account and remove your data from our servers
        </Text>
      </Modal.Body>

      <Button onClick={handleDelete} color="red">
        Delete
      </Button>
    </Modal>
  );
};
