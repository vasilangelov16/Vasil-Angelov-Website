import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Mic2, Users, Lock, Shield, Check } from "lucide-react";
import { GrainOverlay } from "@/components/GrainOverlay";
import { ENV } from "@/lib/env";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "band-app-auth";
const LOCKOUT_KEY = "band-app-pin-lockout";
const FAIL_COUNT_KEY = "band-app-pin-fail-count";
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_ATTEMPTS = 5;
const LOCKOUT_BASE_SECONDS = 60;
const LOCKOUT_EXTENDED_SECONDS = 300; // 5 min after 10+ fails

export type BandRole = "singer" | "member";

export interface BandAuth {
  role: BandRole;
  timestamp: number;
}

const CONFIGURED_PINS = (() => {
  const singer = ENV.singerPin;
  const member = ENV.memberPin;
  return { singer, member } as const;
})();

export const getStoredAuth = (): BandAuth | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const auth = JSON.parse(raw) as BandAuth;
    if (!auth.role || !["singer", "member"].includes(auth.role)) return null;
    if (Date.now() - auth.timestamp > SESSION_MAX_AGE_MS) {
      clearStoredAuth();
      return null;
    }
    return auth;
  } catch {
    return null;
  }
};

export const setStoredAuth = (auth: BandAuth) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
};

export const clearStoredAuth = () => {
  sessionStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem("band-app-role");
};

const validatePin = (pin: string): BandRole | null => {
  if (pin === CONFIGURED_PINS.singer) return "singer";
  if (pin === CONFIGURED_PINS.member) return "member";
  return null;
};

