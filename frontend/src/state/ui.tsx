import React, { createContext, ReactNode, useCallback, useContext, useRef, useState } from 'react';

interface UiContextValue {
  modalContent: ReactNode | null;
  modalWide: boolean;
  openModal: (content: ReactNode, opts?: { wide?: boolean }) => void;
  closeModal: () => void;
  toastMsg: string | null;
  showToast: (msg: string) => void;
}

const UiContext = createContext<UiContextValue | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);
  const [modalWide, setModalWide] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openModal = useCallback((content: ReactNode, opts?: { wide?: boolean }) => {
    setModalContent(content);
    setModalWide(!!opts?.wide);
  }, []);

  const closeModal = useCallback(() => {
    setModalContent(null);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2200);
  }, []);

  return (
    <UiContext.Provider value={{ modalContent, modalWide, openModal, closeModal, toastMsg, showToast }}>
      {children}
    </UiContext.Provider>
  );
}

export function useUi(): UiContextValue {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error('useUi must be used within UiProvider');
  return ctx;
}
