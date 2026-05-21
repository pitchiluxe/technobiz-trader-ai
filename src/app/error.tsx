'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[TechnoBiz] Client error:', error)
  }, [error])

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#0F1117] flex-col gap-4 p-8">
      <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
        <span className="text-red-400 text-xl">!</span>
      </div>
      <div className="text-red-400 text-lg font-semibold">Application Error</div>
      <div className="text-[#787B86] text-sm text-center max-w-xl font-mono bg-[#1a1d27] border border-red-500/20 rounded p-4 break-all">
        {error.message || 'An unexpected error occurred'}
      </div>
      {error.digest && (
        <div className="text-[#4a4d5a] text-xs font-mono">digest: {error.digest}</div>
      )}
      <button
        onClick={reset}
        className="mt-2 px-6 py-2 bg-[#2962FF] text-white rounded text-sm hover:bg-[#1e4fd8] transition-colors"
      >
        Reload
      </button>
    </div>
  )
}
