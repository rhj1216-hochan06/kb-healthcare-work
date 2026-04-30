import { SignInIcon } from './icons';
import { primaryButtonClass } from './ui/buttonStyles';
import { navigate } from '../routes';

export function AuthRequired() {
  return (
    <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
      <div className="flex max-w-xl flex-col gap-5">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-black)]">
          <SignInIcon className="h-6 w-6" />
        </span>
        <div>
          <h2 className="text-2xl font-extrabold text-[var(--color-text)]">로그인이 필요한 화면입니다</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-sub-text)]">
            API 계약의 bearer 인증 기준에 맞춰 로그인 이후 데이터를 표시합니다.
          </p>
        </div>
        <button type="button" className={primaryButtonClass()} onClick={() => navigate('/sign-in')}>
          로그인으로 이동
        </button>
      </div>
    </section>
  );
}
