import React from "react";

// Sits above the newsletter list in the panel. The link downloads the whole
// list as a CSV, which every email platform (Brevo, Mailchimp, MailerLite,
// Flodesk) imports directly.
export default function ExportSubscribers() {
  return (
    <p style={{ margin: "0 0 1.25rem" }}>
      <a
        href="/api/export/subscribers/"
        style={{
          display: "inline-block",
          padding: "0.5rem 1rem",
          border: "1px solid var(--theme-elevation-250)",
          borderRadius: 4,
          textDecoration: "none",
          color: "inherit",
          fontSize: "0.9rem",
        }}
      >
        Download the list (CSV)
      </a>
      <span style={{ marginLeft: "0.75rem", opacity: 0.7, fontSize: "0.85rem" }}>
        Opens in Excel or Google Sheets, and imports into any email platform.
      </span>
    </p>
  );
}
