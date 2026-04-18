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

const SWIPE_MIN = 72;

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
  const touchRef = useRef(null);

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
      const durationMs = variant === "error" ? 5600 : 4200;
      setToasts((list) => [...list, { id, message, variant, durationMs }].slice(-5));
      const tid = setTimeout(() => dismiss(id), durationMs);
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

  function handleTouchStart(e, id) {
    if (!e.touches?.length) return;
    const p = e.touches[0];
    touchRef.current = { id, x: p.clientX, y: p.clientY };
  }

  function handleTouchEnd(e, id) {
    const start = touchRef.current;
    touchRef.current = null;
    if (!start || start.id !== id || !e.changedTouches?.length) return;
    const p = e.changedTouches[0];
    const dx = p.clientX - start.x;
    const dy = p.clientY - start.y;
    if (Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) > Math.abs(dy)) {
      dismiss(id);
    }
  }

  const value = useMemo(() => ({ showToast, dismiss }), [showToast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-wrap" aria-live="polite" aria-relevant="additions text">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`toast toast--${t.variant}`}
            onTouchStart={(e) => handleTouchStart(e, t.id)}
            onTouchEnd={(e) => handleTouchEnd(e, t.id)}
          >
            <div className="toast-row">
              <span className="toast-msg">{t.message}</span>
              <button
                type="button"
                className="toast-dismiss"
                onClick={() => dismiss(t.id)}
                aria-label="Close notification"
              >
                <svg className="toast-dismiss__icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <div className="toast-progress" aria-hidden>
              <span
                className="toast-progress__bar"
                style={{ animationDuration: `${t.durationMs}ms` }}
              />
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
