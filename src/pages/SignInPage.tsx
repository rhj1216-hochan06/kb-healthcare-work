import { FormEvent, useState } from 'react';
import { api } from '../api/mockApi';
import { Modal } from '../components/ui/Modal';
import { PageHeader } from '../components/ui/PageHeader';
import { inputClass, primaryButtonClass } from '../components/ui/buttonStyles';
import { AuthTokenResponse } from '../types';
import { navigate } from '../routes';
import { toApiError } from '../utils/apiError';
import { cx } from '../utils/cx';

type SignInPageProps = {
  onSignIn: (tokens: AuthTokenResponse) => void;
};

export function SignInPage({ onSignIn }: SignInPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = /^[A-Za-z0-9]{8,24}$/.test(password);
  const canSubmit = isEmailValid && isPasswordValid && !isSubmitting;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched({ email: true, password: true });

    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);

    try {
      const tokens = await api.signIn({ email, password });
      onSignIn(tokens);
      navigate('/');
    } catch (requestError) {
      setErrorMessage(toApiError(requestError).errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader eyebrow="Sign in" title="로그인" description="유효한 email과 영문 또는 숫자로 구성된 비밀번호로 제출할 수 있습니다." />
      <section className="max-w-xl rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:p-8">
        <form onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="email" className="text-sm font-bold text-[var(--color-text)]">
              email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={inputClass}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onBlur={() => setTouched((current) => ({ ...current, email: true }))}
              aria-invalid={touched.email && !isEmailValid}
              aria-describedby="email-error"
              autoComplete="email"
            />
            <p id="email-error" className="mt-2 min-h-5 text-sm font-semibold text-[var(--color-danger)]">
              {touched.email && !isEmailValid ? 'email 규약에 맞는 문자열을 입력해주세요.' : ''}
            </p>
          </div>
          <div className="mt-5">
            <label htmlFor="password" className="text-sm font-bold text-[var(--color-text)]">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className={inputClass}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onBlur={() => setTouched((current) => ({ ...current, password: true }))}
              aria-invalid={touched.password && !isPasswordValid}
              aria-describedby="password-error"
              autoComplete="current-password"
            />
            <p id="password-error" className="mt-2 min-h-5 text-sm font-semibold text-[var(--color-danger)]">
              {touched.password && !isPasswordValid ? '영문 또는 숫자로 구성된 8~24글자 문자열을 입력해주세요.' : ''}
            </p>
          </div>
          <button type="submit" className={cx('mt-6 w-full', primaryButtonClass(!canSubmit))} disabled={!canSubmit}>
            {isSubmitting ? '제출 중' : '제출'}
          </button>
        </form>
      </section>
      {errorMessage ? (
        <Modal
          title="로그인 실패"
          onClose={() => setErrorMessage('')}
          actions={
            <button type="button" className={primaryButtonClass()} onClick={() => setErrorMessage('')}>
              확인
            </button>
          }
        >
          {errorMessage}
        </Modal>
      ) : null}
    </>
  );
}
