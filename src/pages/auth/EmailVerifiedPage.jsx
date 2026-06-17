// import { useEffect, useMemo, useState } from 'react'
// import { useNavigate } from 'react-router-dom'

// const SuccessIcon = () => (
//   <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       className="h-8 w-8 text-green-600"
//       aria-hidden="true"
//     >
//       <path d="M20 6 9 17l-5-5" />
//     </svg>
//   </div>
// )

// export default function EmailVerifiedPage() {
//   const navigate = useNavigate()
//   const countdownSeconds = 3

//   const [secondsLeft, setSecondsLeft] = useState(countdownSeconds)

//   useEffect(() => {
//     const t = setInterval(() => {
//       setSecondsLeft((s) => {
//         const next = s - 1
//         return next >= 0 ? next : 0
//       })
//     }, 1000)

//     return () => clearInterval(t)
//   }, [])

//   useEffect(() => {
//     if (secondsLeft <= 0) {
//       navigate('/login', { replace: true })
//     }
//   }, [secondsLeft, navigate])

//   const message = useMemo(() => 'Email Verified Successfully!', [])

//   return (
//     <div className="min-h-screen flex items-center justify-center px-6 bg-white">
//       <div className="w-full max-w-md text-center">
//         <SuccessIcon />
//         <h1 className="mt-6 text-2xl font-semibold text-gray-900">{message}</h1>

//         <p className="mt-3 text-sm text-gray-600">
//           Redirecting to login in <span className="font-semibold text-gray-900">{secondsLeft}</span>{' '}
//           second{secondsLeft === 1 ? '' : 's'}...
//         </p>

//         <button
//           className="mt-6 inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
//           onClick={() => navigate('/login', { replace: true })}
//           type="button"
//         >
//           Go to Login
//         </button>
//       </div>
//     </div>
//   )
// }

import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const SuccessIcon = () => (
  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className="h-8 w-8 text-green-600" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  </div>
)

const ErrorIcon = () => (
  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className="h-8 w-8 text-red-600" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  </div>
)

function inferTenantFromHostname(hostname) {
  const h = String(hostname || '').toLowerCase().trim()

  // learnexes.qzz.io => no tenant prefix
  // <tenant>.learnexes.qzz.io => tenant prefix
  const marker = '.learnexes.qzz.io'
  if (h.endsWith(marker)) return h.slice(0, -marker.length) || null

  // If running on custom base like: <tenant>.example.com (not the case now),
  // you can extend this later.
  return null
}

export default function EmailVerifiedPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const errorCode = searchParams.get('error')
  const isError = Boolean(errorCode)
  const countdownSeconds = isError ? 5 : 3

  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds)

  useEffect(() => {
    const t = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (isError) {
        navigate('/login?verification=failed', { replace: true })
        return
      }

      // After email verification, force tenant context so user lands on
      // <schoolName>.learnexes.qzz.io/dashboard (production-safe).
      const hostnameTenant = inferTenantFromHostname(window.location.hostname)
      const storedTenant = localStorage.getItem('tenant') || ''
      const tenant = hostnameTenant || storedTenant || ''

      if (tenant) localStorage.setItem('tenant', tenant)

      // Prefer tenant subdomain if we can infer it; otherwise fall back to login.
      if (tenant && tenant !== 'learnexes') {
        // Go to tenant dashboard on the correct subdomain
        const url = `https://${tenant}.learnexes.qzz.io/dashboard`
        window.location.href = url
        return
      }

      navigate('/login', { replace: true })
    }
  }, [secondsLeft, navigate, isError])

  const message = useMemo(() => {
    if (!isError) return 'Email verified successfully!'
    if (errorCode === 'INVALID_TOKEN') return 'This verification link is invalid or has expired.'
    return 'We could not verify your email.'
  }, [isError, errorCode])

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-white">
      <div className="w-full max-w-md text-center">
        {isError ? <ErrorIcon /> : <SuccessIcon />}
        <h1 className="mt-6 text-2xl font-semibold text-gray-900">{message}</h1>

        <p className="mt-3 text-sm text-gray-600">
          Redirecting to login in <span className="font-semibold text-gray-900">{secondsLeft}</span>{' '}
          second{secondsLeft === 1 ? '' : 's'}...
        </p>

        <button
          className="mt-6 inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          onClick={() => navigate('/login', { replace: true })}
          type="button"
        >
          Go to login
        </button>
      </div>
    </div>
  )
}