import { ApiError } from '../../api/mockApi';

type ErrorPanelProps = {
  error: ApiError;
};

export function ErrorPanel({ error }: ErrorPanelProps) {
  return (
    <div className="mb-4 rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger-soft)] p-4 text-sm font-semibold text-[var(--color-danger)]">
      {error.status}: {error.errorMessage}
    </div>
  );
}
