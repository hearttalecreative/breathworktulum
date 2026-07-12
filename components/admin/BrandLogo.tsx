import React from "react";

// Login-screen logo for the Payload admin. The color wordmark has dark text that
// disappears on the dark admin theme, so swap to the white wordmark when Payload
// sets html[data-theme="dark"]. Assets live in /public/brand.
const styles = `
.btw-login-logo{display:flex;justify-content:center;padding:4px 0}
.btw-login-logo img{width:100%;max-width:300px;height:auto}
.btw-login-logo .btw-logo-dark{display:none}
html[data-theme="dark"] .btw-login-logo .btw-logo-light{display:none}
html[data-theme="dark"] .btw-login-logo .btw-logo-dark{display:block}
`;

export default function BrandLogo() {
  return (
    <div className="btw-login-logo">
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo-color.svg" alt="Breathwork Tulum" className="btw-logo-light" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo-white.svg" alt="Breathwork Tulum" className="btw-logo-dark" />
    </div>
  );
}
