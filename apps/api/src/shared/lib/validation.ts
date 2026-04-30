type ValidationIssue = {
  path: PropertyKey[];
  message: string;
};

export function formatValidationMessage(error: { issues: ValidationIssue[] }): string {
  const details = error.issues
    .slice(0, 3)
    .map((issue) => {
      const path = issue.path.join(".");
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join(", ");

  return details ? `Invalid request: ${details}` : "Invalid request";
}
