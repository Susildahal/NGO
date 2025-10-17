'use client'
import { Toaster as HotToaster } from 'react-hot-toast'
import toast from 'react-hot-toast'

export { toast }

export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#ffffff',
          color: '#374151',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          borderRadius: '0.5rem',
          padding: '0.75rem 1rem',
        },
        success: {
          style: {
            borderLeft: '4px solid #10B981',
          },
        },
        error: {
          style: {
            borderLeft: '4px solid #EF4444',
          },
        },
      }}
    />
  )
}
