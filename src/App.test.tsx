import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { api } from './api/mockApi';
import App from './App';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from './auth/tokenStorage';

const credentials = {
  email: 'applicant@example.com',
  password: 'Password1',
};

const createSignedInSession = async (accessTokenOverride?: string) => {
  const tokens = await api.signIn(credentials);
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessTokenOverride ?? tokens.accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  return tokens;
};

const signInThroughUi = async () => {
  await userEvent.type(screen.getByLabelText('email'), credentials.email);
  await userEvent.type(screen.getByLabelText('비밀번호'), credentials.password);
  await userEvent.click(screen.getByRole('button', { name: '제출' }));
};

beforeEach(() => {
  window.localStorage.clear();
  window.history.pushState({}, '', '/');
});

test('renders the KB Healthcare shell and protected dashboard state', () => {
  render(<App />);

  expect(screen.getAllByText('KB Healthcare').length).toBeGreaterThan(0);
  expect(screen.getAllByRole('link', { name: /대시보드/i }).length).toBeGreaterThan(0);
  expect(screen.getAllByRole('link', { name: /할 일/i }).length).toBeGreaterThan(0);
  expect(screen.getAllByRole('link', { name: /로그인/i }).length).toBeGreaterThan(0);
  expect(screen.getByText('로그인이 필요한 화면입니다')).toBeInTheDocument();
});

test('enables the sign-in submit button only after valid input', async () => {
  window.history.pushState({}, '', '/sign-in');
  render(<App />);

  const submitButton = screen.getByRole('button', { name: '제출' });
  expect(submitButton).toBeDisabled();

  await userEvent.type(screen.getByLabelText('email'), credentials.email);
  await userEvent.type(screen.getByLabelText('비밀번호'), credentials.password);

  expect(submitButton).toBeEnabled();
});

test('accepts an OpenAPI-compatible alphanumeric password without mixed character requirements', async () => {
  window.history.pushState({}, '', '/sign-in');
  render(<App />);

  await userEvent.type(screen.getByLabelText('email'), credentials.email);
  await userEvent.type(screen.getByLabelText('비밀번호'), 'abcdefgh');

  expect(screen.getByRole('button', { name: '제출' })).toBeEnabled();
});

test('signs in and switches the navigation entry to user profile', async () => {
  window.history.pushState({}, '', '/sign-in');
  render(<App />);

  await signInThroughUi();

  await waitFor(() => expect(screen.getAllByRole('link', { name: /회원정보/i }).length).toBeGreaterThan(0));
  expect(await screen.findByText('numOfTask')).toBeInTheDocument();
});

test('shows the sign-in errorMessage modal on failed login', async () => {
  window.history.pushState({}, '', '/sign-in');
  render(<App />);

  await userEvent.type(screen.getByLabelText('email'), 'fail@example.com');
  await userEvent.type(screen.getByLabelText('비밀번호'), credentials.password);
  await userEvent.click(screen.getByRole('button', { name: '제출' }));

  const dialog = await screen.findByRole('dialog', { name: '로그인 실패' });
  expect(dialog).toHaveTextContent('이메일 또는 비밀번호를 확인해주세요.');
});

test('refreshes an expired access token and renders the dashboard', async () => {
  const tokens = await createSignedInSession('mock-access-token|0|expired');
  render(<App />);

  expect(await screen.findByText('numOfTask', {}, { timeout: 3000 })).toBeInTheDocument();
  await waitFor(
    () => expect(window.localStorage.getItem(ACCESS_TOKEN_KEY)).not.toBe('mock-access-token|0|expired'),
    { timeout: 3000 },
  );
  expect(window.localStorage.getItem(REFRESH_TOKEN_KEY)).not.toBe(tokens.refreshToken);
});

test('clears auth when refresh token is invalid', async () => {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, 'mock-access-token|0|expired');
  window.localStorage.setItem(REFRESH_TOKEN_KEY, 'invalid-refresh-token');
  render(<App />);

  expect(await screen.findByText('로그인이 필요한 화면입니다', {}, { timeout: 3000 })).toBeInTheDocument();
  expect(window.localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
  expect(window.localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
});

test('renders task list cards from the task API', async () => {
  await createSignedInSession();
  window.history.pushState({}, '', '/task');
  render(<App />);

  expect(await screen.findByText('할 일 목록')).toBeInTheDocument();
  expect(await screen.findByText('진행할 건강관리 업무 1')).toBeInTheDocument();
  expect(screen.getByRole('list', { name: '할 일 카드 목록' })).toBeInTheDocument();
});

test('renders the task 404 screen with a return button', async () => {
  await createSignedInSession();
  window.history.pushState({}, '', '/task/UNKNOWN');
  render(<App />);

  expect(await screen.findByText('리소스가 없습니다')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '목록으로 돌아가기' })).toBeInTheDocument();
});

test('requires the task id before enabling delete submission', async () => {
  await createSignedInSession();
  window.history.pushState({}, '', '/task/TASK-001');
  render(<App />);

  await screen.findByText('Task Detail');
  await userEvent.click(screen.getByRole('button', { name: '삭제' }));

  const dialog = screen.getByRole('dialog', { name: '삭제 확인' });
  const submitButton = within(dialog).getByRole('button', { name: '제출' });
  expect(submitButton).toBeDisabled();

  fireEvent.change(within(dialog).getByLabelText('삭제하려면 TASK-001를 입력해주세요.'), {
    target: { value: 'TASK-001' },
  });

  expect(within(dialog).getByRole('button', { name: '제출' })).toBeEnabled();
});

test('renders the user profile page', async () => {
  await createSignedInSession();
  window.history.pushState({}, '', '/user');
  render(<App />);

  expect(await screen.findByRole('heading', { name: '회원정보' })).toBeInTheDocument();
  expect(await screen.findByText('KB 헬스케어 지원자')).toBeInTheDocument();
});
