import React, { useCallback, useEffect, useState } from "react";
import { CodeEditor } from "../../../components/editor/CodeEditor";
import {
  getLanguageData,
  Language,
  SUPPORTED_LANGUAGES,
} from "../../../lib/constants/languages";
import { toast } from "sonner";
import { problemService } from "../../../services/problems";
import { LanguagePicker } from "@/components/common/LanguagePicker/LanguagePicker";
import {
  Button,
  Flex,
  InputLabel,
  Modal,
  ModalProps,
  Text,
} from "@mantine/core";

interface AddLanguageDialogProps extends ModalProps {
  problemId: string;
}

export const AddLanguageDialog: React.FC<AddLanguageDialogProps> = ({
  problemId,
  ...props
}) => {
  const [language, setLanguage] = useState<string | null>(null);
  const [skeleton, setSkeleton] = useState<string | undefined>("");
  const [template, setTemplate] = useState<string | undefined>("");
  const [isNextStep, setIsNextStep] = useState(false);

  const isValidLanguageSupport = language && skeleton && template;

  useEffect(() => {
    setSkeleton("");
    setTemplate("");

    if (isNextStep) {
      const languageData = getLanguageData(language!);
      setSkeleton(languageData?.skeletonTemplate || "");
    }
  }, [isNextStep]);

  useEffect(() => {
    setLanguage("");
    setSkeleton("");
    setTemplate("");
    setIsNextStep(false);
  }, [props.opened]);

  const handleSubmit = useCallback(async () => {
    if (!isValidLanguageSupport) return;

    try {
      await problemService.createSkeleton(
        problemId!,
        language as Language,
        skeleton!,
      );
      await problemService.createTemplate(problemId!, { language, template });
      toast.success("Language support added");
      props.onClose && props.onClose();
    } catch (error) {
      toast.error("Failed to add language support");
    }
  }, [language, skeleton, template]);

  return (
    <Modal
      title={isNextStep ? language : "Add language support"}
      size="auto"
      {...props}
    >
      <div className={`${isNextStep ? "md:max-w-[1200px]" : ""}`}>
        <Text>
          Add support for a new language by providing a name and some skeleton
          code to glue it all together :)
        </Text>
        <div className="py-3 flex gap-4 flex-col items-start">
          {!isNextStep && (
            <div className="flex flex-col gap-3 items-start w-full">
              <InputLabel htmlFor="name" className="text-left">
                Name
              </InputLabel>
              <LanguagePicker
                value={language}
                onChange={setLanguage}
                supportedLanguages={Object.keys(SUPPORTED_LANGUAGES)}
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
                  language={language!}
                  onChange={setSkeleton}
                />
              </div>

              <div className="h-64 w-full">
                <h2>Template code</h2>
                <CodeEditor
                  value={template}
                  language={language!}
                  onChange={setTemplate}
                />
              </div>
            </div>
          )}
        </div>
        <Flex justify="end">
          {isNextStep ? (
            <Button disabled={!isValidLanguageSupport} onClick={handleSubmit}>
              Save
            </Button>
          ) : (
            <Button disabled={!language} onClick={() => setIsNextStep(true)}>
              Next
            </Button>
          )}
        </Flex>
      </div>
    </Modal>
  );
};
