export type TaskStatus = 'TODO' | 'DONE';

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ErrorResponse {
  errorMessage: string;
}

export interface UserResponse {
  name: string;
  memo: string;
}

export interface DashboardResponse {
  numOfTask: number;
  numOfRestTask: number;
  numOfDoneTask: number;
}

export interface TaskItem {
  id: string;
  title: string;
  memo: string;
  status: TaskStatus;
}

export interface TaskListResponse {
  data: TaskItem[];
  hasNext: boolean;
}

export interface TaskDetailResponse {
  title: string;
  memo: string;
  registerDatetime: string;
}

export interface DeleteTaskResponse {
  success: true;
}
