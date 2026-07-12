"use client";

import React from "react";

// Wraps the whole admin (admin.components.providers), so the Hearttale Creative
// credit sits at the bottom of every admin screen — login and dashboard alike —
// mirroring the public site footer. Styling in custom.scss (.btw-admin-credit),
// theme-aware so it reads on both the dark auth gradient and the light panel.
export default function AdminCredit({ children }: { children?: React.ReactNode }) {
  return (
    <>
      {children}
      <footer className="btw-admin-credit">
        <span>
          Developed with{" "}
          <span className="btw-admin-credit__heart" aria-hidden>
            ♥
          </span>
          <span className="sr-only">love</span> by{" "}
          <a href="https://www.hearttalecreative.com/" target="_blank" rel="noopener noreferrer">
            Hearttale Creative
          </a>
        </span>
      </footer>
    </>
  );
}
