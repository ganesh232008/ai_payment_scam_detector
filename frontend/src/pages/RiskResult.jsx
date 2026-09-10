import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  ArrowLeft,
  CheckCircle2,
  Brain,
  Scale,
  ShieldX,
  FileSearch,
} from 'lucide-react'

function RiskResult() {
  const [statusMessage, setStatusMessage] = useState('')
  const locationState = useLocation().state

  // Direct access protection: if user navigated directly without transaction state
  if (!locationState || (locationState.final_risk_score === undefined && locationState.risk_score === undefined)) {
    return (
      <main className="min-h-screen pt-32 px-4 sm:px-6 pb-20">
        <div className="max-w-xl mx-auto text-center p-8 sm:p-10 rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-6">
            <FileSearch className="w-8 h-8" />
          </div>
          <p className="text-blue-400 font-semibold uppercase tracking-wider text-xs sm:text-sm">
            NO ANALYSIS FOUND
          </p>
          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">
            No Analysis Found
          </h1>
          <p className="mt-4 text-slate-400 text-sm leading-relaxed">
            Please run a transaction through the Live Payment Simulator to observe real-time AI risk evaluation and multi-engine scoring.
          </p>
          <Link
            to="/simulator"
            className="inline-flex items-center gap-2 mt-8 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition shadow-lg shadow-blue-600/25"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Simulator</span>
          </Link>
        </div>
      </main>
    )
  }

  const {
    amount,
    recipient,
    device,
    location,
    rule_score,
    ml_score,
    final_risk_score,
    final_risk_level = 'LOW',
    final_decision = 'ALLOW',
    reasons = [],
    behavioral_signals = {},
    ml_result = {},
  } = locationState

  // Visual decision and risk level theming: LOW (green), MEDIUM (yellow), HIGH (red)
  const isBlock = final_decision === 'BLOCK' || final_risk_level === 'HIGH'
  const isVerify = final_decision === 'VERIFY' || final_risk_level === 'MEDIUM'

  const themeClasses = isBlock
    ? {
        borderBg: 'border-red-500/30 bg-gradient-to-b from-red-500/10 via-slate-900 to-slate-900',
        scoreText: 'text-red-400',
        badge: 'bg-red-500/15 text-red-400 border border-red-500/40',
        icon: AlertOctagon,
        iconColor: 'text-red-400',
        banner: 'bg-red-500/10 border-red-500/30 text-red-300',
      }
    : isVerify
    ? {
        borderBg: 'border-yellow-500/30 bg-gradient-to-b from-yellow-500/10 via-slate-900 to-slate-900',
        scoreText: 'text-yellow-400',
        badge: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/40',
        icon: AlertTriangle,
        iconColor: 'text-yellow-400',
        banner: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
      }
    : {
        borderBg: 'border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 via-slate-900 to-slate-900',
        scoreText: 'text-emerald-400',
        badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40',
        icon: ShieldCheck,
        iconColor: 'text-emerald-400',
        banner: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
      }

  const StatusIcon = themeClasses.icon

  // Map all 9 behavioral signals to human-readable labels
  const behavioralSignalList = [
    {
      label: 'Unusual Amount',
      value: behavioral_signals.is_unusual_amount ? 'Yes' : 'No',
      isFlagged: Boolean(behavioral_signals.is_unusual_amount),
    },
    {
      label: 'Amount Multiplier',
      value:
        behavioral_signals.amount_multiplier !== undefined && behavioral_signals.amount_multiplier !== null
          ? `${behavioral_signals.amount_multiplier}x`
          : '1x',
      isFlagged: Number(behavioral_signals.amount_multiplier || 0) > 3,
    },
    {
      label: 'New Recipient',
      value: behavioral_signals.is_new_recipient ? 'Yes' : 'No',
      isFlagged: Boolean(behavioral_signals.is_new_recipient),
    },
    {
      label: 'New Device',
      value: behavioral_signals.is_new_device ? 'Yes' : 'No',
      isFlagged: Boolean(behavioral_signals.is_new_device),
    },
    {
      label: 'Unusual Location',
      value: behavioral_signals.is_unusual_location ? 'Yes' : 'No',
      isFlagged: Boolean(behavioral_signals.is_unusual_location),
    },
    {
      label: 'High Transaction Frequency',
      value: behavioral_signals.high_transaction_frequency ? 'Yes' : 'No',
      isFlagged: Boolean(behavioral_signals.high_transaction_frequency),
    },
    {
      label: 'Repeated Suspicious Behavior',
      value: behavioral_signals.repeated_suspicious_behavior ? 'Yes' : 'No',
      isFlagged: Boolean(behavioral_signals.repeated_suspicious_behavior),
    },
    {
      label: 'Historical Transactions',
      value: behavioral_signals.historical_transaction_count ?? 0,
      isFlagged: false,
    },
    {
      label: 'Historical Average Amount',
      value: `₹${Number(behavioral_signals.historical_average_amount || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      isFlagged: false,
    },
  ]

  return (
    <main className="min-h-screen pt-28 sm:pt-32 px-4 sm:px-6 pb-20">
      <div className="max-w-3xl mx-auto text-center">

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <StatusIcon className="w-3.5 h-3.5" />
          AI Analysis Complete
        </div>

        <h1 className="mt-2 text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Payment Risk Evaluation
        </h1>

        {/* Main Result Card */}
        <div className={`mt-8 p-6 sm:p-10 rounded-3xl border ${themeClasses.borderBg} shadow-2xl transition-all`}>

          <p className="text-slate-400 text-xs sm:text-sm uppercase tracking-wider font-semibold">
            Final Weighted Risk Score
          </p>

          <div className={`mt-2 text-6xl sm:text-7xl font-extrabold tracking-tight ${themeClasses.scoreText}`}>
            {final_risk_score}<span className="text-2xl sm:text-3xl text-slate-500 font-normal">/100</span>
          </div>

          <div className={`mt-4 inline-flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm sm:text-base ${themeClasses.badge}`}>
            <StatusIcon className="w-4 h-4" />
            <span>{final_risk_level} RISK • DECISION: {final_decision}</span>
          </div>

          {/* Multi-Engine Risk Breakdown */}
          <div className="mt-8 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-center justify-around gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <Scale className="w-4 h-4 text-blue-400" />
              <span className="text-slate-400">Rule Engine (40%):</span>
              <span className="text-sm font-bold text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                {rule_score}/100
              </span>
            </div>

            <div className="h-4 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-slate-400">LightGBM ML (60%):</span>
              <span className="text-sm font-bold text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                {ml_score !== null && ml_score !== undefined ? `${ml_score}/100` : 'N/A'}
              </span>
              {ml_result?.prediction_label && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  ml_result.prediction_label === 'SUSPICIOUS' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {ml_result.prediction_label}
                </span>
              )}
            </div>
          </div>

          {/* Transaction Details */}
          <div className="mt-8 text-left border-t border-slate-800/80 pt-6">
            <h2 className="font-semibold text-base sm:text-lg text-white">
              Transaction Details
            </h2>

            <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <span className="text-slate-400 text-xs block">Amount</span>
                <span className="text-white font-semibold text-base">
                  {typeof amount === 'number' ? `₹${amount.toLocaleString()}` : amount}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <span className="text-slate-400 text-xs block">Recipient</span>
                <span className="text-white font-mono text-sm break-all">
                  {recipient}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <span className="text-slate-400 text-xs block">Device</span>
                <span className="text-white font-medium text-sm">
                  {device}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <span className="text-slate-400 text-xs block">Location</span>
                <span className="text-white font-medium text-sm">
                  {location}
                </span>
              </div>
            </div>
          </div>

          {/* Explainable AI Reasons */}
          <div className="mt-8 text-left border-t border-slate-800/80 pt-6">
            <h2 className="font-semibold text-base sm:text-lg text-white">
              {reasons.length > 0 ? 'Explainable AI — Risk Factor Breakdown' : 'Risk Assessment Evaluation'}
            </h2>

            {reasons.length > 0 ? (
              <ul className="mt-3.5 space-y-2 text-sm text-slate-300">
                {reasons.map((reason, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3"
                  >
                    <span className="text-blue-400 font-bold mt-0.5">•</span>
                    <span className="leading-relaxed">{reason}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-3.5 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-emerald-400 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Transaction conforms strictly to normal established user spending baseline.</span>
              </div>
            )}
          </div>

          {/* Behavioral Signals Details (All 9 Signals) */}
          {behavioral_signals && Object.keys(behavioral_signals).length > 0 && (
            <div className="mt-8 text-left border-t border-slate-800/80 pt-6">
              <div className="flex items-center justify-between mb-3.5">
                <h2 className="font-semibold text-base sm:text-lg text-white">
                  Extracted Behavioral Signals
                </h2>
                <span className="text-[11px] text-slate-400">9 Feature Baselines</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {behavioralSignalList.map((signal, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex justify-between items-center"
                  >
                    <span className="text-slate-400">{signal.label}:</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                        signal.isFlagged
                          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          : 'text-slate-300'
                      }`}
                    >
                      {signal.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Machine Learning Model Result (LightGBM) */}
          {ml_result && ml_result.is_available !== false && (
            <div className="mt-8 text-left border-t border-slate-800/80 pt-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-base sm:text-lg text-white flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span>Machine Learning Inference</span>
                </h2>
                <span className="text-[11px] px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-purple-400 font-mono">
                  {ml_result.model_name || 'LightGBM Classifier v1.0'}
                </span>
              </div>

              <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <p className="text-xs text-slate-400">Fraud Probability</p>
                  <p
                    className={`mt-1 text-2xl font-extrabold ${
                      (ml_result.probability || 0) > 0.6
                        ? 'text-red-400'
                        : (ml_result.probability || 0) > 0.3
                        ? 'text-yellow-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {ml_result.probability !== null && ml_result.probability !== undefined
                      ? `${(ml_result.probability * 100).toFixed(2)}%`
                      : 'N/A'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <p className="text-xs text-slate-400">ML Risk Score</p>
                  <p
                    className={`mt-1 text-2xl font-extrabold ${
                      (ml_result.risk_score || 0) >= 70
                        ? 'text-red-400'
                        : (ml_result.risk_score || 0) >= 30
                        ? 'text-yellow-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {ml_result.risk_score !== null && ml_result.risk_score !== undefined
                      ? `${ml_result.risk_score}/100`
                      : 'N/A'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <p className="text-xs text-slate-400">Prediction</p>
                  <p
                    className={`mt-1 text-2xl font-extrabold ${
                      ml_result.prediction_label === 'SUSPICIOUS'
                        ? 'text-red-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {ml_result.prediction_label || 'LEGITIMATE'}
                  </p>
                </div>
              </div>

              {ml_result.details && (
                <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                  {ml_result.details}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-3.5">
          <button
            onClick={() => setStatusMessage('Payment Blocked: User transaction halted and flagged in fraud queue.')}
            className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 font-semibold text-white transition shadow-lg shadow-red-600/20 flex items-center gap-2 cursor-pointer"
          >
            <ShieldX className="w-4 h-4" />
            <span>Block Payment</span>
          </button>

          <button
            onClick={() => setStatusMessage('Verification Triggered: OTP and secondary MFA challenge issued to user.')}
            className="px-6 py-3 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 font-semibold text-slate-200 transition flex items-center gap-2 cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span>Verify Payment</span>
          </button>
        </div>

        {statusMessage && (
          <div className="mt-5 p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs sm:text-sm font-medium max-w-lg mx-auto">
            {statusMessage}
          </div>
        )}

        <div className="mt-8 flex justify-center gap-6 text-sm">
          <Link
            to="/simulator"
            className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Analyze Another Payment</span>
          </Link>
          <Link
            to="/analyst"
            className="text-slate-400 hover:text-white transition"
          >
            Open Analyst Portal →
          </Link>
        </div>

      </div>
    </main>
  )
}

export default RiskResult