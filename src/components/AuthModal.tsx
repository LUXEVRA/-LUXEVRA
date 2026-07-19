/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { X, Eye, EyeOff, Check, AlertCircle, Mail, Lock, User, ArrowRight, ShieldAlert, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Logo from "./Logo";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (token: string, user: UserProfile) => void;
  initialMode?: "login" | "signup" | "forgot";
}

type AuthMode = "login" | "signup" | "forgot-email" | "forgot-otp" | "forgot-reset";

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = "login"
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(() => {
    if (initialMode === "forgot") return "forgot-email";
    return initialMode;
  });

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // OTP Verification States
  const [otp, setOtp] = useState("");
  const [resetTicket, setResetTicket] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);

  // Dev Sandbox Intercept States for frictionless testing
  const [receivedOtp, setReceivedOtp] = useState("");
  const [simulatedHtml, setSimulatedHtml] = useState("");

  // Statuses
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Real-time Validations
  const [emailValid, setEmailValid] = useState(false);
  const [passLength, setPassLength] = useState(false);
  const [passUpper, setPassUpper] = useState(false);
  const [passLower, setPassLower] = useState(false);
  const [passNumber, setPassNumber] = useState(false);
  const [passSpecial, setPassSpecial] = useState(false);

  // Resend Countdown Handler
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCountdown]);

  // Reset inputs when switching modes
  useEffect(() => {
    setError(null);
    setSuccess(null);
    setPassword("");
    setConfirmPassword("");
    setOtp("");
    // Keep email when transitioning through forgot steps
    if (mode === "login" || mode === "signup") {
      setReceivedOtp("");
      setSimulatedHtml("");
      setResetTicket("");
    }
  }, [mode]);

  // Handle email validation in real-time
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(emailRegex.test(email));
  }, [email]);

  // Handle password validation in real-time
  useEffect(() => {
    setPassLength(password.length >= 8);
    setPassUpper(/[A-Z]/.test(password));
    setPassLower(/[a-z]/.test(password));
    setPassNumber(/[0-9]/.test(password));
    setPassSpecial(/[!@#$%^&*(),.?":{}|<>]/.test(password));
  }, [password]);

  // Calculate Password Strength score (0 to 4)
  const getPasswordStrengthScore = () => {
    let score = 0;
    if (passLength) score++;
    if (passUpper && passLower) score++;
    if (passNumber) score++;
    if (passSpecial) score++;
    return score;
  };

  const strengthScore = getPasswordStrengthScore();

  const getStrengthLabel = () => {
    if (password.length === 0) return "Atelier Pin Strength";
    if (strengthScore <= 1) return "Weak (Unsecure)";
    if (strengthScore === 2) return "Fair";
    if (strengthScore === 3) return "Strong";
    return "Ultra Secure / Approved";
  };

  const getStrengthColor = () => {
    if (strengthScore <= 1) return "bg-rose-500/80";
    if (strengthScore === 2) return "bg-amber-500/80";
    if (strengthScore === 3) return "bg-gold-mid/80";
    return "bg-emerald-500/85";
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Contextual form validation
    if (mode === "signup") {
      if (!name.trim()) {
        setError("Please enter your registered full name.");
        return;
      }
      if (!emailValid) {
        setError("Please supply a valid registered email address.");
        return;
      }
      if (password.length < 8 || strengthScore < 3) {
        setError("Please fulfill premium security requirements before joining.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Password confirmation field must exactly match password.");
        return;
      }
      if (!agreeToTerms) {
        setError("You must agree to the Terms of Service & Privacy Policy.");
        return;
      }
    } else if (mode === "login") {
      if (!email) {
        setError("Please specify registered email.");
        return;
      }
      if (!password) {
        setError("Please specify security pin credentials.");
        return;
      }
    } else if (mode === "forgot-email") {
      if (!emailValid) {
        setError("A valid registered email address is required.");
        return;
      }
    } else if (mode === "forgot-otp") {
      if (otp.length !== 6) {
        setError("The verification code must be exactly 6 digits.");
        return;
      }
    } else if (mode === "forgot-reset") {
      if (password.length < 8 || strengthScore < 4) {
        setError("Your new password must satisfy all secure policy requirements.");
        return;
      }
      if (password !== confirmPassword) {
        setError("The passwords entered do not match. Please confirm selection.");
        return;
      }
    }

    setLoading(true);
    console.log(`[AUTH CLIENT] Triggering ${mode.toUpperCase()} request for dossier: ${email}`);

    try {
      if (mode === "login") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Login credentials were rejected.");
        }

        console.log("[AUTH CLIENT] Login write success:", data.message);
        setSuccess("ATELIER PRIVILEGES ACTIVATED.");
        
        setTimeout(() => {
          onAuthSuccess(data.token, data.user);
          setLoading(false);
          onClose();
        }, 1200);

      } else if (mode === "signup") {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, confirmPassword })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Registration process failed.");
        }

        console.log("[AUTH CLIENT] Signup database write success:", data.message);
        setSuccess("ATELIER PRIVILEGE LOCKER CREATED.");

        setTimeout(() => {
          onAuthSuccess(data.token, data.user);
          setLoading(false);
          onClose();
        }, 1200);

      } else if (mode === "forgot-email") {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Password reset initiation failed.");
        }

        console.log("[AUTH CLIENT] OTP generated on server. Dispatched to inbox.");
        setSuccess("SECURITY PIN TRANSMITTED TO REGISTERED DOSSIER.");
        
        // Save sandbox intercepts
        if (data.debugCode) {
          setReceivedOtp(data.debugCode);
        }
        if (data.debugEmailHtml) {
          setSimulatedHtml(data.debugEmailHtml);
        }

        setResendCountdown(60); // 60s countdown lock

        setTimeout(() => {
          setSuccess(null);
          setMode("forgot-otp");
          setLoading(false);
        }, 1000);

      } else if (mode === "forgot-otp") {
        const res = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Verification failed.");
        }

        console.log("[AUTH CLIENT] secure OTP verified. Reset Ticket issued:", data.resetTicket);
        setSuccess("CREDENTIALS OVERRIDE CONFIRMED.");
        setResetTicket(data.resetTicket);

        setTimeout(() => {
          setSuccess(null);
          setMode("forgot-reset");
          setLoading(false);
        }, 1000);

      } else if (mode === "forgot-reset") {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, resetTicket, password, confirmPassword })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Security password re-issuance failed.");
        }

        console.log("[AUTH CLIENT] Credentials override successful.");
        setSuccess("MASTER LOCK KEY UPDATE COMPLETED SUCCESSFULLY.");

        setTimeout(() => {
          setSuccess(null);
          setMode("login");
          setLoading(false);
        }, 1200);
      }
    } catch (err: any) {
      console.error(`[AUTH CLIENT] ${mode.toUpperCase()} request failure:`, err.message);
      setError(err.message || "A secure connection failure occurred.");
      setLoading(false);
    }
  };

  // Re-trigger OTP request
  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    setOtp("");

    try {
      console.log(`[AUTH CLIENT] Re-requesting secure OTP code for: ${email}`);
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to dispatch resend request.");
      }

      setSuccess("NEW VERIFICATION CODE TRANSMITTED TO REGISTERED DOSSIER.");
      if (data.debugCode) {
        setReceivedOtp(data.debugCode);
      }
      if (data.debugEmailHtml) {
        setSimulatedHtml(data.debugEmailHtml);
      }
      setResendCountdown(60);
    } catch (err: any) {
      setError(err.message || "Resend request failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" id="luxury-auth-modal">
        {/* Backdrop glass blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/95 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 180 }}
          className="relative w-full max-w-lg bg-[#0d0d0d] border border-zinc-900/80 shadow-2xl overflow-hidden px-6 py-8 md:px-10 md:py-12 flex flex-col justify-between"
        >
          {/* Subtle luxurious gold decorative background glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-mid/5 blur-3xl pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold-mid/5 blur-3xl pointer-events-none rounded-full" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full border border-transparent hover:border-zinc-800 text-zinc-500 hover:text-gold-mid bg-transparent hover:bg-zinc-950/60 transition-all cursor-pointer z-10"
            id="auth-modal-close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Core Content */}
          <div className="w-full">
            {/* Header Identity Section */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-block scale-90 mb-4"
              >
                <Logo variant="wordmark" className="mx-auto select-none" />
              </motion.div>
              <h2 className="font-serif text-lg tracking-[0.2em] text-luxury-cream uppercase">
                {mode === "login" && "Atelier Privilege Entry"}
                {mode === "signup" && "Privilege Account Creation"}
                {mode === "forgot-email" && "Credentials Recovery"}
                {mode === "forgot-otp" && "Security Verification"}
                {mode === "forgot-reset" && "Re-issue master key"}
              </h2>
              <p className="text-xs text-zinc-400 font-sans font-light mt-2 max-w-sm mx-auto tracking-wide">
                {mode === "login" && "Unlock elite white-glove logistics, custom tailoring blueprints, and private capsule drops."}
                {mode === "signup" && "Register your client dossier to receive signature items and members-only allocations."}
                {mode === "forgot-email" && "Provide your registered email address to receive a secure random 6-digit credentials override passcode."}
                {mode === "forgot-otp" && "A secure 6-digit credentials override passcode has been sent to your client dossier. Verify to override."}
                {mode === "forgot-reset" && "Credentials verified. Create a secure, master key that satisfies all policy standards."}
              </p>
            </div>

            {/* Error Message Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-rose-950/40 border border-rose-900/60 flex items-start gap-3 rounded-none"
              >
                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-300 font-sans font-medium tracking-wide">
                  {error}
                </div>
              </motion.div>
            )}

            {/* Success Animation & Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-emerald-950/40 border border-emerald-900/60 flex items-start gap-3 rounded-none"
              >
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                </div>
                <div className="text-xs text-emerald-300 font-sans tracking-wide uppercase font-semibold">
                  {success}
                </div>
              </motion.div>
            )}

            {/* Tabs (Hide when in Forgot mode or when logged in) */}
            {(mode === "login" || mode === "signup") && !success && (
              <div className="flex border-b border-zinc-900 mb-6 relative">
                <button
                  onClick={() => setMode("login")}
                  className={`flex-1 py-3 text-xs font-sans tracking-[0.2em] uppercase transition-all font-medium ${
                    mode === "login" ? "text-gold-mid" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setMode("signup")}
                  className={`flex-1 py-3 text-xs font-sans tracking-[0.2em] uppercase transition-all font-medium ${
                    mode === "signup" ? "text-gold-mid" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Create Account
                </button>
                {/* Underline Slide Effect */}
                <motion.div
                  animate={{ x: mode === "login" ? 0 : "100%" }}
                  className="absolute bottom-0 left-0 w-1/2 h-[1px] bg-gold-mid"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </div>
            )}

            {/* Main Forms */}
            {!success && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name field (Signup only) */}
                {mode === "signup" && (
                  <div>
                    <label className="text-[10px] font-sans tracking-[0.2em] text-zinc-500 uppercase block mb-1.5 font-medium">
                      CLIENT FULL NAME
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="E.G. ALEXANDER VANE"
                        className="w-full bg-zinc-950/60 border border-zinc-900/80 focus:border-gold-mid text-xs text-luxury-cream p-3.5 pl-11 focus:outline-none transition-all tracking-wider uppercase font-sans placeholder-zinc-700"
                        required
                        disabled={loading}
                      />
                      <User className="absolute left-4 top-3.5 w-4 h-4 text-zinc-600" />
                    </div>
                  </div>
                )}

                {/* Email Address */}
                {mode !== "forgot-otp" && mode !== "forgot-reset" && (
                  <div>
                    <label className="text-[10px] font-sans tracking-[0.2em] text-zinc-500 uppercase block mb-1.5 font-medium">
                      CLIENT DOSSIER EMAIL
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ENTER REGISTERED EMAIL"
                        className={`w-full bg-zinc-950/60 border focus:outline-none text-xs text-luxury-cream p-3.5 pl-11 transition-all tracking-wider uppercase font-sans placeholder-zinc-700 ${
                          email && !emailValid
                            ? "border-rose-950 focus:border-rose-500"
                            : email && emailValid
                            ? "border-emerald-950/80 focus:border-emerald-500/60"
                            : "border-zinc-900/80 focus:border-gold-mid"
                        }`}
                        required
                        disabled={loading}
                      />
                      <Mail className="absolute left-4 top-3.5 w-4 h-4 text-zinc-600" />
                      {email && (
                        <span className="absolute right-4 top-4 text-[9px] tracking-widest font-mono">
                          {emailValid ? (
                            <span className="text-emerald-400">FORMAT OK</span>
                          ) : (
                            <span className="text-rose-400">INVALID</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* OTP Mode Display of Sent Email Info */}
                {mode === "forgot-otp" && (
                  <div className="bg-zinc-950/80 border border-zinc-900 p-4 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[9px] font-sans tracking-[0.2em] text-zinc-500 block mb-0.5">DOSSIER ASSOCIATED</span>
                      <span className="text-gold-light tracking-wide font-mono select-all uppercase font-medium">{email}</span>
                    </div>
                    <span className="text-[8px] font-sans tracking-widest text-emerald-400 bg-emerald-950/30 border border-emerald-900/60 px-2 py-1 uppercase">DISPATCHED</span>
                  </div>
                )}

                {/* OTP Number Input Field (forgot-otp step) */}
                {mode === "forgot-otp" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-sans tracking-[0.2em] text-zinc-500 uppercase block mb-1.5 font-medium">
                        6-DIGIT VERIFICATION CODE
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                          placeholder="E.G. 123456"
                          className="w-full bg-zinc-950/60 border border-zinc-900/80 focus:border-gold-mid text-center text-lg tracking-[0.45em] font-mono text-gold-mid p-3.5 focus:outline-none transition-all placeholder-zinc-800"
                          required
                          disabled={loading}
                        />
                        <KeyRound className="absolute left-4 top-4 w-4 h-4 text-zinc-600" />
                      </div>
                    </div>

                    {/* Resend button with 60-second countdown */}
                    <div className="flex justify-between items-center text-[10px] font-sans tracking-widest pt-1">
                      <span className="text-zinc-600 uppercase">DIDN'T RECEIVE PIN?</span>
                      {resendCountdown > 0 ? (
                        <span className="text-zinc-500 uppercase font-light">RESEND IN {resendCountdown}S</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="text-gold-mid hover:text-white transition-colors uppercase font-medium cursor-pointer"
                        >
                          RESEND SECURE CODE
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Password Fields */}
                {(mode === "login" || mode === "signup" || mode === "forgot-reset") && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[10px] font-sans tracking-[0.2em] text-zinc-500 uppercase block font-medium">
                          {mode === "forgot-reset" ? "NEW SECURITY PASSWORD" : "ATELIER SECURITY PASSWORD"}
                        </label>
                        {mode === "login" && (
                          <button
                            type="button"
                            onClick={() => setMode("forgot-email")}
                            className="text-[10px] font-sans tracking-widest text-zinc-600 hover:text-gold-mid transition-colors uppercase cursor-pointer"
                          >
                            FORGOT CREDENTIALS?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={mode === "signup" || mode === "forgot-reset" ? "CREATE STRONG ATELIER KEY" : "••••••••"}
                          className="w-full bg-zinc-950/60 border border-zinc-900/80 focus:border-gold-mid text-xs text-luxury-cream p-3.5 pl-11 pr-12 focus:outline-none transition-all tracking-wider font-sans placeholder-zinc-700"
                          required
                          disabled={loading}
                        />
                        <Lock className="absolute left-4 top-3.5 w-4 h-4 text-zinc-600" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-3 text-zinc-500 hover:text-gold-mid transition-all p-1 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password (Signup and Reset only) */}
                    {(mode === "signup" || mode === "forgot-reset") && (
                      <div>
                        <label className="text-[10px] font-sans tracking-[0.2em] text-zinc-500 uppercase block mb-1.5 font-medium">
                          CONFIRM SECURITY PASSWORD
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="CONFIRM KEY SELECTION"
                            className="w-full bg-zinc-950/60 border border-zinc-900/80 focus:border-gold-mid text-xs text-luxury-cream p-3.5 pl-11 pr-12 focus:outline-none transition-all tracking-wider font-sans placeholder-zinc-700"
                            required
                            disabled={loading}
                          />
                          <Lock className="absolute left-4 top-3.5 w-4 h-4 text-zinc-600" />
                          {confirmPassword && (
                            <span className="absolute right-4 top-4 text-[9px] tracking-widest font-mono">
                              {password === confirmPassword ? (
                                <span className="text-emerald-400">MATCHED</span>
                              ) : (
                                <span className="text-rose-400 font-bold">MISMATCH</span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Password Strength Meter & Checklist (Signup & Reset step only) */}
                    {(mode === "signup" || mode === "forgot-reset") && password && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="p-4 bg-zinc-950 border border-zinc-900 space-y-3"
                      >
                        <div className="flex justify-between items-center text-[10px] font-sans tracking-widest">
                          <span className="text-zinc-500 font-medium uppercase">SECURITY QUALITY</span>
                          <span className="font-mono text-gold-mid uppercase font-semibold">
                            {getStrengthLabel()}
                          </span>
                        </div>

                        {/* Visual segmented bars */}
                        <div className="grid grid-cols-4 gap-1.5 h-1">
                          {[1, 2, 3, 4].map((index) => (
                            <div
                              key={index}
                              className={`h-full transition-all duration-500 ${
                                index <= strengthScore ? getStrengthColor() : "bg-zinc-900"
                              }`}
                            />
                          ))}
                        </div>

                        {/* List of requirements */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[9px] font-sans tracking-widest font-light text-zinc-400">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full transition-all ${passLength ? "bg-gold-mid" : "bg-zinc-800"}`} />
                            <span className={passLength ? "text-luxury-cream font-medium" : "text-zinc-600"}>8+ Characters</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full transition-all ${passUpper ? "bg-gold-mid" : "bg-zinc-800"}`} />
                            <span className={passUpper ? "text-luxury-cream font-medium" : "text-zinc-600"}>A-Z Upper Letter</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full transition-all ${passLower ? "bg-gold-mid" : "bg-zinc-800"}`} />
                            <span className={passLower ? "text-luxury-cream font-medium" : "text-zinc-600"}>a-z Lower Letter</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full transition-all ${passNumber ? "bg-gold-mid" : "bg-zinc-800"}`} />
                            <span className={passNumber ? "text-luxury-cream font-medium" : "text-zinc-600"}>0-9 Number Spec</span>
                          </div>
                          <div className="flex items-center gap-2 sm:col-span-2">
                            <span className={`w-1.5 h-1.5 rounded-full transition-all ${passSpecial ? "bg-gold-mid" : "bg-zinc-800"}`} />
                            <span className={passSpecial ? "text-luxury-cream font-medium" : "text-zinc-600"}>Special Char (@, $, #, etc)</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Remember Me / Terms of Service */}
                <div className="space-y-3 pt-1">
                  {mode === "login" && (
                    <div className="flex items-center justify-between text-[11px] font-sans tracking-widest text-zinc-500">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none font-light hover:text-zinc-300 transition-colors">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-3.5 h-3.5 bg-zinc-950 border border-zinc-800 text-gold-mid rounded-none focus:ring-0 focus:ring-offset-0 transition-colors cursor-pointer"
                        />
                        REMEMBER PORTAL ACCESS
                      </label>
                    </div>
                  )}

                  {mode === "signup" && (
                    <label className="flex items-start gap-3 cursor-pointer select-none text-[10px] font-sans tracking-widest text-zinc-500 hover:text-zinc-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                        className="w-3.5 h-3.5 bg-zinc-950 border border-zinc-800 text-gold-mid rounded-none focus:ring-0 focus:ring-offset-0 transition-colors cursor-pointer shrink-0 mt-0.5"
                        required
                      />
                      <span className="font-light leading-snug">
                        I SOLEMNLY ACCEPT THE ATELIER{" "}
                        <button type="button" className="text-gold-mid hover:underline font-semibold cursor-pointer">TERMS OF PRIVILEGE</button>{" "}
                        AND{" "}
                        <button type="button" className="text-gold-mid hover:underline font-semibold cursor-pointer">PRIVACY STANDARD</button>.
                      </span>
                    </label>
                  )}
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={loading || (mode === "signup" && !agreeToTerms) || (mode === "forgot-otp" && otp.length !== 6) || (mode === "forgot-reset" && (password.length < 8 || strengthScore < 4 || password !== confirmPassword))}
                  className="w-full bg-[#f5f2ec] hover:bg-[#eae6db] disabled:bg-zinc-900 disabled:text-zinc-700 text-luxury-black font-sans font-semibold text-xs tracking-[0.2em] py-4 transition-all uppercase flex items-center justify-center gap-2 relative group overflow-hidden cursor-pointer"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-luxury-black" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>TRANSMITTING Dossier...</span>
                    </div>
                  ) : (
                    <>
                      <span>
                        {mode === "login" && "ACCESS ATELIER PRIVILEGE"}
                        {mode === "signup" && "CREATE MEMBER PROFILE"}
                        {mode === "forgot-email" && "DISPATCH SECURE PIN"}
                        {mode === "forgot-otp" && "VERIFY CREDENTIALS CODE"}
                        {mode === "forgot-reset" && "CONFIRM master key UPDATE"}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                  {/* Subtle white sheen animation on hover */}
                  <div className="absolute inset-0 w-1/2 bg-white/10 skew-x-12 -translate-x-full group-hover:animate-shimmer pointer-events-none" />
                </button>
              </form>
            )}

            {/* Sandbox Intercept Email Telemetry Panel */}
            {!success && simulatedHtml && (mode === "forgot-otp" || mode === "forgot-reset") && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 border border-gold-mid/30 bg-black/95 overflow-hidden shadow-xl"
              >
                <div className="bg-zinc-950 px-4 py-2 flex justify-between items-center border-b border-zinc-900">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gold-mid animate-pulse" />
                    <span className="text-[9px] font-sans tracking-[0.2em] text-gold-mid font-bold uppercase">
                      LUXEVRA CONCIERGE TELEMETRY
                    </span>
                  </div>
                  <span className="text-[8px] font-mono text-zinc-500 uppercase bg-zinc-900 border border-zinc-800 px-1.5 py-0.5">
                    DEVELOPER MOCK INTERCEPT
                  </span>
                </div>
                
                <div className="bg-zinc-950 p-2 border-b border-zinc-900/50 text-[10px] text-zinc-400 font-sans tracking-wide">
                  <div className="mb-0.5"><span className="text-zinc-600">FROM:</span> concierge@luxevra.com</div>
                  <div><span className="text-zinc-600">TO:</span> {email}</div>
                </div>

                <div className="p-1 bg-[#0d0d0d] relative">
                  <iframe
                    title="Simulated Luxury Verification Email"
                    srcDoc={simulatedHtml}
                    className="w-full h-44 bg-transparent border-0 rounded-none custom-scrollbar"
                  />
                </div>

                <div className="px-4 py-2.5 bg-zinc-950 border-t border-zinc-900/80 flex justify-between items-center text-[10px] font-sans tracking-widest text-zinc-400">
                  <span className="text-[9px] text-zinc-500">SECURE DISPATCHED OTP:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-gold-mid bg-zinc-900 px-2.5 py-1 border border-zinc-800 font-bold text-sm select-all tracking-widest">
                      {receivedOtp}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setOtp(receivedOtp);
                        console.log("[TELEMETRY] OTP copied directly from simulation.");
                      }}
                      className="text-[9px] text-gold-mid hover:text-white bg-gold-mid/10 border border-gold-mid/20 hover:border-gold-mid px-2 py-1 transition-all uppercase cursor-pointer"
                    >
                      AUTOFILL PIN
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Switch Mode / Back Options */}
            {(mode === "forgot-email" || mode === "forgot-otp" || mode === "forgot-reset") && !success && (
              <button
                onClick={() => {
                  if (mode === "forgot-otp") setMode("forgot-email");
                  else if (mode === "forgot-reset") setMode("forgot-email");
                  else setMode("login");
                }}
                className="w-full mt-4 text-center text-xs font-sans tracking-widest text-zinc-500 hover:text-gold-mid transition-colors uppercase py-2 cursor-pointer"
              >
                RETURN TO PORTAL ENTRY
              </button>
            )}

            {/* Social logins */}
            {(mode === "login" || mode === "signup") && !success && (
              <div className="mt-8 space-y-4">
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-zinc-900"></div>
                  <span className="flex-shrink mx-4 text-[9px] font-sans tracking-[0.25em] text-zinc-600 uppercase font-light">OR SIGN IN VIA ATELIER CONCIERGE</span>
                  <div className="flex-grow border-t border-zinc-900"></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      console.log("[AUTH] Mock Google sign in initiated");
                      setError("Atelier Google Integration requires registered OAuth coordinates. Please register with email.");
                    }}
                    className="flex items-center justify-center gap-2.5 py-3 border border-zinc-900 hover:border-zinc-800 text-xs font-sans tracking-widest text-zinc-400 hover:text-luxury-cream hover:bg-zinc-950/60 transition-all uppercase cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    <span>GOOGLE</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      console.log("[AUTH] Mock Apple sign in initiated");
                      setError("Atelier Apple Integration requires registered OAuth coordinates. Please register with email.");
                    }}
                    className="flex items-center justify-center gap-2.5 py-3 border border-zinc-900 hover:border-zinc-800 text-xs font-sans tracking-widest text-zinc-400 hover:text-luxury-cream hover:bg-zinc-950/60 transition-all uppercase cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C3.79 16.32 3.43 9.49 8.2 9.03c1.23.12 2.1.72 2.73.72.64 0 1.76-.75 3.27-.6 1.57.15 2.76.74 3.41 1.69-3.24 1.95-2.73 6.17.5 7.42-.65 1.67-1.47 3.38-2.06 4.02zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.26 2.5-2.06 4.41-3.74 4.25z"/>
                    </svg>
                    <span>APPLE</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
