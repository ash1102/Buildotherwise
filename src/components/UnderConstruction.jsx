import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";

/**
 * Shows a short "still building" notice once per sign-in.
 * Continue takes the person to the page they were heading to.
 */
export default function UnderConstructionGate({ children }) {
  const { user, isAuthenticated } = useAuth();
  const key = user?.id ? `uc-seen-${user.id}` : null;
  const [dismissed, setDismissed] = useState(false);

  const alreadySeen = key ? sessionStorage.getItem(key) === "1" : true;

  if (!isAuthenticated || alreadySeen || dismissed) return children;

  const handleContinue = () => {
    if (key) sessionStorage.setItem(key, "1");
    setDismissed(true);
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16 text-center">
      <div className="max-w-md">
        <h1 className="mb-4 text-3xl font-semibold">Still under construction</h1>
        <p className="mb-8 text-[16px] leading-relaxed text-muted-foreground">
          We're still building, but you can still check it out.
        </p>
        <Button onClick={handleContinue}>Continue</Button>
      </div>
    </div>
  );
}
