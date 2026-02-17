// frontend/src/components/LoadingSpinner.tsx
/**
 * Loading Spinner Component
 * Displayed during Suspense fallback
 */

interface LoadingSpinnerProps {
  fullScreen?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  message?: string
}

export default function LoadingSpinner({ 
  fullScreen = false, 
  size = 'lg',
  message = 'Loading...'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-2',
    lg: 'h-16 w-16 border-3',
    xl: 'h-24 w-24 border-4'
  }

  const containerClasses = fullScreen
    ? 'min-h-screen flex flex-col items-center justify-center bg-gray-900'
    : 'flex flex-col items-center justify-center p-8'

  return (
    <div className={containerClasses}>
      {/* Spinner */}
      <div
        className={`
          ${sizeClasses[size]}
          border-gray-700 border-t-primary-500
          rounded-full animate-spin
        `}
        role="status"
        aria-label="Loading"
      />

      {/* Loading Text */}
      {message && (
        <p className="mt-4 text-gray-400 text-lg animate-pulse">
          {message}
        </p>
      )}

      {/* Loading Dots Animation */}
      {fullScreen && (
        <div className="mt-2 flex gap-1">
          <span className="h-2 w-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="h-2 w-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="h-2 w-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      )}
    </div>
  )
}
