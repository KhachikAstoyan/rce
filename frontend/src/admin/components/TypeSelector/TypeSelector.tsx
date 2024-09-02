import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import { dataTypes } from "@/lib/constants/types";
import React from "react";

interface TypeSelectorProps {
  value: string;
  onChange: (_type: string) => void;
  disabled?: boolean;
}

export const TypeSelector: React.FC<TypeSelectorProps> = ({
  value,
  onChange,
  disabled,
}) => {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Type" />
      </SelectTrigger>
      <SelectContent>
        {dataTypes.map((dataType) => (
          <SelectItem key={dataType.value + dataType.label} value={dataType.value}>{dataType.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
