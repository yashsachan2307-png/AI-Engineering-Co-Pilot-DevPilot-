import { ReactNode } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {title && (
          <div className="card-header border-b border-gray-800 pb-4 mb-4">
            <h3 className="card-title">{title}</h3>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
