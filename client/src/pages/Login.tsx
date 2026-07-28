// Placeholder — the real email-OTP register/login flow ships in Phase 2
// (see execution-spec §4 and §10). This exists so the "Sign in"/"Register
// Free" links throughout Phase 1 land somewhere real instead of a 404.
export default function Login() {
  return (
    <div className="max-w-md mx-auto px-6 py-20 text-center">
      <h1 className="font-display font-medium text-2xl text-fc-ink mb-3">Sign in / Register</h1>
      <p className="text-sm text-fc-ink-2">
        Buyer accounts and email-OTP sign-in are coming in the next phase of the build. Check back
        soon.
      </p>
    </div>
  );
}
