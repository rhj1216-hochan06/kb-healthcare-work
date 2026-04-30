import { ApiError } from '../api/mockApi';

export const toApiError = (error: unknown) =>
  error instanceof ApiError ? error : new ApiError(500, '요청 처리 중 문제가 발생했습니다.');
