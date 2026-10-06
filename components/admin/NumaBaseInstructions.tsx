import React from "react";
import { NUMA_IDENTITY, NUMA_RULES } from "@/lib/numa-prompt";

// Read-only view of the rules NUMA is built with, shown above the two fields
// the admin can write in, so she knows what her additions are layered on.
export default function NumaBaseInstructions() {
  const box: React.CSSProperties = {
    border: "1px solid var(--theme-elevation-150)",
    borderRadius: 4,
    padding: "1rem 1.25rem",
    margin: "0 0 1.5rem",
    fontSize: "0.9rem",
    lineHeight: 1.5,
    background: "var(--theme-elevation-50)",
  };
  return (
    <div style={box}>
      <p style={{ margin: "0 0 0.25rem", fontWeight: 600 }}>What already guides NUMA</p>
      <p style={{ margin: "0 0 0.75rem", opacity: 0.8 }}>
        These rules are built in and cannot be edited here. NUMA reads every published page of the site
        (sections hidden on a page are left out). Whatever you write in &quot;Additional instructions&quot;
        is added after these rules, and &quot;Additional information&quot; is added to the site content it
        reads. Prices in a reply are checked against the site text before the visitor sees them: an amount
        that isn&apos;t written anywhere on the site is never sent.
      </p>
      <details>
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>Show the built-in rules</summary>
        <p style={{ margin: "0.75rem 0", opacity: 0.85 }}>{NUMA_IDENTITY}</p>
        {NUMA_RULES.map((s) => (
          <div key={s.title}>
            <p style={{ margin: "0.75rem 0 0.25rem", fontWeight: 600 }}>{s.title}</p>
            <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
              {s.rules.map((r, i) => (
                <li key={i} style={{ margin: "0 0 0.3rem" }}>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </details>
    </div>
  );
}
