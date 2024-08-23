import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/dialog";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { Button } from "@/components/shadcn/button";
import { CodeEditor } from "../../components/editor/CodeEditor";
import { getLanguageData, Language } from "../../lib/constants/languages";
import { toast } from "sonner";
import { problemService } from "../../services/problems";

interface AddLanguageDialogProps extends React.ComponentProps<typeof Dialog> {
  problemId: string;
}

export const AddLanguageDialog: React.FC<AddLanguageDialogProps> = ({
  problemId,
  ...props
}) => {
  const [language, setLanguage] = useState<string | undefined>("");
  const [skeleton, setSkeleton] = useState<string | undefined>("");
  const [template, setTemplate] = useState<string | undefined>("");
  const [isNextStep, setIsNextStep] = useState(false);

  useEffect(() => {
    setSkeleton("");
    setTemplate("");

    if (isNextStep) {
      const languageData = getLanguageData(language!);
      setSkeleton(languageData?.skeletonTemplate);
    }
  }, [isNextStep]);

  useEffect(() => {
    setLanguage("");
    setSkeleton("");
    setTemplate("");
    setIsNextStep(false);
  }, [props.open]);

  const handleSubmit = useCallback(async () => {
    if (!language || !skeleton || !template) return;

    try {
      await problemService.createSkeleton(problemId!, language as Language, skeleton!);
      await problemService.createTemplate(problemId!, { language, template });
      toast.success("Language support added");
      props.onOpenChange && props.onOpenChange(false);
    } catch (error) {
      toast.error("Failed to add language support");
    }
  }, [language, skeleton, template]);

  return (
    <Dialog {...props}>
      <DialogContent className={`${isNextStep ? "md:max-w-[1200px]" : ""}`}>
        <DialogHeader>
          <DialogTitle>
            {isNextStep ? language : "Add language support"}
          </DialogTitle>
          <DialogDescription>
            Add support for a new language by providing a name and some skeleton
            code to glue it all together :)
          </DialogDescription>
        </DialogHeader>
        <div className="py-3 flex gap-4 flex-col items-start">
          {!isNextStep && (
            <div className="flex flex-col gap-3 items-start w-full">
              <Label htmlFor="name" className="text-left">
                Name
              </Label>
              <Input
                id="name"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              />
            </div>
          )}

          {isNextStep && (
            <div className="flex flex-col gap-10 w-full items-start mb-5">
              <Button onClick={() => setIsNextStep(false)}>Previous</Button>
              <div className="h-64 w-full">
                <h2>Skeleton code</h2>
                <CodeEditor
                  value={skeleton}
                  language={"python"}
                  onChange={setSkeleton}
                />
              </div>

              <div className="h-64 w-full">
                <h2>Template code</h2>
                <CodeEditor
                  value={template}
                  language={language}
                  onChange={setTemplate}
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          {isNextStep ? (
            <Button onClick={handleSubmit}>Save</Button>
          ) : (
            <Button onClick={() => setIsNextStep(true)}>Next</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};