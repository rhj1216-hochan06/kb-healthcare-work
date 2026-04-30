import { ChevronIcon } from '../icons';
import { TaskItem } from '../../types';
import { navigate } from '../../routes';
import { StatusBadge } from './StatusBadge';

type TaskCardProps = {
  task: TaskItem;
};

export function TaskCard({ task }: TaskCardProps) {
  return (
    <button
      type="button"
      className="flex h-full w-full items-center justify-between gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-left transition hover:border-[var(--color-primary-border)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
      onClick={() => navigate(`/task/${encodeURIComponent(task.id)}`)}
      aria-label={`${task.title} 상세 페이지로 이동`}
    >
      <span className="min-w-0">
        <span className="mb-2 flex items-center gap-2">
          <StatusBadge status={task.status} />
          <span className="text-xs font-bold text-[var(--color-muted-text)]">{task.id}</span>
        </span>
        <span className="block truncate text-lg font-extrabold text-[var(--color-text)]">{task.title}</span>
        <span className="mt-2 block line-clamp-2 text-sm leading-6 text-[var(--color-sub-text)]">{task.memo}</span>
      </span>
      <ChevronIcon className="h-5 w-5 shrink-0 text-[var(--color-muted-text)]" />
    </button>
  );
}
