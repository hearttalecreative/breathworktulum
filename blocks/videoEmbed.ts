import type { Block } from "payload";

// Video dentro de un artículo del blog. Vive en el editor de texto, no en el
// armado de la página, así que se inserta en el punto exacto donde ella lo
// quiere leer.
export const videoEmbed: Block = {
  slug: "videoEmbed",
  labels: { singular: "Video", plural: "Videos" },
  fields: [
    {
      name: "url",
      type: "text",
      required: true,
      label: "Video link",
      admin: {
        description:
          "Paste the address of a Vimeo or YouTube video. Nothing to upload: the video stays where it is and the article plays it.",
      },
    },
    {
      name: "aspect",
      type: "select",
      defaultValue: "landscape",
      label: "Shape",
      options: [
        { label: "Landscape (filmed sideways)", value: "landscape" },
        { label: "Vertical (filmed upright, like Instagram)", value: "vertical" },
        { label: "Square", value: "square" },
      ],
      admin: {
        description:
          "Pick the shape the video was filmed in, so it fills the frame instead of sitting between dark bands.",
      },
    },
    { name: "caption", type: "text", label: "Caption (optional)" },
  ],
};
