/* eslint-disable react-refresh/only-export-components -- small shared editor helpers intentionally colocate components and functions. */
import { McConfirmAction } from "@murga.ing/components/react";
import { getErrorMessage } from "@roncal/shared";

import type { FieldValues, UseFormReturn } from "react-hook-form";

type EditorStatus = {
  label: string;
  tone: "error" | "idle" | "loading" | "success";
};

type EditorStatusLabels = {
  deletingLabel: string;
  dirtyLabel: string;
  savedLabel: string;
  savingLabel: string;
};

export function getServerError<TFormValues extends FieldValues>(form: UseFormReturn<TFormValues>) {
  const serverError = form.formState.errors.root?.server?.message;
  return typeof serverError === "string" ? serverError : undefined;
}

export function getEditorStatus({
  deletePending,
  isDirty,
  isSubmitSuccessful,
  labels,
  savePending,
  serverError,
}: {
  deletePending: boolean;
  isDirty: boolean;
  isSubmitSuccessful: boolean;
  labels: EditorStatusLabels;
  savePending: boolean;
  serverError?: string;
}): EditorStatus | null {
  if (deletePending) {
    return { tone: "loading", label: labels.deletingLabel };
  }

  if (savePending) {
    return { tone: "loading", label: labels.savingLabel };
  }

  if (serverError) {
    return { tone: "error", label: "Revisa el formulario" };
  }

  if (isSubmitSuccessful) {
    return { tone: "success", label: labels.savedLabel };
  }

  if (isDirty) {
    return { tone: "idle", label: labels.dirtyLabel };
  }

  return null;
}

export function ServerErrorMessage({ message }: { message?: string }) {
  return message ? (
    <mc-inline-message message={message} title="No se pudo completar la operación" tone="error" />
  ) : null;
}

export function ConfirmDelete({
  message,
  onConfirm,
  onErrorMessage,
  onOpenChange,
  open,
  pending,
}: {
  message: string;
  onConfirm: () => Promise<void>;
  onErrorMessage: (message: string) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  pending: boolean;
}) {
  return (
    <McConfirmAction
      message={message}
      onMcCancel={() => {
        onOpenChange(false);
      }}
      onMcConfirm={() => {
        void (async () => {
          try {
            await onConfirm();
          } catch (error) {
            onOpenChange(false);
            onErrorMessage(getErrorMessage(error));
          }
        })();
      }}
      open={open}
      pending={pending}
    />
  );
}

export function useResourceSubmit<TFormValues extends FieldValues, TMutationInput, TRecord>({
  form,
  onSave,
  onSaved,
  toFormValues,
  toInput,
  validate,
}: {
  form: UseFormReturn<TFormValues>;
  onSave: (input: TMutationInput) => Promise<TRecord>;
  onSaved?: (record: TRecord) => void;
  toFormValues: (record: TRecord) => TFormValues;
  toInput: (values: TFormValues) => TMutationInput;
  validate?: (input: TMutationInput, values: TFormValues) => boolean;
}) {
  return () => {
    void form.handleSubmit(async (values) => {
      form.clearErrors("root");
      const input = toInput(values);

      if (validate && !validate(input, values)) {
        return;
      }

      try {
        const record = await onSave(input);
        onSaved?.(record);
        form.reset(toFormValues(record));
      } catch (error) {
        form.setError("root.server", {
          type: "server",
          message: getErrorMessage(error),
        });
      }
    })();
  };
}
