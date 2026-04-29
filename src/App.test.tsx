import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

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

  await userEvent.type(screen.getByLabelText('email'), 'applicant@example.com');
  await userEvent.type(screen.getByLabelText('비밀번호'), 'Password1');

  expect(submitButton).toBeEnabled();
});

test('signs in and switches the navigation entry to user profile', async () => {
  window.history.pushState({}, '', '/sign-in');
  render(<App />);

  await userEvent.type(screen.getByLabelText('email'), 'applicant@example.com');
  await userEvent.type(screen.getByLabelText('비밀번호'), 'Password1');
  await userEvent.click(screen.getByRole('button', { name: '제출' }));

  await waitFor(() => expect(screen.getAllByRole('link', { name: /회원정보/i }).length).toBeGreaterThan(0));
  expect(await screen.findByText('오늘의 업무 현황')).toBeInTheDocument();
});
