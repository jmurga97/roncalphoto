/* oxlint-disable react/only-export-components -- small shared editor helpers intentionally colocate components and functions. */
import { ConfirmAction } from "@jmurga97/components";
import { toast } from "sonner";

import { getErrorMessage } from "@utils/get-error-message";

import type { FieldValues, UseFormReturn } from "react-hook-form";

type EditorStatus = {
  label: string;
  tone: "error" | "info" | "neutral" | "success";
};

export function getServerError<TFormValues extends FieldValues>(form: UseFormReturn<TFormValues>) {
  const serverError = form.formState.errors.root?.server?.message;
  return typeof serverError === "string" ? serverError : undefined;
}

export function getEditorStatus({
  deletePending,
  isDirty,
  isSubmitSuccessful,
  savePending,
  serverError,
}: {
  deletePending: boolean;
  isDirty: boolean;
  isSubmitSuccessful: boolean;
  savePending: boolean;
  serverError?: string;
}): EditorStatus | null {
  if (deletePending) {
    return { tone: "info", label: "Eliminando…" };
  }

  if (savePending) {
    return { tone: "info", label: "Guardando…" };
  }

  if (serverError) {
    return { tone: "error", label: "Revisa el formulario" };
  }

  if (isDirty) {
    return { tone: "neutral", label: "Sin guardar" };
  }

  if (isSubmitSuccessful) {
    return { tone: "success", label: "Guardado" };
  }

  return null;
}

export function ConfirmDelete({
  message,
  title,
  confirmLabel,
  onConfirm,
  onOpenChange,
  open,
  pending,
}: {
  message: string;
  title: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  pending: boolean;
}) {
  return (
    <ConfirmAction
      message={message}
      title={title}
      confirmLabel={confirmLabel}
      cancelLabel="Cancelar"
      pendingLabel="Eliminando…"
      onCancel={() => {
        onOpenChange(false);
      }}
      onConfirm={() => {
        void (async () => {
          try {
            await onConfirm();
            onOpenChange(false);
            toast.success("Eliminado");
          } catch (error) {
            onOpenChange(false);
            toast.error(getErrorMessage(error));
          }
        })();
      }}
      onOpenChange={onOpenChange}
      open={open}
      pending={pending}
    />
  );
}

export function useResourceSubmit<TFormValues extends FieldValues, TMutationInput, TRecord>({
  form,
  onSave,
  toFormValues,
  toInput,
}: {
  form: UseFormReturn<TFormValues>;
  onSave: (input: TMutationInput) => Promise<TRecord>;
  toFormValues: (record: TRecord) => TFormValues;
  toInput: (values: TFormValues) => TMutationInput;
}) {
  return () => {
    void form.handleSubmit(async (values) => {
      form.clearErrors("root");

      try {
        const saved = await onSave(toInput(values));
        form.reset(toFormValues(saved));
        toast.success("Guardado");
      } catch (error) {
        const message = getErrorMessage(error);
        form.setError("root.server", { type: "server", message });
        toast.error(message);
      }
    })();
  };
}
