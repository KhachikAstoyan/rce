import { Select } from "@radix-ui/themes";

interface LanguagePickerProps {
  value: string;
  onChange: (lang: string) => void;
  supportedLanguages?: string[];
}

export const LanguagePicker: React.FC<LanguagePickerProps> = ({
  value,
  supportedLanguages,
  onChange,
}) => {
  return (
    <>
      <Select.Root value={value} onValueChange={onChange}>
        <Select.Trigger />
        <Select.Content>
          {supportedLanguages?.map((lang) => (
            <Select.Item key={lang} value={lang}>
              {lang}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </>
  );
};
