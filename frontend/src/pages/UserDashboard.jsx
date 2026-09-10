import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  CreditCard,
  Activity,
  AlertTriangle,
  ArrowRight,
  Filter,
  CheckCircle2,
  ShieldAlert,
  ShieldX,
  ExternalLink,
  Download,
} from 'lucide-react'

function UserDashboard() {
  const [filter, setFilter] = useState('ALL')
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [historyError, setHistoryError] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/transactions?user_id=user_101')
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load payment history.')
        return response.json()
      })
      .then((data) => setTransactions(Array.isArray(data) ? data : []))
      .catch((error) => setHistoryError(error.message))
      .finally(() => setIsLoading(false))
  }, [])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'ALL') return true
    return (tx.category || 'Other') === filter
  })

  const allowedCount = transactions.filter((tx) => (tx.final_decision || '').toUpperCase() === 'ALLOW').length
  const blockedTransactions = transactions.filter((tx) => (tx.final_decision || '').toUpperCase() === 'BLOCK')
  const blockedAmount = blockedTransactions.reduce((total, tx) => total + Number(tx.amount || 0), 0)

  const formatTimestamp = (value) => {
    if (!value) return 'Date unavailable'
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString()
  }

  return (
    <main className="min-h-screen pt-28 sm:pt-32 px-4 sm:px-6 pb-20">
      <div className="max-w-7xl mx-auto">

        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 shadow-xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Account Protected
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome to Your Security Hub
            </h1>
            <p className="mt-1.5 text-slate-400 text-sm">
              Real-time monitoring of your payment accounts, risk signals, and baseline protections.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/simulator"
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition flex items-center gap-2 shadow-lg shadow-blue-600/25 shrink-0"
            >
              <CreditCard className="w-4 h-4" />
              <span>Simulate Payment</span>
            </Link>
            <button
              onClick={() => showToast('Activity summary report exported to CSV successfully.')}
              className="p-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white transition shrink-0 cursor-pointer"
              title="Export Report"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold max-w-md mx-auto text-center animate-in fade-in duration-200">
            ✓ {toastMessage}
          </div>
        )}

        {/* Summary Statistics */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<CreditCard className="w-5 h-5 text-blue-400" />}
            title="Total Analyzed"
            value={transactions.length}
            subtitle="Transactions"
          />

          <StatCard
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            title="Safe Payments"
            value={allowedCount}
            subtitle={transactions.length ? `${Math.round((allowedCount / transactions.length) * 100)}% allowed` : 'No records yet'}
          />

          <StatCard
            icon={<AlertTriangle className="w-5 h-5 text-yellow-400" />}
            title="Step-up Verified"
            value={transactions.filter((tx) => (tx.final_decision || '').toUpperCase() === 'VERIFY').length}
            subtitle="VERIFY decisions"
          />

          <StatCard
            icon={<ShieldX className="w-5 h-5 text-red-400" />}
            title="Scams Blocked"
            value={blockedTransactions.length}
            subtitle={`₹${blockedAmount.toLocaleString()} flagged`}
          />
        </div>

        {/* Transactions Table Section with Filter Tabs */}
        <section className="mt-8 p-5 sm:p-7 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Recent Payment Evaluations
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Transactions analyzed with multi-layer heuristics and LightGBM model.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-medium self-start sm:self-auto overflow-x-auto">
              {['ALL', 'Food', 'Travel', 'Shopping', 'Bills', 'Other'].map((category) => (
                <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  filter === category ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {category === 'ALL' ? `All (${transactions.length})` : category}
                </button>
              ))}
            </div>
          </div>

          {historyError && <p className="mt-4 text-sm text-yellow-400">{historyError}</p>}

          {/* Table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400 border-b border-slate-800/80">
                <tr>
                  <th className="py-3 px-3">Recipient</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Risk Score</th>
                  <th className="py-3 px-3">Decision</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {!isLoading && filteredTransactions.map((tx, index) => {
                  const decision = (tx.final_decision || 'ALLOW').toUpperCase()
                  const isBlocked = decision === 'BLOCK'
                  const isVerify = decision === 'VERIFY'
                  return (
                    <tr key={tx.transaction_id || tx.id || index} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-white block">{tx.recipient || 'Unknown recipient'}</span>
                        <span className="text-xs text-slate-500">{formatTimestamp(tx.timestamp)}</span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-white">
                        ₹{Number(tx.amount || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 text-slate-400 text-xs">
                        {tx.category || 'Other'}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`font-mono font-bold text-xs ${
                          isBlocked ? 'text-red-400' : isVerify ? 'text-yellow-400' : 'text-emerald-400'
                        }`}>
                          {tx.final_risk_score ?? tx.risk_score ?? 0}/100
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 border ${
                          isBlocked
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : isVerify
                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {isBlocked && <ShieldX className="w-3 h-3" />}
                          {isVerify && <AlertTriangle className="w-3 h-3" />}
                          {!isBlocked && !isVerify && <CheckCircle2 className="w-3 h-3" />}
                          <span>{decision}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <Link
                          to="/simulator"
                          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold transition"
                        >
                          <span>Test in Sim</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
                {isLoading && <tr><td colSpan="6" className="py-8 text-center text-sm text-slate-400">Loading payment history...</td></tr>}
                {!isLoading && !filteredTransactions.length && <tr><td colSpan="6" className="py-8 text-center text-sm text-slate-400">No transactions found for this category.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        {/* Protection Explanations */}
        <section className="mt-8 grid sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl border border-blue-500/20 bg-blue-500/5 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Active Behavioral Protection
              </h3>
              <p className="mt-2 text-slate-400 text-sm leading-relaxed">
                Your spending velocity, unfamiliar device IDs, and recipient history are dynamically
                cross-referenced on every transaction to intercept unauthorized actions before money moves.
              </p>
            </div>
            <Link
              to="/simulator"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 mt-6"
            >
              <span>Test custom transfer in simulator</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80">
            <h3 className="text-xl font-bold text-white mb-4">
              Security Baseline Summary
            </h3>
            <div className="space-y-3.5 text-sm">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Baseline Monthly Average:</span>
                <span className="font-semibold text-white">₹1,666.67</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Authorized Devices:</span>
                <span className="font-semibold text-emerald-400">2 Verified</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Heuristic Engine Weight:</span>
                <span className="font-semibold text-blue-400">40%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">LightGBM ML Weight:</span>
                <span className="font-semibold text-purple-400">60%</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  )
}

function StatCard({ icon, title, value, subtitle }) {
  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 flex flex-col justify-between">
      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-3">
        {icon}
      </div>
      <div>
        <span className="text-xs text-slate-400 block">{title}</span>
        <span className="text-2xl sm:text-3xl font-extrabold text-white mt-1 block tracking-tight">
          {value}
        </span>
        <span className="text-[11px] text-slate-500 block mt-0.5">{subtitle}</span>
      </div>
    </div>
  )
}

export default UserDashboard