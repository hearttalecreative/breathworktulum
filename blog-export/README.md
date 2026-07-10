# Blog export — breathworktulum.com

These are the **34 blog posts** scraped from the old GoDaddy-hosted blog at
`breathworktulum.com/blog` (source URLs `/blog/f/<slug>`), captured for the
migration to the new site.

## Files

- `<slug>.md` — one file per post (34 total). Each has YAML front matter:
  - `title` — post title (un-HTML-escaped)
  - `description` — meta description
  - `source_url` — original live URL
  - `old_path` — original path, `/blog/f/<original-slug>`
  - `new_path` — target path on the new site, `/resources/blog/<slug>/`

  The body below the front matter is the post's markdown, verbatim from the scrape.

  Slugs are derived from the original URL slug: URL-decoded, with `™`/`"` dropped,
  en/em dashes turned into `-`, lowercased, non `[a-z0-9-]` replaced with `-`,
  repeats collapsed, and edges trimmed. Duplicate collisions get a numeric suffix
  (`-2`, `-3`, …).

- `_redirects.csv` — maps `old_path` → `new_path` (plus `title`) for the **301
  redirects** to configure when the domain moves to the new site, so old blog URLs
  keep resolving. One row per post; header `old_path,new_path,title`.
