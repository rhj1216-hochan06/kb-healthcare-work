import { TaskItem } from '../../types';
import { cx } from '../../utils/cx';

type StatusBadgeProps = {
  status: TaskItem['status'];
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const isDone = status === 'DONE';

  return (
    <span
      className={cx(
        'inline-flex rounded-lg px-2.5 py-1 text-xs font-extrabold',
        isDone ? 'bg-[var(--color-success-soft)] text-[var(--color-success)]' : 'bg-[var(--color-primary-soft)] text-[var(--color-black)]',
      )}
    >
      {isDone ? 'DONE' : 'TODO'}
    </span>
  );
}
