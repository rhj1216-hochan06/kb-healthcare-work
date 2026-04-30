import { useEffect, useState } from 'react';
import { api, ApiError } from '../api/mockApi';
import { RequestWithAuth } from '../auth/useAuth';
import { AuthRequired } from '../components/AuthRequired';
import { Modal } from '../components/ui/Modal';
import { ErrorPanel } from '../components/ui/ErrorPanel';
import { PageHeader } from '../components/ui/PageHeader';
import {
  dangerButtonClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../components/ui/buttonStyles';
import { TaskDetailResponse } from '../types';
import { navigate } from '../routes';
import { toApiError } from '../utils/apiError';
import { cx } from '../utils/cx';

type TaskDetailPageProps = {
  id: string;
  isSignedIn: boolean;
  requestWithAuth: RequestWithAuth;
};

export function TaskDetailPage({ id, isSignedIn, requestWithAuth }: TaskDetailPageProps) {
  const [detail, setDetail] = useState<TaskDetailResponse | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState('');
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');
  const canDelete = confirmId === id;

  useEffect(() => {
    let ignore = false;

    if (!isSignedIn) {
      setDetail(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    requestWithAuth((accessToken) => api.getTaskDetail(accessToken, id))
      .then((result) => {
        if (!ignore) {
          setDetail(result);
        }
      })
      .catch((requestError) => {
        if (!ignore) {
          setError(toApiError(requestError));
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [id, isSignedIn, requestWithAuth]);

  const handleDelete = async () => {
    if (!canDelete) {
      return;
    }

    try {
      await requestWithAuth((accessToken) => api.deleteTask(accessToken, id));
      navigate('/task');
    } catch (requestError) {
      setDeleteErrorMessage(toApiError(requestError).errorMessage);
    }
  };

  if (!isSignedIn) {
    return <AuthRequired />;
  }

  if (error?.status === 404) {
    return <MissingTask id={id} />;
  }

  return (
    <>
      <PageHeader
        eyebrow="Task Detail"
        title={id}
        description="할 일 상세 내용과 등록일을 확인합니다."
        action={
          <button type="button" className={dangerButtonClass} onClick={() => setIsDeleteModalOpen(true)}>
            삭제
          </button>
        }
      />
      {error ? <ErrorPanel error={error} /> : null}
      <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:p-8" aria-busy={isLoading}>
        {isLoading && !detail ? (
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded-lg bg-[var(--color-disabled)]" />
            <div className="h-24 animate-pulse rounded-lg bg-[var(--color-disabled)]" />
          </div>
        ) : detail ? (
          <div className="space-y-8">
            <div>
              <p className="mb-2 text-sm font-bold text-[var(--color-muted-text)]">title</p>
              <h2 className="text-2xl font-extrabold text-[var(--color-text)]">{detail.title}</h2>
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-[var(--color-muted-text)]">memo</p>
              <p className="rounded-lg bg-[var(--color-surface-muted)] p-5 text-base leading-7 text-[var(--color-sub-text)]">{detail.memo}</p>
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-[var(--color-muted-text)]">registerDatetime</p>
              <p className="text-base font-bold text-[var(--color-text)]">{new Date(detail.registerDatetime).toLocaleString('ko-KR')}</p>
            </div>
          </div>
        ) : null}
      </section>
      {isDeleteModalOpen ? (
        <Modal
          title="삭제 확인"
          onClose={() => {
            setIsDeleteModalOpen(false);
            setConfirmId('');
            setDeleteErrorMessage('');
          }}
          actions={
            <>
              <button type="button" className={secondaryButtonClass} onClick={() => setIsDeleteModalOpen(false)}>
                취소
              </button>
              <button type="button" className={primaryButtonClass(!canDelete)} disabled={!canDelete} onClick={handleDelete}>
                제출
              </button>
            </>
          }
        >
          <label htmlFor="delete-confirm-id" className="block text-sm font-bold text-[var(--color-text)]">
            삭제하려면 {id}를 입력해주세요.
          </label>
          <input
            id="delete-confirm-id"
            className={inputClass}
            value={confirmId}
            onChange={(event) => setConfirmId(event.target.value)}
            aria-describedby="delete-confirm-error"
          />
          <p id="delete-confirm-error" className="mt-2 min-h-5 text-sm font-semibold text-[var(--color-danger)]">
            {deleteErrorMessage}
          </p>
        </Modal>
      ) : null}
    </>
  );
}

function MissingTask({ id }: { id: string }) {
  return (
    <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
      <p className="mb-2 text-sm font-extrabold text-[var(--color-danger)]">404</p>
      <h1 className="text-2xl font-extrabold text-[var(--color-text)]">리소스가 없습니다</h1>
      <p className="mt-2 text-sm leading-6 text-[var(--color-sub-text)]">{id}에 해당하는 할 일을 찾을 수 없습니다.</p>
      <button type="button" className={cx('mt-6', primaryButtonClass())} onClick={() => navigate('/task')}>
        목록으로 돌아가기
      </button>
    </section>
  );
}
