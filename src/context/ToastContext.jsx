import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const ToastContext = createContext(null);

let idSeq = 0;

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

/**
 * @param {string} message
 * @param {"info"|"success"|"error"} [variant]
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    const t = timers.current.get(id);
    if (t) {
      clearTimeout(t);
      timers.current.delete(id);
    }
    setToasts((list) => list.filter((x) => x.id !== id));
  }, []);

  const showToast = useCallback(
    (message, variant = "info") => {
      const id = ++idSeq;
      const ms = variant === "error" ? 5600 : 4200;
      setToasts((list) => [...list, { id, message, variant }].slice(-5));
      const tid = setTimeout(() => dismiss(id), ms);
      timers.current.set(id, tid);
    },
    [dismiss],
  );

  useEffect(
    () => () => {
      timers.current.forEach((t) => clearTimeout(t));
      timers.current.clear();
    },
    [],
  );

  const value = useMemo(() => ({ showToast, dismiss }), [showToast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-wrap" aria-live="polite" aria-relevant="additions text">
        {toasts.map((t) => (
          <div key={t.id} role="status" className={`toast toast--${t.variant}`}>
            <span className="toast-msg">{t.message}</span>
            <button
              type="button"
              className="toast-dismiss"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
