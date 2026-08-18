import { APIError, type CollectionConfig } from "payload";

// The platform rejects request bodies over 4.5 MB with a bare "Request Entity
// Too Large", which reads like the site is broken. Stop it earlier, with an
// explanation and a way out.
const MAX_UPLOAD_MB = 3;
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Image", plural: "Images" },
  access: { read: () => true },
  admin: {
    group: "Content",
    description:
      `All the site's photos. Upload an image and use it on any page. ` +
      `Best results: at least 2400px wide and under ${MAX_UPLOAD_MB} MB. ` +
      `If a photo is heavier, shrink it at tinypng.com first — it keeps the quality and cuts the weight. ` +
      `Photos only: a video is never uploaded here. To show a video, open the page, find a "Feature band (big media)" section and paste the Vimeo or YouTube address into its Video link field.`,
  },
  hooks: {
    beforeValidate: [
      ({ req }) => {
        const size = (req as { file?: { size?: number; name?: string } })?.file?.size;
        if (typeof size === "number" && size > MAX_UPLOAD_BYTES) {
          const mb = (size / 1024 / 1024).toFixed(1);
          throw new APIError(
            `This image is ${mb} MB, and the limit is ${MAX_UPLOAD_MB} MB. ` +
              `Compress it at tinypng.com and upload it again — the quality stays the same. ` +
              `Please keep it at least 2400px wide so it stays sharp on large screens.`,
            413
          );
        }
      },
    ],
  },
  upload: {
    // Explícitos y no por default: son las dos herramientas con las que ella
    // decide qué parte de una foto sobrevive al recorte de cada bloque. El punto
    // focal fija el centro; el recorte es el zoom que pedía. PayloadImage lee
    // focalX/focalY y los aplica como object-position.
    focalPoint: true,
    crop: true,
    // Variants are generated once, at upload, and served through srcset by
    // components/PayloadImage — no image CDN and no per-request work.
    // Height stays undefined so every variant keeps the original aspect ratio:
    // nothing is cropped, which the Portrait 4:5 blocks depend on.
    // withoutEnlargement means a small original simply produces fewer variants
    // instead of a blurry upscale.
    formatOptions: { format: "webp", options: { quality: 80 } },
    imageSizes: [
      { name: "thumbnail", width: 480, height: undefined, withoutEnlargement: true, formatOptions: { format: "webp", options: { quality: 80 } } },
      { name: "card", width: 960, height: undefined, withoutEnlargement: true, formatOptions: { format: "webp", options: { quality: 80 } } },
      { name: "wide", width: 1600, height: undefined, withoutEnlargement: true, formatOptions: { format: "webp", options: { quality: 80 } } },
      { name: "hero", width: 2400, height: undefined, withoutEnlargement: true, formatOptions: { format: "webp", options: { quality: 80 } } },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      label: "Alt text",
      admin: { description: "Describe the image in a few words (for accessibility and SEO). E.g. 'Sabine guiding a breathwork session'." },
    },
  ],
};
