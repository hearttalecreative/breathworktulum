import React from "react";

// Nav/sidebar mark for the Payload admin. The gold wave reads on both the light
// and dark admin themes, so no theme swap needed. Asset in /public/brand.
export default function BrandIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/icon-mark.svg"
      alt="Breathwork Tulum"
      style={{ width: "100%", maxWidth: 28, height: "auto" }}
    />
  );
}
