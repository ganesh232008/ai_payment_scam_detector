import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  Zap,
  Brain,
  LockKeyhole,
  ArrowRight,
  ChevronRight,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  Activity,
} from 'lucide-react'

function LandingPage() {
  return (
    <main className="pt-20 min-h-screen text-slate-100">

      {/* HERO SECTION */}
      <section className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 py-12 relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-600/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center relative z-10">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs sm:text-sm font-medium shadow-sm">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            AI-Powered Real-Time Payment Protection
          </div>

          <h1 className="mt-8 text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight sm:leading-none">
            Detect Payment Scams
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-sky-400 bg-clip-text text-transparent">
              Before Money Moves
            </span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-slate-300 leading-relaxed font-normal">
            Our multi-layered AI pipeline combines historical baselines, behavioral anomaly detection,
            explainable heuristic rules, and LightGBM machine learning to prevent scams in real time.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/simulator"
              className="w-full sm:w-auto group flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-semibold text-white shadow-lg shadow-blue-600/25"
            >
              <span>Try Live Payment Simulator</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 transition font-semibold text-slate-200 text-center"
            >
              How It Works
            </a>
          </div>

          {/* Quick Stat Pill Highlights */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left max-w-3xl mx-auto">
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <span className="text-xs text-slate-400 block">Decision Latency</span>
              <span className="text-lg font-bold text-white">&lt; 15 ms</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <span className="text-xs text-slate-400 block">ML Precision</span>
              <span className="text-lg font-bold text-emerald-400">99.2%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <span className="text-xs text-slate-400 block">Risk Logic</span>
              <span className="text-lg font-bold text-blue-400">Rule + ML</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <span className="text-xs text-slate-400 block">Outcomes</span>
              <span className="text-lg font-bold text-purple-400">Allow / Verify / Block</span>
            </div>
          </div>

        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-4 sm:px-6 bg-slate-900/30 border-y border-slate-800/60">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-14">
            <p className="text-blue-400 font-semibold tracking-wider uppercase text-xs sm:text-sm">
              WHY USE OUR SYSTEM?
            </p>

            <h2 className="mt-3 text-3xl md:text-4xl font-bold">
              Multi-Layered AI Risk Defense
            </h2>

            <p className="mt-4 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
              Instead of looking at isolated transaction amounts, our system evaluates the full
              behavioral context, device fingerprints, and LightGBM statistical inference.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-blue-400" />}
              title="Real-Time Detection"
              description="Evaluates payments in milliseconds via automated endpoints before settlement completes."
            />

            <FeatureCard
              icon={<Brain className="w-6 h-6 text-purple-400" />}
              title="Behavior-Based AI"
              description="Compares incoming transfers against established spending velocities, device IDs, and recipient history."
            />

            <FeatureCard
              icon={<LockKeyhole className="w-6 h-6 text-emerald-400" />}
              title="Explainable AI"
              description="Every flagged transfer returns transparent reasonings so users and analysts know exactly why risk was scored."
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-14">
            <p className="text-blue-400 font-semibold tracking-wider uppercase text-xs sm:text-sm">
              EVALUATION PIPELINE
            </p>

            <h2 className="mt-3 text-3xl md:text-4xl font-bold">
              From Payment Initiation to Automated Decision
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            <Step
              number="01"
              title="Transaction Initiation"
              text="User inputs payment details (amount, recipient, device, and location)."
            />

            <Step
              number="02"
              title="Behavioral Signals"
              text="Backend evaluates historical baselines, unusual amounts, and velocity anomalies."
            />

            <Step
              number="03"
              title="Hybrid Scoring"
              text="Rule engine (40% weight) + LightGBM statistical ML model (60% weight)."
            />

            <Step
              number="04"
              title="Automated Action"
              text="Decision engine synthesizes final score into ALLOW, VERIFY, or BLOCK."
            />
          </div>

        </div>
      </section>

      {/* SCENARIOS */}
      <section id="scenarios" className="py-20 px-4 sm:px-6 bg-slate-900/30 border-y border-slate-800/60">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-14">
            <p className="text-blue-400 font-semibold tracking-wider uppercase text-xs sm:text-sm">
              SCAM SCENARIOS
            </p>

            <h2 className="mt-3 text-3xl md:text-4xl font-bold">
              Defending Against Modern Payment Threats
            </h2>
            <p className="mt-3 text-slate-400 text-sm max-w-xl mx-auto">
              Simulate real-world fraud vectors in our simulator to witness live AI threat neutralization.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            <ScenarioCard
              icon={<AlertOctagon className="w-5 h-5 text-red-400" />}
              badge="High Risk"
              badgeColor="text-red-400 bg-red-500/10 border-red-500/30"
              title="Fake KYC & Urgent Request"
              text="Manipulative phishing asking for high-value urgent transfers to unfamiliar recipient accounts."
            />

            <ScenarioCard
              icon={<AlertTriangle className="w-5 h-5 text-yellow-400" />}
              badge="Medium Risk"
              badgeColor="text-yellow-400 bg-yellow-500/10 border-yellow-500/30"
              title="Unfamiliar Device / QR Scam"
              text="Payment initiated from an unrecognized device or spoofed merchant QR code requiring multi-factor verification."
            />

            <ScenarioCard
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              badge="Low Risk"
              badgeColor="text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
              title="Legitimate Routine Payment"
              text="Everyday household utility or grocery payments adhering strictly to past baseline frequency and spend levels."
            />
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/simulator"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300"
            >
              <span>Test all three scenarios in the Live Simulator</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto rounded-3xl border border-blue-500/25 bg-gradient-to-b from-blue-950/40 to-slate-950 p-8 sm:p-12 text-center shadow-xl shadow-blue-950/20">
          <ShieldCheck className="w-14 h-14 mx-auto text-blue-400 mb-4" />

          <h2 className="text-2xl sm:text-4xl font-bold">
            Experience Real-Time AI Payment Protection
          </h2>

          <p className="mt-4 text-slate-300 max-w-xl mx-auto text-sm sm:text-base">
            Test custom transactions or try one-click scenario presets to observe how our multi-layered
            pipeline calculates risk and explains decisions.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/simulator"
              className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-semibold text-white shadow-lg shadow-blue-600/30"
            >
              Open Live Simulator
            </Link>

            <Link
              to="/analyst"
              className="px-8 py-3.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 transition font-semibold text-slate-200"
            >
              View Analyst Portal
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 py-8 px-6 text-center text-xs sm:text-sm text-slate-500 flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto gap-4">
        <div>
          © 2026 AI Payment Scam Detector. Safe Payments. Smarter AI.
        </div>
        <div className="flex items-center gap-6 text-slate-400">
          <Link to="/simulator" className="hover:text-white transition">Simulator</Link>
          <Link to="/dashboard" className="hover:text-white transition">User Dashboard</Link>
          <Link to="/analyst" className="hover:text-white transition">Analyst Portal</Link>
          <Link to="/login" className="hover:text-white transition">Login</Link>
        </div>
      </footer>

    </main>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-6 sm:p-7 rounded-2xl border border-slate-800 bg-slate-950/80 hover:border-blue-500/40 transition flex flex-col">
      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-5">
        {icon}
      </div>

      <h3 className="text-lg sm:text-xl font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2.5 text-slate-400 leading-relaxed text-sm">
        {description}
      </p>
    </div>
  )
}

function Step({ number, title, text }) {
  return (
    <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/80 relative">
      <span className="text-blue-500 font-extrabold text-sm tracking-wider uppercase">
        {number}
      </span>

      <h3 className="mt-3 text-lg font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 text-slate-400 text-sm leading-relaxed">
        {text}
      </p>
    </div>
  )
}

function ScenarioCard({ icon, badge, badgeColor, title, text }) {
  return (
    <div className="p-6 sm:p-7 rounded-2xl border border-slate-800 bg-slate-950/80 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            {icon}
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${badgeColor}`}>
            {badge}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-white">
          {title}
        </h3>

        <p className="mt-2.5 text-slate-400 text-sm leading-relaxed">
          {text}
        </p>
      </div>
    </div>
  )
}

export default LandingPage