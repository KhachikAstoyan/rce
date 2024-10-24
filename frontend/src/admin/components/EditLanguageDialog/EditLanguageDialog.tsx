import { CodeEditor } from "@/components/editor/CodeEditor";
import { Button } from "@mantine/core";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/shadcn/dialog";
import { problemService } from "@/services/problems";
import { DialogTitle } from "@radix-ui/react-dialog";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

type DialogProps = React.ComponentProps<typeof Dialog>;

interface EditLanguageDialogProps extends DialogProps {
  skeleton: string;
  template: string;
  language: string;
  problemId: string;
}

export const EditLanguageDialog: React.FC<EditLanguageDialogProps> = ({
  template,
  language,
  skeleton,
  problemId,
  ...dialogProps
}) => {
  const [newSkeleton, setNewSkeleton] = useState<string | undefined>(skeleton);
  const [newTemplate, setNewTemplate] = useState<string | undefined>(template);

  useEffect(() => {
    setNewSkeleton(skeleton);
    setNewTemplate(template);
  }, [skeleton, template]);

  const handleSubmit = async () => {
    if (!newSkeleton || !newTemplate) return;

    try {
      const skeletonRes = problemService.updateSkeleton(
        problemId,
        language,
        newSkeleton,
      );
      const templateRes = problemService.updateTemplate(
        problemId,
        language,
        newTemplate,
      );

      await Promise.all([skeletonRes, templateRes]);

      toast.success("Edit successful");
    } catch (error) {
      toast.error("Something went wrong while editing language support");
    }
  };

  return (
    <Dialog {...dialogProps}>
      <DialogContent className="md:max-w-[1200px]">
        <DialogHeader>
          <DialogTitle>Edit language support for {language}</DialogTitle>
          <DialogDescription>
            Edit skeleton and template for {language}
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 flex gap-4 flex-col items-start">
          <div className="flex flex-col gap-10 w-full items-start mb-5">
            <div className="h-64 w-full">
              <h2>Skeleton code</h2>
              <CodeEditor
                value={newSkeleton}
                language={language}
                onChange={setNewSkeleton}
              />
            </div>

            <div className="h-64 w-full">
              <h2>Template code</h2>
              <CodeEditor
                value={newTemplate}
                language={language}
                onChange={setNewTemplate}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
