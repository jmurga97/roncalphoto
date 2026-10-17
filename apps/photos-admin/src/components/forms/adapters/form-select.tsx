import { Field, Select } from "@jmurga97/components";
import { useController, useFormContext } from "react-hook-form";

import type { FieldPath, FieldValues } from "react-hook-form";

interface SelectOption {
  description?: string;
  disabled?: boolean;
  id: string;
  label: string;
}

interface FormSelectProps<TValues extends FieldValues> {
  hint?: string;
  label: string;
  name: FieldPath<TValues>;
  options: SelectOption[];
  optional?: boolean;
  placeholder?: string;
  required?: boolean;
}

export function FormSelect<TValues extends FieldValues>({
  hint,
  label,
  name,
  options,
  optional = false,
  placeholder = "Seleccionar opción",
  required = false,
}: FormSelectProps<TValues>) {
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
      <Select
        triggerRef={field.ref}
        name={field.name}
        onValueChange={(value) => {
          field.onChange(value ?? "");
        }}
        options={options}
        placeholder={placeholder}
        value={typeof field.value === "string" && field.value.length > 0 ? field.value : null}
      />
    </Field>
  );
}
