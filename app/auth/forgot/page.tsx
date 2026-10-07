'use client'
import { useState, useEffect } from 'react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [countdown])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg('') // clear old messages
    setErrorMsg('')

    try {
      const res = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      let data = null

      if (res.headers.get('content-type')?.includes('application/json')) {
        data = await res.json()
      }

      if (!res.ok) {
        setErrorMsg(data?.error || 'Something went wrong')
      } else {
        const successMsg = data?.message || 'Reset link sent successfully!'
        const warningMsg = data?.warning ? ` ${data.warning}` : ''
        setMsg(successMsg + warningMsg)
        setCountdown(60) // Start 60s cooldown

        // Show warning separately if present
        if (data?.warning) {
          console.warn('Email delivery warning:', data.warning)
          // You could also show a toast here if you want
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-theme-light-green">
      <div className="w-full max-w-md p-8 bg-white rounded-sm border shadow-sm ">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Forgot Password 🔑
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            required
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
          />
          <button
            type="submit"
            disabled={loading || countdown > 0}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition disabled:bg-gray-400"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="w-5 h-5 mr-2 text-white animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                Sending...
              </span>
            ) : countdown > 0 ? (
              `Resend in ${countdown}s`
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>
        {msg && (
          <p className="mt-4 text-center text-sm font-medium text-lime-500">
            {msg}
          </p>
        )}
        {errorMsg && (
          <p className="mt-4 text-center text-sm font-medium text-red-500">
            {errorMsg}
          </p>
        )}
      </div>
    </div>
  )
}
