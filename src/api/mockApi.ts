import {
  AuthTokenResponse,
  DashboardResponse,
  DeleteTaskResponse,
  SignInRequest,
  TaskDetailResponse,
  TaskItem,
  TaskListResponse,
  UserResponse,
} from '../types';

const PAGE_SIZE = 12;
const ACCESS_TOKEN_TTL_MS = 60 * 60 * 1000;
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type MockTask = TaskItem & {
  registerDatetime: string;
};

export class ApiError extends Error {
  status: number;
  errorMessage: string;

  constructor(status: number, errorMessage: string) {
    super(errorMessage);
    this.name = 'ApiError';
    this.status = status;
    this.errorMessage = errorMessage;
  }
}

const wait = (duration = 220) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^[A-Za-z0-9]{8,24}$/;

const createToken = (prefix: 'mock-access-token' | 'mock-refresh-token', ttlMs: number) =>
  `${prefix}|${Date.now() + ttlMs}|${Math.random().toString(36).slice(2)}`;

const getTokenExpiry = (token: string, prefix: 'mock-access-token' | 'mock-refresh-token') => {
  if (!token.startsWith(`${prefix}|`)) {
    return null;
  }

  const [, expiresAt] = token.split('|');
  const expiry = Number(expiresAt);
  return Number.isFinite(expiry) ? expiry : null;
};

const isLegacyMockToken = (token: string, prefix: 'mock-access-token' | 'mock-refresh-token') =>
  token === prefix || token.startsWith(`${prefix}-`);

const isMockToken = (token: string | null, prefix: 'mock-access-token' | 'mock-refresh-token') => {
  if (!token) {
    return false;
  }

  if (isLegacyMockToken(token, prefix)) {
    return true;
  }

  const expiry = getTokenExpiry(token, prefix);
  return expiry !== null && expiry > Date.now();
};

const isExpiredMockToken = (token: string | null, prefix: 'mock-access-token' | 'mock-refresh-token') => {
  if (!token) {
    return false;
  }

  const expiry = getTokenExpiry(token, prefix);
  return expiry !== null && expiry <= Date.now();
};

const issueTokens = (): AuthTokenResponse => ({
  accessToken: createToken('mock-access-token', ACCESS_TOKEN_TTL_MS),
  refreshToken: createToken('mock-refresh-token', REFRESH_TOKEN_TTL_MS),
});

let mockTasks: MockTask[] = Array.from({ length: 72 }, (_, index) => {
  const sequence = index + 1;
  const status = sequence % 3 === 0 ? 'DONE' : 'TODO';

  return {
    id: `TASK-${String(sequence).padStart(3, '0')}`,
    title: status === 'DONE' ? `완료된 건강관리 업무 ${sequence}` : `진행할 건강관리 업무 ${sequence}`,
    memo:
      status === 'DONE'
        ? '고객 건강 루틴 데이터 확인과 결과 안내가 완료되었습니다.'
        : '비대면 진료, 건강 루틴, 커뮤니티 운영을 위한 확인 항목입니다.',
    status,
    registerDatetime: new Date(2026, 2, (sequence % 28) + 1, 9 + (sequence % 8), 15).toISOString(),
  };
});

const requireAuth = (accessToken: string | null) => {
  if (isExpiredMockToken(accessToken, 'mock-access-token')) {
    throw new ApiError(401, 'accessToken이 만료되었습니다.');
  }

  if (!isMockToken(accessToken, 'mock-access-token')) {
    throw new ApiError(401, '로그인이 필요한 요청입니다.');
  }
};

const buildDashboard = (): DashboardResponse => {
  const numOfDoneTask = mockTasks.filter((task) => task.status === 'DONE').length;

  return {
    numOfTask: mockTasks.length,
    numOfRestTask: mockTasks.length - numOfDoneTask,
    numOfDoneTask,
  };
};

export const api = {
  async signIn(payload: SignInRequest): Promise<AuthTokenResponse> {
    await wait();

    const normalizedEmail = payload.email.trim().toLowerCase();
    const isValidPayload = emailPattern.test(normalizedEmail) && passwordPattern.test(payload.password);

    if (!isValidPayload || normalizedEmail.startsWith('fail') || normalizedEmail.startsWith('error')) {
      throw new ApiError(400, '이메일 또는 비밀번호를 확인해주세요.');
    }

    return issueTokens();
  },

  async refreshToken(refreshToken: string | null): Promise<AuthTokenResponse> {
    await wait();

    if (isExpiredMockToken(refreshToken, 'mock-refresh-token')) {
      throw new ApiError(401, 'refreshToken이 만료되었습니다. 다시 로그인해주세요.');
    }

    if (!isMockToken(refreshToken, 'mock-refresh-token')) {
      throw new ApiError(401, '유효하지 않은 refreshToken입니다.');
    }

    return issueTokens();
  },

  async getDashboard(accessToken: string | null): Promise<DashboardResponse> {
    await wait();
    requireAuth(accessToken);
    return buildDashboard();
  },

  async getUser(accessToken: string | null): Promise<UserResponse> {
    await wait();
    requireAuth(accessToken);

    return {
      name: 'KB 헬스케어 지원자',
      memo: '데이터 기반 건강관리 대중화를 위한 프론트엔드 과제 화면입니다.',
    };
  },

  async getTasks(accessToken: string | null, page: number): Promise<TaskListResponse> {
    await wait();
    requireAuth(accessToken);

    const startIndex = (page - 1) * PAGE_SIZE;
    const data = mockTasks.slice(startIndex, startIndex + PAGE_SIZE);

    return {
      data,
      hasNext: startIndex + PAGE_SIZE < mockTasks.length,
    };
  },

  async getTaskDetail(accessToken: string | null, id: string): Promise<TaskDetailResponse> {
    await wait();
    requireAuth(accessToken);

    const task = mockTasks.find((item) => item.id === id);

    if (!task) {
      throw new ApiError(404, '요청한 할 일을 찾을 수 없습니다.');
    }

    return {
      title: task.title,
      memo: task.memo,
      registerDatetime: task.registerDatetime,
    };
  },

  async deleteTask(accessToken: string | null, id: string): Promise<DeleteTaskResponse> {
    await wait();
    requireAuth(accessToken);

    const taskExists = mockTasks.some((item) => item.id === id);

    if (!taskExists) {
      throw new ApiError(404, '삭제할 할 일을 찾을 수 없습니다.');
    }

    mockTasks = mockTasks.filter((item) => item.id !== id);

    return {
      success: true,
    };
  },
};
