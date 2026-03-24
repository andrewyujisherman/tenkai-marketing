'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, AlertCircle, Info, X, RefreshCw } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  onRetry?: () => void
}

interface ToastContextValue {
  addToast: (type: ToastType, message: string, onRetry?: () => void) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

const typeConfig: Record<ToastType, { icon: typeof CheckCircle; bg: string; border: string; iconColor: string }> = {
  success: { icon: CheckCircle, bg: 'bg-success/5', border: 'border-success/20', iconColor: 'text-success' },
  error: { icon: AlertCircle, bg: 'bg-error/5', border: 'border-error/20', iconColor: 'text-error' },
  info: { icon: Info, bg: 'bg-torii/5', border: 'border-torii/20', iconColor: 'text-torii' },
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [exiting, setExiting] = useState(false)
  const config = typeConfig[toast.type]
  const Icon = config.icon

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true)
      setTimeout(() => onDismiss(toast.id), 300)
    }, 10000)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-tenkai border shadow-tenkai-md',
        config.bg, config.border,
        'transition-all duration-normal',
        exiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0 animate-fade-in'
      )}
    >
      <Icon className={cn('size-5 flex-shrink-0 mt-0.5', config.iconColor)} />
      <p className="text-sm text-charcoal flex-1">{toast.message}</p>
      {toast.type === 'error' && toast.onRetry && (
        <button
          onClick={toast.onRetry}
          className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium text-torii hover:text-torii-dark transition-colors duration-fast"
        >
          <RefreshCw className="size-3" />
          Retry
        </button>
      )}
      <button
        onClick={() => {
          setExiting(true)
          setTimeout(() => onDismiss(toast.id), 300)
        }}
        className="flex-shrink-0 p-0.5 rounded hover:bg-charcoal/5 transition-colors duration-fast"
      >
        <X className="size-3.5 text-warm-gray" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((type: ToastType, message: string, onRetry?: () => void) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setToasts((prev) => [...prev.slice(-4), { id, type, message, onRetry }].slice(-5))
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-96 max-w-[calc(100vw-2rem)]">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
