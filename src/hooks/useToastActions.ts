import { useToast } from '@/contexts/ToastContext'

export function useToastActions() {
  const { addToast } = useToast()

  return {
    showSuccess: (message: string) => addToast(message, 'success'),
    showError: (message: string) => addToast(message, 'error'),
    showWarning: (message: string) => addToast(message, 'warning'),
    showInfo: (message: string) => addToast(message, 'info'),
  }
}