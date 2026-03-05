import React from 'react'

// Simple loading screen shown while results are being generated
export function ResultsLoadingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-panel px-4">
      <div className="bg-white rounded-3xl shadow-soft px-10 py-8 flex flex-col items-center gap-4 max-w-md w-full text-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <h1 className="text-xl font-semibold text-gray-900">Generating your results</h1>
        <p className="text-sm text-muted">
          Sit tight while we analyze your interview performance and prepare your detailed report.
        </p>
      </div>
    </div>
  )
}

export default ResultsLoadingPage

