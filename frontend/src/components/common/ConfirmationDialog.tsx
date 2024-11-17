import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
    <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-semibold">{title}</h2>
    <button
    onClick={onClose}
    className="text-gray-400 hover:text-gray-600"
    type="button"
    >
    <X className="w-5 h-5" />
    </button>
    </div>

    <div className="mb-6">
    <p className="text-gray-600">{description}</p>
    </div>

    <div className="flex justify-end gap-3">
    <Button
    variant="outline"
    onClick={onClose}
    type="button"
    >
    {cancelText}
    </Button>
    <Button
    onClick={() => {
      onConfirm();
      onClose();
    }}
    className={
      variant === 'destructive'
      ? 'bg-red-600 hover:bg-red-700 text-white'
  : undefined
    }
    type="button"
    >
    {confirmText}
    </Button>
    </div>
    </div>
    </div>
  );
};

export default ConfirmationDialog;
