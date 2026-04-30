import { McField, McInput } from "@murga/components/react";
import { useId } from "react";
import { type FieldPath, type FieldValues, useController, useFormContext } from "react-hook-form";

interface FormTextInputProps<TValues extends FieldValues> {
  autocomplete?: string;
  hint?: string;
  label: string;
  name: FieldPath<TValues>;
  optional?: boolean;
  placeholder?: string;
  required?: boolean;
  type?: string;
}

export function FormTextInput<TValues extends FieldValues>({
  autocomplete,
  hint,
  label,
  name,
  optional = false,
  placeholder,
  required = false,
  type = "text",
}: FormTextInputProps<TValues>) {
  const inputId = useId();
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
      <McInput
        autocomplete={autocomplete}
        inputId={inputId}
        invalid={fieldState.invalid}
        onMcChange={(event) => {
          field.onChange(event.detail.value);
        }}
        placeholder={placeholder}
        ref={field.ref}
        type={type}
        value={String(field.value ?? "")}
      />
    </McField>
  );
}
