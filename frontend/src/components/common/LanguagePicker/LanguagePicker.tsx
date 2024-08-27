import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcn/select";

interface LanguagePickerProps {
  value: string;
  onChange: (lang: string) => void;
  supportedLanguages: string[]
}

export const LanguagePicker: React.FC<LanguagePickerProps> = ({
  value,
  supportedLanguages,
  onChange,
}) => {
  return (
    <>
      <Select
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          {supportedLanguages.map((lang) => (
            <SelectItem key={lang} value={lang}>
              {lang}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
};
