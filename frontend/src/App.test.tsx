import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login title and button', () => {
  render(<App />);
  const titleElement = screen.getByText('CoordeMe');
  expect(titleElement).toBeInTheDocument();
  const loginButton = screen.getByRole('button', { name: 'ログイン' });
  expect(loginButton).toBeInTheDocument();
});
