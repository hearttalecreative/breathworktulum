import type { CollectionConfig } from "payload";

const BRAND_GOLD = "#a59449";
const BRAND_INK = "#272525";

// Absolute origin for links inside emails (the reset link must not be relative).
const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Usuario", plural: "Usuarios" },
  auth: {
    // Branded password-reset email. Delivery needs SMTP creds (see payload.config);
    // without them Payload logs this HTML to the console so the link is still usable.
    forgotPassword: {
      generateEmailSubject: () => "Restablece tu contraseña · Breathwork Tulum",
      generateEmailHTML: (args) => {
        const token = (args as { token?: string })?.token ?? "";
        const resetURL = `${serverURL}/admin/reset/${token}`;
        return `
<div style="margin:0;padding:32px 0;background:#faf7f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${BRAND_INK}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #ece7dc">
    <tr><td style="padding:36px 40px 8px;text-align:center">
      <img src="${serverURL}/brand/logo-color.svg" alt="Breathwork Tulum" width="220" style="width:220px;max-width:80%;height:auto" />
    </td></tr>
    <tr><td style="padding:12px 40px 0">
      <h1 style="margin:0 0 12px;font-size:20px;font-weight:600;color:${BRAND_INK}">Restablece tu contraseña</h1>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#5c5850">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta de administración.
        Haz clic en el botón para elegir una nueva. Si no fuiste tú, ignora este mensaje.
      </p>
      <p style="margin:0 0 28px;text-align:center">
        <a href="${resetURL}" style="display:inline-block;padding:13px 28px;background:${BRAND_GOLD};color:#ffffff;font-size:15px;font-weight:600;text-decoration:none">Elegir nueva contraseña</a>
      </p>
      <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#8a857b">
        O copia esta dirección en tu navegador:<br />
        <a href="${resetURL}" style="color:${BRAND_GOLD};word-break:break-all">${resetURL}</a>
      </p>
    </td></tr>
    <tr><td style="padding:24px 40px 36px;border-top:1px solid #ece7dc">
      <p style="margin:0;font-size:12px;color:#a9a49a">Breathwork Tulum · Breathe. Heal. Transform.®</p>
    </td></tr>
  </table>
</div>`.trim();
      },
    },
  },
  admin: {
    useAsTitle: "email",
    group: "Ajustes",
    description: "Quién puede entrar a administrar el sitio.",
  },
  fields: [
    { name: "name", type: "text", label: "Nombre" },
  ],
};
