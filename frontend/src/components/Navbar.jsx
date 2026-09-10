import { useState } from 'react'
import { ShieldCheck, Menu, X, CreditCard, LayoutDashboard, BarChart3, LogIn, ScanLine } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path
  }

  const navLinks = [
    { name: 'How It Works', href: '/#how-it-works', isAnchor: true },
    { name: 'Features', href: '/#features', isAnchor: true },
    { name: 'Simulator', href: '/simulator', isAnchor: false, icon: CreditCard },
    { name: 'Safety Check', href: '/safety-check', isAnchor: false, icon: ScanLine },
    { name: 'Dashboard', href: '/dashboard', isAnchor: false, icon: LayoutDashboard },
    { name: 'Analyst', href: '/analyst', isAnchor: false, icon: BarChart3 },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">

        {/* Brand Logo */}
        <Link
          to="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center group-hover:border-blue-500/60 transition shadow-sm shadow-blue-500/10">
            <ShieldCheck className="w-6 h-6 text-blue-400 group-hover:scale-105 transition-transform" />
          </div>

          <div className="text-left">
            <span className="font-bold text-base sm:text-lg text-white tracking-tight block leading-tight">
              AI Payment Scam Detector
            </span>
            <span className="text-[11px] text-slate-400 font-medium block">
              Safe Payments. Smarter AI.
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          {navLinks.map((link) => {
            const active = !link.isAnchor && isActive(link.href)
            return link.isAnchor ? (
              <a
                key={link.name}
                href={link.href}
                className="text-slate-300 hover:text-white transition font-medium text-sm py-1"
              >
                {link.name}
              </a>
            ) : (
              <Link
                key={link.name}
                to={link.href}
                className={`transition font-medium text-sm py-1 flex items-center gap-1.5 ${
                  active
                    ? 'text-blue-400 font-semibold border-b-2 border-blue-500'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.name}
              </Link>
            )
          })}

          <Link
            to="/login"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-semibold text-white shadow-sm shadow-blue-600/20 flex items-center gap-1.5"
          >
            <LogIn className="w-4 h-4" />
            Login
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            to="/simulator"
            className="px-3 py-1.5 rounded-lg bg-blue-600 text-xs font-semibold text-white"
          >
            Demo
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-lg px-6 py-5 space-y-3 animate-in fade-in slide-in-from-top-3 duration-200">
          {navLinks.map((link) => {
            const active = !link.isAnchor && isActive(link.href)
            return link.isAnchor ? (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-300 hover:text-white py-2 font-medium"
              >
                {link.name}
              </a>
            ) : (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 font-medium flex items-center gap-2.5 ${
                  active ? 'text-blue-400 font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.icon && <link.icon className="w-4 h-4 text-blue-400" />}
                {link.name}
              </Link>
            )
          })}

          <div className="pt-3 border-t border-slate-800/80">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-semibold text-white flex items-center justify-center gap-2 text-sm"
            >
              <LogIn className="w-4 h-4" />
              Sign In / Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar