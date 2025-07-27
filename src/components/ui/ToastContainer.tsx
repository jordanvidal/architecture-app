'use client'

import { useToast } from '@/contexts/ToastContext'
import Toast from './Toast'

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-16 sm:top-4 right-4 left-4 sm:left-auto z-50 pointer-events-none">
      <div className="space-y-2 pointer-events-auto max-w-sm mx-auto sm:mx-0">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </div>
  )
}