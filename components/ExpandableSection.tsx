"use client";

import { useId, useState, type ReactNode } from "react";

// "Read more" que se despliega en el mismo lugar. El contenido se arma en el
// servidor y llega como children, así al navegador sólo viaja el botón y el
// texto completo queda en el documento para los buscadores. Misma animación
// grid-rows 0fr→1fr que el acordeón de preguntas, para que la página tenga un
// solo lenguaje al desplegar.
//
// Con `lessLabel` el botón se queda y cierra de vuelta; sin él se comporta como
// siempre, de una sola vía: se abre y el enlace desaparece.
export default function ExpandableSection({
  label = "Read more",
  lessLabel,
  children,
}: {
  label?: string;
  lessLabel?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  // Antes el id era fijo, así que dos desplegables en la misma página quedaban
  // con el mismo identificador y el aria-controls apuntaba a cualquiera. La
  // página About tiene justamente dos.
  const id = useId();
  const doble = !!lessLabel;

  return (
    <div>
      <div
        id={id}
        aria-hidden={!open}
        className={`grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className={`overflow-hidden transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`}>
          {children}
        </div>
      </div>

      {open && !doble ? null : (
        <button
          type="button"
          onClick={() => setOpen((v) => (doble ? !v : true))}
          aria-expanded={open}
          aria-controls={id}
          className="group link-underline mt-7 inline-flex items-center gap-2 text-sm font-medium text-gold-ink"
        >
          {open && doble ? lessLabel : label}
          <span
            aria-hidden
            className={`transition-transform duration-300 group-hover:translate-y-0.5 ${
              open && doble ? "rotate-180" : ""
            }`}
          >
            &darr;
          </span>
        </button>
      )}
    </div>
  );
}
