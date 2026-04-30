import { McField, McTagPicker } from "@murga/components/react";
import { useId, useState } from "react";
import { type FieldPath, type FieldValues, useController, useFormContext } from "react-hook-form";

interface TagOption {
  description?: string;
  disabled?: boolean;
  id: string;
  label: string;
}

interface FormTagPickerProps<TValues extends FieldValues> {
  hint?: string;
  label: string;
  name: FieldPath<TValues>;
  options: TagOption[];
  optional?: boolean;
  required?: boolean;
}

export function FormTagPicker<TValues extends FieldValues>({
  hint,
  label,
  name,
  options,
  optional = false,
  required = false,
}: FormTagPickerProps<TValues>) {
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const { control } = useFormContext<TValues>();
  const { field, fieldState } = useController({
    name,
    control,
  });

  return (
    <McField
      error={fieldState.error?.message}
      hint={hint}
      inputId={inputId}
      invalid={fieldState.invalid}
      label={label}
      optional={optional}
      required={required}
    >
      <McTagPicker
        inputId={inputId}
        onMcChange={(event) => {
          field.onChange(event.detail.selectedIds);
        }}
        onMcOpenChange={(event) => {
          setOpen(event.detail.open);
        }}
        open={open}
        options={options}
        ref={field.ref}
        selectedIds={Array.isArray(field.value) ? field.value : []}
      />
    </McField>
  );
}
