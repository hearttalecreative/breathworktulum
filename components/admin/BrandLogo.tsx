import React from "react";

// Login-screen logo for the Payload admin. The auth templates (login / forgot /
// create-first-user) always sit on the dark forest gradient set in custom.scss,
// regardless of the light/dark theme toggle — so the white wordmark is always
// the correct lockup here. Asset in /public/brand.
export default function BrandLogo() {
  return (
    <div className="btw-login-logo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo-white.svg" alt="Breathwork Tulum" />
    </div>
  );
}
