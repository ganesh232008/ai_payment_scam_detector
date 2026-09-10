import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../services/firebase";

function Login() {
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        navigate("/dashboard");
      } else {
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);

      if (err.code === "auth/invalid-credential") {
        setError("Incorrect email or password.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (err.code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-32 px-6 pb-20">

      <div className="max-w-md mx-auto">

        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-3xl">
            🛡️
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mt-6">

          <h1 className="text-4xl font-bold">
            {isSignup ? "Create Account" : "Welcome Back"}
          </h1>

          <p className="mt-3 text-slate-400">
            {isSignup
              ? "Create your payment protection account"
              : "Sign in to your payment protection dashboard"}
          </p>

        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 p-8 rounded-2xl bg-slate-900 border border-slate-800"
        >

          {/* Email */}
          <div>

            <label className="block text-sm font-semibold mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 focus:border-blue-500 outline-none"
            />

          </div>

          {/* Password */}
          <div className="mt-5">

            <label className="block text-sm font-semibold mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 focus:border-blue-500 outline-none"
            />

          </div>

          {/* Error */}
          {error && (
            <div className="mt-5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition font-semibold"
          >
            {loading
              ? "Please wait..."
              : isSignup
              ? "Create Account"
              : "Login"}
          </button>

          {/* Signup/Login toggle */}
          <div className="text-center mt-6 text-sm text-slate-400">

            {isSignup
              ? "Already have an account?"
              : "Don't have an account?"}

            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
              }}
              className="ml-2 text-blue-400 hover:text-blue-300"
            >
              {isSignup ? "Login" : "Sign up"}
            </button>

          </div>

          {/* Demo */}
          <div className="text-center mt-5">

            <Link
              to="/"
              className="text-sm text-slate-500 hover:text-slate-300"
            >
              ← Back to Home
            </Link>

          </div>

        </form>

      </div>

    </main>
  );
}

export default Login;