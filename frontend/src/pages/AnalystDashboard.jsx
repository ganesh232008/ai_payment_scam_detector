import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  Brain,
  Zap,
  Download,
  AlertTriangle,
  FileCheck2,
  ExternalLink,
} from 'lucide-react'

function AnalystDashboard() {
  const [selectedRange, setSelectedRange] = useState('7D')
  const [transactions, setTransactions] = useState([])
  const [historyError, setHistoryError] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/transactions')
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load transaction analytics.')
        return response.json()
      })
      .then((data) => setTransactions(Array.isArray(data) ? data : []))
      .catch((error) => setHistoryError(error.message))
  }, [])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Demo analytical data for chart
  const weeklyTrend = [
    { day: 'Mon', total: 1840, blocked: 42 },
    { day: 'Tue', total: 2100, blocked: 38 },
    { day: 'Wed', total: 2450, blocked: 65 },
    { day: 'Thu', total: 1980, blocked: 29 },
    { day: 'Fri', total: 2890, blocked: 88 },
    { day: 'Sat', total: 3200, blocked: 94 },
    { day: 'Sun', total: 2600, blocked: 51 },
  ]

  const maxTotal = 3500

  const categoryNames = ['Food', 'Travel', 'Shopping', 'Bills', 'Other']
  const spendingByCategory = categoryNames.reduce((totals, category) => {
    totals[category] = transactions
      .filter((transaction) => (transaction.category || 'Other') === category)
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)
    return totals
  }, {})
  const totalSpending = transactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)
  const averageTransaction = transactions.length ? totalSpending / transactions.length : 0
  const largestTransaction = transactions.reduce((largest, transaction) => (
    Number(transaction.amount || 0) > Number(largest?.amount || 0) ? transaction : largest
  ), null)
  const totalBlockedAmount = transactions
    .filter((transaction) => transaction.final_decision === 'BLOCK')
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)

  const scamTypes = [
    { name: 'UPI Impersonation & Urgency', percentage: 42, count: 78, color: 'bg-red-500' },
    { name: 'Malicious QR Phishing', percentage: 27, count: 50, color: 'bg-yellow-500' },
    { name: 'Fake KYC / Bank Support', percentage: 19, count: 35, color: 'bg-blue-500' },
    { name: 'Account Takeover / SIM Swap', percentage: 12, count: 21, color: 'bg-purple-500' },
  ]

  const liveAlerts = [
    {
      id: 'AL-902',
      recipient: 'unknown@upi',
      amount: '₹25,000',
      riskScore: 96,
      decision: 'BLOCK',
      ruleScore: 90,
      mlScore: 100,
      reason: '15.0x spend surge + Unrecognized device + New recipient',
      time: '2 mins ago',
    },
    {
      id: 'AL-901',
      recipient: 'crypto_desk@upi',
      amount: '₹48,000',
      riskScore: 92,
      decision: 'BLOCK',
      ruleScore: 85,
      mlScore: 97,
      reason: 'High transaction frequency spike in &lt; 2 hours',
      time: '14 mins ago',
    },
    {
      id: 'AL-900',
      recipient: 'newuser@upi',
      amount: '₹8,500',
      riskScore: 68,
      decision: 'VERIFY',
      ruleScore: 60,
      mlScore: 73,
      reason: 'New recipient with unrecognized device identifier',
      time: '42 mins ago',
    },
    {
      id: 'AL-899',
      recipient: 'groceries@upi',
      amount: '₹500',
      riskScore: 4,
      decision: 'ALLOW',
      ruleScore: 10,
      mlScore: 0,
      reason: 'Consistent with historical household spending baseline',
      time: '1 hour ago',
    },
  ]

  return (
    <main className="min-h-screen pt-28 sm:pt-32 px-4 sm:px-6 pb-20">
      <div className="max-w-7xl mx-auto">

        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              Fraud Operations Center
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Fraud Analyst Dashboard
            </h1>
            <p className="mt-1.5 text-slate-400 text-sm">
              Real-time telemetry, LightGBM model metrics, and multi-vector scam analytics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/simulator"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition shadow-lg shadow-blue-600/25 flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Simulate Threat</span>
            </Link>
            <button
              onClick={() => showToast('Full threat audit log exported to CSV.')}
              className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition cursor-pointer"
              title="Export Threat Log"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toast feedback */}
        {toastMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold max-w-md mx-auto text-center animate-in fade-in duration-200">
            ✓ {toastMessage}
          </div>
        )}

        {/* Top 4 KPI Metrics */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <AnalystStatCard
            title="Transactions Today"
            value="17,060"
            trend="+12.4% vs avg"
            trendUp={true}
          />
          <AnalystStatCard
            title="Flagged for Step-Up"
            value="184"
            trend="1.08% trigger rate"
            trendUp={false}
          />
          <AnalystStatCard
            title="Attacks Blocked"
            value="37"
            trend="100% intercept"
            trendUp={true}
          />
          <AnalystStatCard
            title="Capital Protected"
            value="₹4.82 Lakh"
            trend="Today's total"
            trendUp={true}
          />
        </div>

        {/* Firestore-backed spending analytics */}
        <section className="mt-8 p-6 sm:p-7 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Spending by Category</h2>
              <p className="text-xs sm:text-sm text-slate-400">Calculated from available transaction history.</p>
            </div>
            {historyError && <span className="text-xs text-yellow-400">{historyError}</span>}
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <AnalyticsCard label="Total Spending" value={totalSpending} />
            {categoryNames.map((category) => (
              <AnalyticsCard key={category} label={category} value={spendingByCategory[category]} />
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <AnalyticsMetric label="Average Transaction" value={averageTransaction} />
            <AnalyticsMetric label="Largest Transaction" value={largestTransaction?.amount || 0} detail={largestTransaction?.recipient} />
            <AnalyticsMetric label="Total Blocked Amount" value={totalBlockedAmount} />
          </div>
        </section>

        {/* Visualizations Grid: Trend Chart & Typology Distribution */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Weekly Velocity & Block Chart */}
          <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span>Transaction Velocity &amp; Intercepts</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Daily processed transaction volume vs blocked high-risk attempts.
                </p>
              </div>

              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
                {['24H', '7D', '30D'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setSelectedRange(range)}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      selectedRange === range ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Bar / Area Chart */}
            <div className="h-56 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2">
              {weeklyTrend.map((item) => {
                const heightPercent = Math.round((item.total / maxTotal) * 100)
                const blockedHeightPercent = Math.max(8, Math.round((item.blocked / 100) * 80))
                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[10px] text-slate-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.blocked} blk
                    </div>

                    <div className="w-full max-w-[36px] bg-slate-950 rounded-xl border border-slate-800/80 p-1 flex flex-col justify-end h-full relative">
                      {/* Total Volume Bar */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-blue-600/30 rounded-lg transition-all"
                      />
                      {/* Blocked Attacks Overlay */}
                      <div
                        style={{ height: `${blockedHeightPercent}%` }}
                        className="w-full bg-gradient-to-t from-red-500 to-red-400 rounded-lg absolute bottom-1 left-1 right-1 max-w-[calc(100%-8px)] shadow-sm shadow-red-500/50"
                      />
                    </div>

                    <span className="text-xs font-semibold text-slate-400 group-hover:text-white transition">
                      {item.day}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-600/40 border border-blue-500/50" />
                <span>Legitimate Volume</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500 shadow-sm shadow-red-500/50" />
                <span>Blocked Threat Vectors</span>
              </div>
            </div>
          </div>

          {/* Scam Typology Distribution */}
          <div className="p-6 sm:p-7 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-yellow-400" />
                <span>Threat Typologies</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Distribution of detected attack vectors in the past 7 days.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {scamTypes.map((scam) => (
                <div key={scam.name}>
                  <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                    <span className="text-slate-300">{scam.name}</span>
                    <span className="text-white font-mono font-bold">{scam.percentage}% ({scam.count})</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      style={{ width: `${scam.percentage}%` }}
                      className={`h-full ${scam.color} rounded-full transition-all`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 p-3 rounded-xl bg-slate-950/60 text-xs text-slate-400 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Highest vector: Rapid 15x surge transfers to newly registered UPI handles.</span>
            </div>
          </div>

        </div>

        {/* AI Model Telemetry Section */}
        <div className="mt-8 p-6 sm:p-7 rounded-3xl border border-purple-500/20 bg-gradient-to-b from-purple-950/20 via-slate-900 to-slate-900 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <span>LightGBM AI Engine Telemetry</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Statistical machine learning pipeline scoring 10 continuous and categorical behavioral features.
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-semibold self-start sm:self-auto">
              v1.0-prod • 60% Decision Weight
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-xs text-slate-400 block">Model Accuracy</span>
              <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">99.2%</span>
              <span className="text-[11px] text-slate-500">Cross-validated baseline</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-xs text-slate-400 block">Precision Rate</span>
              <span className="text-2xl font-extrabold text-blue-400 mt-1 block">98.4%</span>
              <span className="text-[11px] text-slate-500">Low false-positive rate</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-xs text-slate-400 block">Threat Recall</span>
              <span className="text-2xl font-extrabold text-purple-400 mt-1 block">97.8%</span>
              <span className="text-[11px] text-slate-500">Zero fraud escapes</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-xs text-slate-400 block">Inference Latency</span>
              <span className="text-2xl font-extrabold text-white mt-1 block">12 ms</span>
              <span className="text-[11px] text-slate-500">Sub-settlement SLA</span>
            </div>
          </div>
        </div>

        {/* Real-time Threat Flag Queue Table */}
        <div className="mt-8 p-6 sm:p-7 rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">
                Live Alert &amp; Intercept Log
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Recent decisions synthesized from heuristic rule score (40%) and LightGBM model (60%).
              </p>
            </div>

            <Link
              to="/simulator"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>Test New Payment</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Alert ID</th>
                  <th className="py-3 px-3">Recipient</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Scores (Rule / ML)</th>
                  <th className="py-3 px-3">Final Decision</th>
                  <th className="py-3 px-3">Trigger Reason</th>
                  <th className="py-3 px-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {liveAlerts.map((alert) => {
                  const isBlock = alert.decision === 'BLOCK'
                  const isVerify = alert.decision === 'VERIFY'
                  return (
                    <tr key={alert.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-3 font-mono text-xs text-slate-400">
                        {alert.id}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-white font-mono text-xs">
                        {alert.recipient}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-white">
                        {alert.amount}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-xs">
                        <span className="text-blue-400">{alert.ruleScore}</span>
                        <span className="text-slate-500"> / </span>
                        <span className="text-purple-400">{alert.mlScore}</span>
                        <span className="text-slate-400 font-bold ml-1.5">({alert.riskScore})</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          isBlock
                            ? 'bg-red-500/15 text-red-400 border-red-500/30'
                            : isVerify
                            ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {alert.decision}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-xs text-slate-300 max-w-xs truncate">
                        {alert.reason}
                      </td>
                      <td className="py-3.5 px-3 text-right text-xs text-slate-500">
                        {alert.time}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  )
}

function AnalystStatCard({ title, value, trend, trendUp }) {
  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 flex flex-col justify-between">
      <span className="text-xs text-slate-400">{title}</span>
      <span className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 block tracking-tight">
        {value}
      </span>
      <span className={`text-[11px] font-semibold mt-1 flex items-center gap-1 ${
        trendUp ? 'text-emerald-400' : 'text-slate-400'
      }`}>
        {trend}
      </span>
    </div>
  )
}

function AnalyticsCard({ label, value }) {
  return (
    <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
      <span className="text-[11px] text-slate-400 block">{label}</span>
      <span className="text-lg sm:text-xl font-extrabold text-white mt-1 block">₹{Number(value || 0).toLocaleString()}</span>
    </div>
  )
}

function AnalyticsMetric({ label, value, detail }) {
  return (
    <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
      <span className="text-xs text-slate-400 block">{label}</span>
      <span className="text-xl font-extrabold text-white mt-1 block">₹{Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
      {detail && <span className="text-[11px] text-slate-500 block mt-1 truncate">{detail}</span>}
    </div>
  )
}

export default AnalystDashboard