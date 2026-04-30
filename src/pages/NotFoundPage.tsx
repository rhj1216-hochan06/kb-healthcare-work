import { primaryButtonClass } from '../components/ui/buttonStyles';
import { navigate } from '../routes';
import { cx } from '../utils/cx';

export function NotFoundPage() {
  return (
    <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
      <p className="mb-2 text-sm font-extrabold text-[var(--color-warning)]">Not Found</p>
      <h1 className="text-2xl font-extrabold text-[var(--color-text)]">페이지를 찾을 수 없습니다</h1>
      <button type="button" className={cx('mt-6', primaryButtonClass())} onClick={() => navigate('/')}>
        대시보드로 이동
      </button>
    </section>
  );
}
