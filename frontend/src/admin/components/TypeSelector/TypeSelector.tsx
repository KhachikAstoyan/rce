import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcn/select";
import { dataTypes } from "@/lib/constants/types";
import React from "react";

interface TypeSelectorProps {
  value: string;
  onChange: (_type: string) => void
}

export const TypeSelector: React.FC<TypeSelectorProps> = ({value, onChange}) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Type"/>
      </SelectTrigger>
      <SelectContent>
        {dataTypes.map((dataType) => (
          <SelectItem value={dataType.value}>{dataType.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  ) 
}
