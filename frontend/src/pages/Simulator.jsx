import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertOctagon, CheckCircle2, ShieldAlert, Sparkles, Send, ArrowLeft } from 'lucide-react'

function Simulator() {
  const navigate = useNavigate()
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [device, setDevice] = useState('My Phone')
  const [location, setLocation] = useState('Chennai')
  const [category, setCategory] = useState('')
  const [userId, setUserId] = useState('user_101')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Quick Scenario Presets for hackathon demonstration
  const loadScenario = (presetAmount, presetRecipient, presetDevice, presetLocation, presetUserId = 'user_101') => {
    setAmount(presetAmount)
    setRecipient(presetRecipient)
    setDevice(presetDevice)
    setLocation(presetLocation)
    setCategory('')
    setUserId(presetUserId)
    setErrorMessage('')
  }

  const analyzePayment = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Please enter a valid payment amount greater than 0.')
      return
    }

    if (!recipient.trim()) {
      setErrorMessage('Please enter a recipient name or UPI ID.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('http://127.0.0.1:8000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parsedAmount,
          recipient: recipient.trim(),
          device,
          location: location.trim() || 'Chennai',
          user_id: userId,
          ...(category ? { category } : {}),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(
          errorData?.detail || `Server returned status ${response.status}: ${response.statusText}`
        )
      }

      const result = await response.json()
      navigate('/risk-result', { state: result })
    } catch (err) {
      console.error('Error analyzing payment:', err)
      const isNetworkError =
        err.name === 'TypeError' ||
        err.message?.includes('fetch') ||
        err.message?.includes('Network')
      setErrorMessage(
        isNetworkError
          ? 'Unable to connect to the AI risk analysis server. Please make sure the backend is running on http://127.0.0.1:8000.'
          : (err.message || 'Unable to connect to the AI risk analysis server. Please make sure the backend is running.')
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen pt-28 sm:pt-32 px-4 sm:px-6 pb-20">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Risk Engine
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Live Payment Simulator
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Input transaction parameters or choose a quick preset to trigger real-time LightGBM
            inference and behavioral rule heuristics.
          </p>
        </div>

        {/* Quick Scenario Preset Buttons */}
        <div className="mb-6 p-4 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
          <span className="text-xs font-semibold text-slate-400 block mb-2.5">
            ⚡ Quick Hackathon Presets:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => loadScenario('25000', 'unknown@upi', 'New Device', 'Mumbai')}
              disabled={isLoading}
              className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2 transition text-left"
            >
              <AlertOctagon className="w-4 h-4 shrink-0" />
              <div>
                <span className="block font-bold">High Risk Anomaly</span>
                <span className="text-[10px] text-red-300/80">₹25,000 • New Device • Mumbai</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => loadScenario('500', 'groceries@upi', 'My Phone', 'Chennai')}
              disabled={isLoading}
              className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 transition text-left"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <div>
                <span className="block font-bold">Normal Safe Payment</span>
                <span className="text-[10px] text-emerald-300/80">₹500 • My Phone • Chennai</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => loadScenario('20000', 'new_contact@upi', 'New Device', 'Mumbai', 'user_102')}
              disabled={isLoading}
              className="px-3 py-2 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-semibold flex items-center gap-2 transition text-left cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <div>
                <span className="block font-bold">Medium Risk (Verify)</span>
                <span className="text-[10px] text-yellow-300/80">₹20,000 • New Device • Mumbai</span>
              </div>
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-medium text-left flex items-start gap-2.5">
            <span className="text-base">⚠️</span>
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Main Payment Form */}
        <form
          onSubmit={analyzePayment}
          className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900 shadow-xl"
        >
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300">
                Payment Amount (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 25000"
                required
                min="1"
                step="any"
                disabled={isLoading}
                className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">
                Recipient UPI ID or Account
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. merchant@upi or unknown@upi"
                required
                disabled={isLoading}
                className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">
                  Initiating Device
                </label>
                <select
                  value={device}
                  onChange={(e) => setDevice(e.target.value)}
                  disabled={isLoading}
                  className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 transition"
                >
                  <option>My Phone</option>
                  <option>New Device</option>
                  <option>Unknown Device</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">
                  Location (City)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Chennai or Mumbai"
                  disabled={isLoading}
                  className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">
                  Category (Optional)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isLoading}
                  className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 transition"
                >
                  <option value="">Not selected</option>
                  <option>Food</option>
                  <option>Travel</option>
                  <option>Shopping</option>
                  <option>Bills</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-8 w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-white transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 cursor-pointer"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                <span>Analyzing Risk via FastAPI &amp; LightGBM...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Analyze Payment Risk</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

      </div>
    </main>
  )
}

export default Simulator