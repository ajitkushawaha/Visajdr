export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold mb-4">Redirecting...</h2>
        <p className="text-gray-600">Please wait while we redirect you to the new page.</p>
      </div>
    </div>
  )
}
