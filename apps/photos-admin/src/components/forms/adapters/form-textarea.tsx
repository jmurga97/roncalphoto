import { Field, Textarea } from "@jmurga97/components";
import { useController, useFormContext } from "react-hook-form";

import type { FieldPath, FieldValues } from "react-hook-form";

interface FormTextareaProps<TValues extends FieldValues> {
  hint?: string;
  label: string;
  maxLength?: number;
  name: FieldPath<TValues>;
  optional?: boolean;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}

export function FormTextarea<TValues extends FieldValues>({
  hint,
  label,
  maxLength,
  name,
  optional = false,
  placeholder,
  required = false,
  rows = 6,
}: FormTextareaProps<TValues>) {
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
      <div ref={(node) => field.ref(node ? { focus: () => node.querySelector("textarea")?.focus() } : null)}>
        <Textarea
          invalid={fieldState.invalid}
          maxLength={maxLength}
          name={field.name}
          onBlur={field.onBlur}
          onValueChange={(value) => {
            field.onChange(value);
          }}
          placeholder={placeholder}
          rows={rows}
          value={String(field.value ?? "")}
        />
      </div>
    </Field>
  );
}
