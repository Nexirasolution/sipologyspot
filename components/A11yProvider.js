"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

const A11yContext = createContext({ announce: () => {} });

/** Call from any client component: const announce = useAnnounce(); announce("Added to cart"); */
export const useAnnounce = () => useContext(A11yContext).announce;

export default function A11yProvider({ children }) {
  const [polite, setPolite] = useState("");
  const [assertive, setAssertive] = useState("");

  // Clear then set, so the same message twice in a row is still read out
  const announce = useCallback((message, priority = "polite") => {
    const set = priority === "assertive" ? setAssertive : setPolite;
    set("");
    setTimeout(() => set(message), 60);
  }, []);

  const value = useMemo(() => ({ announce }), [announce]);

  return (
    <A11yContext.Provider value={value}>
      {children}
      {/* Always present in the DOM so screen readers register them early */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {polite}
      </div>
      <div className="sr-only" role="alert" aria-live="assertive" aria-atomic="true">
        {assertive}
      </div>
    </A11yContext.Provider>
  );
}