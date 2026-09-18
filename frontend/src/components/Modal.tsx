import { useUi } from '../state/ui';

export function ModalRoot() {
  const { modalContent, closeModal } = useUi();
  if (!modalContent) return null;
  return (
    <div
      className="overlay show"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      {modalContent}
    </div>
  );
}

export function ToastRoot() {
  const { toastMsg } = useUi();
  return <div className={`toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>;
}
