import { cx } from '../../utils/cx';

export const primaryButtonClass = (disabled?: boolean) =>
  cx(
    'inline-flex h-12 items-center justify-center rounded-lg px-5 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]',
    disabled
      ? 'cursor-not-allowed bg-[var(--color-disabled)] text-[var(--color-disabled-text)]'
      : 'bg-[var(--color-primary)] text-[var(--color-black)] hover:bg-[var(--color-primary-hover)]',
  );

export const secondaryButtonClass =
  'inline-flex h-12 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-5 text-sm font-bold text-[var(--color-text)] transition hover:bg-[var(--color-surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]';

export const dangerButtonClass =
  'inline-flex h-12 items-center justify-center rounded-lg bg-[var(--color-danger)] px-5 text-sm font-bold text-[var(--color-surface)] transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]';

export const inputClass =
  'mt-2 h-12 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted-text)] focus:border-[var(--color-focus)] focus:ring-2 focus:ring-[var(--color-focus)] focus:ring-offset-2 focus:ring-offset-[var(--color-surface)]';
