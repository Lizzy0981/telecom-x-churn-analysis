// frontend/src/components/ErrorFallback.tsx
/**
 * Error Fallback Component
 * Displayed when an error boundary catches an error
 */

import { FallbackProps } from 'react-error-boundary'

export default function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <svg
            className="mx-auto h-24 w-24 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error Title */}
        <h1 className="text-4xl font-bold text-white mb-4">
          Oops! Something went wrong
        </h1>

        {/* Error Description */}
        <p className="text-xl text-gray-400 mb-8">
          We're sorry, but something unexpected happened. Please try again.
        </p>

        {/* Error Details (only in development) */}
        {import.meta.env.DEV && (
          <div className="mb-8 p-6 bg-gray-800 rounded-lg text-left overflow-auto max-h-64">
            <h2 className="text-lg font-semibold text-red-400 mb-2">
              Error Details:
            </h2>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap">
              {error.message}
            </pre>
            {error.stack && (
              <>
                <h3 className="text-md font-semibold text-red-400 mt-4 mb-2">
                  Stack Trace:
                </h3>
                <pre className="text-xs text-gray-400 whitespace-pre-wrap">
                  {error.stack}
                </pre>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={resetErrorBoundary}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>

        {/* Contact Support */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            If this problem persists, please{' '}
            <a
              href="mailto:support@telecomx.com"
              className="text-primary-400 hover:text-primary-300 underline"
            >
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
