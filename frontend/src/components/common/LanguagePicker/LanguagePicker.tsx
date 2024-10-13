import { Select } from "@mantine/core";

interface LanguagePickerProps {
  value: string | null;
  onChange: (lang: string | null) => void;
  supportedLanguages?: string[];
}

export const LanguagePicker: React.FC<LanguagePickerProps> = ({
  value,
  supportedLanguages,
  onChange,
}) => {
  return (
    <>
      <Select
        allowDeselect={false}
        searchable
        data={supportedLanguages}
        value={value}
        onChange={onChange}
      />
    </>
  );
};
