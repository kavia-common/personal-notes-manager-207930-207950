import { render, screen } from '@testing-library/react';
import App from './App';

test('renders header title', () => {
  render(<App />);
  const heading = screen.getByText(/Notes/i);
  expect(heading).toBeInTheDocument();
});

test('renders new button', () => {
  render(<App />);
  const btn = screen.getByRole('button', { name: /new/i });
  expect(btn).toBeInTheDocument();
});
