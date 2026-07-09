// One-off: create the first admin user. Reads creds from env so they never
// land in the file or git. Run:
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_NAME=Sabine npx tsx scripts/create-user.ts
// Loads .env.local BEFORE importing the Payload config (which reads DATABASE_URI
// at module load), so the import is dynamic and happens after env is set.
process.loadEnvFile(".env.local");

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
// "adminName" (not "name") so the file counts as a module for top-level await
// and avoids colliding with the global `name` binding.
const adminName = process.env.ADMIN_NAME || "Sabine";

if (!email || !password) {
  console.error("Missing ADMIN_EMAIL or ADMIN_PASSWORD");
  process.exit(1);
}

const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config");

const payload = await getPayload({ config });

const existing = await payload.find({
  collection: "users",
  where: { email: { equals: email } },
  limit: 1,
});

if (existing.docs.length) {
  console.log(`User already exists: ${email} (no change).`);
} else {
  await payload.create({ collection: "users", data: { email, password, name: adminName } });
  console.log(`Created admin user: ${adminName} <${email}>`);
}

process.exit(0);

export {};
