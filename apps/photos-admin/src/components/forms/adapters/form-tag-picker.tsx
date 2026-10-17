import { Field, TagPicker } from "@jmurga97/components";
import { useController, useFormContext } from "react-hook-form";

import type { FieldPath, FieldValues } from "react-hook-form";

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
      <div
        ref={(node) => {
          field.ref(node ? { focus: () => node.querySelector("input")?.focus() } : null);
        }}
      >
        <TagPicker
          ariaLabel={label}
          placeholder="Buscar etiquetas"
          emptyLabel="No hay etiquetas que coincidan"
          onValueChange={(selectedIds) => {
            field.onChange(selectedIds);
          }}
          options={options}
          value={Array.isArray(field.value) ? field.value : []}
        />
      </div>
    </Field>
  );
}
