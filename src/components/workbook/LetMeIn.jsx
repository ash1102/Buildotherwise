import React, { useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

/** Acknowledgment of the welcome/privacy notice; separate permission is needed for later uses. */
export default function LetMeIn({ ready, onChange }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const leave = async () => {
    setSigningOut(true);
    try {
      await logout(false);
      navigate("/", { replace: true });
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="max-w-[65ch] text-[15px] leading-relaxed text-muted-foreground">
        By continuing, you acknowledge that you've reviewed how Entrepalooza works and how your information is handled. We'll ask separately before using your words, recording anything, or following up.
      </p>
      {ready ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[16px] font-medium text-primary-foreground">
            <Check className="h-5 w-5" aria-hidden="true" />
            Acknowledged
          </span>
          <button type="button" onClick={() => onChange(false)} className="text-[14px] text-muted-foreground underline underline-offset-2">
            Undo
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => onChange(true)} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-[16px] font-semibold text-primary-foreground transition hover:opacity-90">
          I understand — Let's begin
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
      <div>
        <button type="button" onClick={leave} disabled={signingOut} className="text-[15px] text-muted-foreground underline underline-offset-4 disabled:opacity-50">
          {signingOut ? "Signing out…" : "Not right now — Sign out"}
        </button>
      </div>
    </div>
  );
}
