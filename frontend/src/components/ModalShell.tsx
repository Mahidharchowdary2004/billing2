import { ReactNode } from 'react';
import { IconX } from './icons';

export default function ModalShell({
  title,
  wide,
  onClose,
  headerExtra,
  noPrintHeader,
  footer,
  children,
}: {
  title: string;
  wide?: boolean;
  onClose: () => void;
  headerExtra?: ReactNode;
  noPrintHeader?: boolean;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={`modal ${wide ? 'wide' : ''}`}>
      <div className={`modal-head ${noPrintHeader ? 'no-print' : ''}`}>
        <h3>{title}</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          {headerExtra}
          <button className="modal-close" onClick={onClose}>
            <IconX />
          </button>
        </div>
      </div>
      {children}
      {footer && <div className="modal-foot">{footer}</div>}
    </div>
  );
}
