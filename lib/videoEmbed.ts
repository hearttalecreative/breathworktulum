// Convierte un enlace de Vimeo o YouTube en la URL de reproductor que va dentro
// de un <iframe>. Es el reproductor normal, con controles y sonido: distinto
// del embed de fondo del hero, que va mudo y en bucle.
//
// Devuelve "" si el enlace no se reconoce, para que quien llama no pinte un
// marco vacío.
export function toArticleEmbed(url: string): string {
  const u = (url || "").trim();

  // vimeo.com/123456789 y también vimeo.com/123456789/abc123 (enlaces no
  // listados, donde la segunda parte es la clave de acceso).
  const vimeo = u.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([0-9a-z]+))?/i);
  if (vimeo) {
    const h = vimeo[2] ? `&h=${vimeo[2]}` : "";
    return `https://player.vimeo.com/video/${vimeo[1]}?dnt=1${h}`;
  }

  // youtu.be/ID, youtube.com/watch?v=ID, /embed/ID y /shorts/ID.
  const yt = u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/i);
  // nocookie: no deja rastro hasta que la persona le da play, que es lo que
  // corresponde con el aviso de cookies del sitio.
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0&modestbranding=1`;

  return "";
}
