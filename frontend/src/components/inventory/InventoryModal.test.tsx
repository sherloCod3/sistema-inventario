import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AllTheProviders } from '../../test-utils/providers';
import InventoryModal from './InventoryModal';
import '@testing-library/jest-dom';

// Mock do useToast
const mockShowToast = jest.fn();
jest.mock('../../contexts/ToastContext', () => ({
  ...jest.requireActual('../../contexts/ToastContext'),
                                                useToast: () => ({
                                                  showToast: mockShowToast
                                                })
}));

const validData = {
  id: 'PAT001',
  type: 'Computador',
  sector: 'TI',
  brand: 'Dell',
  model: 'Optiplex',
  status: 'Ativo',
  condition: 'Bom'
};

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSubmit: jest.fn().mockResolvedValue(undefined),
};

const renderModal = async (props = {}) => {
  let result;
  await act(async () => {
    result = render(
      <InventoryModal {...defaultProps} {...props} />,
      { wrapper: AllTheProviders }
    );
  });
  return result;
};

describe('InventoryModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    await renderModal();
    expect(screen.getByText('Novo Item')).toBeInTheDocument();
  });

  it('closes when clicking close button', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    await renderModal({ onClose });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /fechar modal/i }));
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
    await renderModal({ onSubmit: mockOnSubmit });

    await act(async () => {
      await user.type(screen.getByLabelText(/patrimônio/i), validData.id);
      await user.selectOptions(screen.getByLabelText(/tipo/i), validData.type);
      await user.type(screen.getByLabelText(/setor/i), validData.sector);
      await user.type(screen.getByLabelText(/marca/i), validData.brand);
      await user.type(screen.getByLabelText(/modelo/i), validData.model);
      await user.selectOptions(screen.getByLabelText(/status/i), validData.status);
      await user.selectOptions(screen.getByLabelText(/condição/i), validData.condition);

      await user.click(screen.getByRole('button', { name: /criar item/i }));
    });

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        ...validData,
        sector: validData.sector.toUpperCase()
      }));
    });
  });

  it('shows validation errors for required fields', async () => {
    const user = userEvent.setup();
    await renderModal();

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /criar item/i }));
    });

    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    });
  });

  it('handles submission errors correctly', async () => {
    const user = userEvent.setup();
    const error = new Error('Erro ao salvar item');
    const mockOnSubmit = jest.fn().mockRejectedValue(error);
    await renderModal({ onSubmit: mockOnSubmit });

    await act(async () => {
      await user.type(screen.getByLabelText(/patrimônio/i), validData.id);
      await user.selectOptions(screen.getByLabelText(/tipo/i), validData.type);
      await user.type(screen.getByLabelText(/setor/i), validData.sector);
      await user.type(screen.getByLabelText(/marca/i), validData.brand);
      await user.type(screen.getByLabelText(/modelo/i), validData.model);
      await user.selectOptions(screen.getByLabelText(/status/i), validData.status);
      await user.selectOptions(screen.getByLabelText(/condição/i), validData.condition);

      await user.click(screen.getByRole('button', { name: /criar item/i }));
    });

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(error.message, 'error');
    });
  });
});
