import React, { act } from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { AllTheProviders } from './test-utils/providers';

describe('App', () => {
  it('renders the inventory system title', async () => {
    await act(async () => {
      render(<App />, { wrapper: AllTheProviders });
    });
    expect(screen.getByText(/sistema de inventário/i)).toBeInTheDocument();
  });
});