const getLockoutUntil = (): number => {
  try {
    const raw = sessionStorage.getItem(LOCKOUT_KEY);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
};

const getFailCount = (): number => {
  try {
    const raw = sessionStorage.getItem(FAIL_COUNT_KEY);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
};

const setLockout = (failCount: number) => {
  const duration =
    failCount >= 10 ? LOCKOUT_EXTENDED_SECONDS : LOCKOUT_BASE_SECONDS;
  sessionStorage.setItem(LOCKOUT_KEY, String(Date.now() + duration * 1000));
};

const clearLockout = () => {
  sessionStorage.removeItem(LOCKOUT_KEY);
};

const incrementFailCount = (): number => {
  const count = getFailCount() + 1;
  sessionStorage.setItem(FAIL_COUNT_KEY, String(count));
  return count;
};

const clearFailCount = () => {
  sessionStorage.removeItem(FAIL_COUNT_KEY);
};

interface PinGateProps {
  onAuth: (auth: BandAuth) => void;
}

export const PinGate = ({ onAuth }: PinGateProps) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingAuth, setPendingAuth] = useState<BandAuth | null>(null);
  const [lockoutUntil, setLockoutUntil] = useState(0);

  const isLockedOut = lockoutUntil > Date.now();
  const lockoutRemaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));

  useEffect(() => {
    setLockoutUntil(getLockoutUntil());
    const interval = setInterval(() => {
      const until = getLockoutUntil();
      setLockoutUntil(until);
      if (until <= Date.now()) clearLockout();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!pendingAuth) return;
    const t = setTimeout(() => {
      onAuth(pendingAuth);
      setPendingAuth(null);
    }, 1800);
    return () => clearTimeout(t);
  }, [pendingAuth, onAuth]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      const trimmed = pin.trim();
      if (!trimmed) {
        setError("Enter your PIN");
        return;
      }
      if (isLockedOut) return;
      setIsSubmitting(true);
      const role = validatePin(trimmed);
      if (role) {
        clearLockout();
        clearFailCount();
        setPin("");
        const auth: BandAuth = { role, timestamp: Date.now() };
        setStoredAuth(auth);
        setPendingAuth(auth);
      } else {
        const next = incrementFailCount();
        setPin("");
        setIsSubmitting(false);
        setError("Invalid PIN");
        if (next >= MAX_ATTEMPTS) {
          setLockout(next);
          setLockoutUntil(getLockoutUntil());
          const duration =
            next >= 10 ? LOCKOUT_EXTENDED_SECONDS : LOCKOUT_BASE_SECONDS;
          setError(`Too many attempts. Try again in ${duration} seconds.`);
        }
      }
    },
    [pin, onAuth, isLockedOut]
  );

  return (
    <div className="relative h-[100dvh] min-h-[100dvh] bg-background flex flex-col overflow-hidden">
      <GrainOverlay />

      {/* Success overlay */}
      <AnimatePresence mode="wait">
        {pendingAuth && (
          <motion.div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.5,
              ease: [0.32, 0.72, 0, 1],
            }}
          >
            {/* Ambient glow */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 60% 50% at 50% 45%, hsl(350, 45%, 35%, 0.2) 0%, transparent 70%)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />

            <motion.div
              className="relative flex flex-col items-center gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Check + ripples container */}
              <div className="relative flex items-center justify-center h-32 w-32">
                {/* Ripple rings */}
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 m-auto rounded-full border-2 border-primary/25"
                    style={{ width: 80, height: 80 }}
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{
                      duration: 1.4,
                      delay: 0.15 + i * 0.25,
                      ease: [0.22, 0.61, 0.36, 1],
                    }}
                  />
                ))}

                {/* Check circle */}
              <motion.div
                className="relative flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 180,
                  damping: 18,
                  mass: 0.8,
                }}
              >
                <motion.div
                  className="rounded-full p-7"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(350, 45%, 35%, 0.25) 0%, hsl(345, 50%, 28%, 0.15) 100%)",
                    border: "2px solid hsl(350, 45%, 35%, 0.4)",
                    boxShadow:
                      "0 0 40px hsl(350, 45%, 35%, 0.2), inset 0 0 20px hsl(350, 45%, 35%, 0.05)",
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                      delay: 0.15,
                    }}
                  >
                    <Check
                      className="w-14 h-14 text-primary"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.div>
                </motion.div>
              </motion.div>
              </div>

              {/* Welcome text */}
              <motion.p
                className="font-serif text-2xl sm:text-3xl font-semibold text-foreground tracking-wide"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.35,
                  ease: [0.32, 0.72, 0, 1],
                }}
              >
                Welcome
              </motion.p>

              {/* Loading bar */}
              <motion.div
                className="h-0.5 w-24 rounded-full bg-primary/30 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: 1.2,
                    delay: 0.6,
                    ease: [0.32, 0.72, 0, 1],
                  }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Burgundy glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, hsl(350, 45%, 35%, 0.15) 0%, transparent 60%)",
        }}
      />

      {/* Full-screen content */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        {/* Top: Vasil Angelov + Band Setlist */}
        <div className="flex flex-col items-center justify-center flex-1 w-full max-w-5xl">
          <div className="flex flex-col items-center gap-0 sm:gap-1 mb-4 sm:mb-6">
            <div className="overflow-hidden">
              <motion.h1
                className="font-serif text-[12vw] sm:text-[10vw] md:text-[8vw] lg:text-[7vw] leading-[0.85] font-bold tracking-tighter text-white"
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                VASIL
              </motion.h1>
            </div>
            <div className="overflow-hidden">
              <motion.h1
                className="font-serif text-[12vw] sm:text-[10vw] md:text-[8vw] lg:text-[7vw] leading-[0.85] font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/95 to-white/60"
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                ANGELOV
              </motion.h1>
            </div>
          </div>

          <motion.div
            className="w-16 sm:w-20 md:w-24 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent mb-4 sm:mb-6"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.4 }}
          />

          <motion.h2
            className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-primary tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Band Setlist
          </motion.h2>
        </div>

        {/* Bottom: PIN form */}
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="glass rounded-2xl border border-white/10 p-6 sm:p-8 shadow-2xl shadow-black/20">
            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div
                key={error || "idle"}
                className="relative"
                animate={error ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }}
                transition={{ duration: 0.35 }}
              >
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                  strokeWidth={1.5}
                />
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  maxLength={12}
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, ""));
                    setError("");
                  }}
                  placeholder="••••"
                  disabled={isSubmitting || isLockedOut}
                  className={cn(
                    "w-full min-h-[52px] sm:h-14 pl-12 pr-4 rounded-xl bg-secondary/60 border border-border/80 text-foreground placeholder:text-muted-foreground/60",
                    "text-center text-lg tracking-[0.4em] font-mono touch-manipulation",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30",
                    "transition-all duration-200",
                    error && "border-destructive/50 focus:ring-destructive/30 focus:border-destructive/50"
                  )}
                  autoFocus
                  aria-label="Enter PIN"
                  aria-invalid={!!error}
                  aria-describedby={error ? "pin-error" : undefined}
                />
                <Shield
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </motion.div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.p
                    id="pin-error"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-destructive text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={isSubmitting || isLockedOut}
                className={cn(
                  "w-full min-h-[52px] sm:h-14 rounded-xl font-semibold tracking-[0.2em] uppercase text-sm touch-manipulation",
                  "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20",
                  "hover:shadow-[0_0_30px_hsl(350,45%,35%,0.35)] hover:brightness-105 transition-all duration-300",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:brightness-100"
                )}
                whileHover={!isSubmitting && !isLockedOut ? { scale: 1.02 } : undefined}
                whileTap={!isSubmitting && !isLockedOut ? { scale: 0.98 } : undefined}
              >
                {isLockedOut ? (
                  <span>Wait {lockoutRemaining}s</span>
                ) : (
                  "Enter"
                )}
              </motion.button>
            </form>

            <div className="mt-6 pt-5 border-t border-border/50 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-muted-foreground text-xs">
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-2">
                  <Mic2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Singer
                </span>
                <span className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Member
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-muted-foreground/70">
                <Shield className="w-3 h-3" strokeWidth={1.5} />
                Secured
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
