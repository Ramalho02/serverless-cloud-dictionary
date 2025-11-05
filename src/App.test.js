import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders Cloud Dictionary header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Cloud Dictionary/i);
  expect(headerElement).toBeInTheDocument();
});

test('displays loading when searching', () => {
  render(<App />);
  const input = screen.getByPlaceholderText(/Search any cloud term/i);
  const button = screen.getByText(/Search/i);

  fireEvent.change(input, { target: { value: 'server' } });
  fireEvent.click(button);

  const loading = screen.getByText(/Loading.../i);
  expect(loading).toBeInTheDocument();
});
