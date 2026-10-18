import { Field, Input } from "@jmurga97/components";
import { useController, useFormContext } from "react-hook-form";

import type { FieldPath, FieldValues } from "react-hook-form";

interface FormTextInputProps<TValues extends FieldValues> {
  autocomplete?: string;
  hint?: string;
  label: string;
  maxLength?: number;
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
  maxLength,
  name,
  optional = false,
  placeholder,
  required = false,
  type = "text",
}: FormTextInputProps<TValues>) {
  const { control } = useFormContext<TValues>();
  const { field, fieldState } = useController({
    name,
    control,
  });

  return (
    <Field
      error={fieldState.error?.message}
      hint={hint}
      invalid={fieldState.invalid}
      label={label}
      optional={optional}
      optionalLabel="Opcional"
      required={required}
    >
      <Input
        autoComplete={autocomplete}
        invalid={fieldState.invalid}
        maxLength={maxLength}
        name={field.name}
        onBlur={field.onBlur}
        onValueChange={(value) => {
          field.onChange(value);
        }}
        placeholder={placeholder}
        ref={field.ref}
        type={type}
        value={String(field.value ?? "")}
      />
    </Field>
  );
}
