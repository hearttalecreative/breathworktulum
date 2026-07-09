"use client";
import { useEffect, useMemo, useState } from "react";
import { FieldLabel, SelectInput, useField } from "@payloadcms/ui";
import type { TextFieldClientComponent } from "payload";

// Admin field for chatSettings.model: a dropdown fed by the live OpenRouter
// catalog (via /api/chat/models) instead of a static select, so new models —
// and which ones are free — stay current without a deploy.
type ChatModel = { value: string; label: string; free: boolean; context: number };

const ModelSelect: TextFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path });
  const [models, setModels] = useState<ChatModel[] | null>(null);

  useEffect(() => {
    let live = true;
    fetch("/api/chat/models", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (live) setModels(d.models ?? []);
      })
      .catch(() => {
        if (live) setModels([]);
      });
    return () => {
      live = false;
    };
  }, []);

  const options = useMemo(() => {
    const opts = (models ?? []).map((m) => ({
      label: m.free ? `GRATIS · ${m.label}` : m.label,
      value: m.value,
    }));
    // Keep the saved value selectable even if it left the live catalog.
    if (value && !opts.some((o) => o.value === value)) {
      opts.unshift({ label: value, value });
    }
    return opts;
  }, [models, value]);

  return (
    <div className="field-type">
      <FieldLabel label={field.label} path={path} />
      <SelectInput
        path={path}
        name={path}
        options={options}
        value={value}
        isClearable={false}
        onChange={(opt) => {
          const single = Array.isArray(opt) ? opt[0] : opt;
          if (single && typeof single.value === "string") setValue(single.value);
        }}
      />
      <div className="field-description">
        {models === null
          ? "Cargando modelos desde OpenRouter…"
          : "Los modelos GRATIS aparecen primero y no consumen crédito de OpenRouter."}
      </div>
    </div>
  );
};

export default ModelSelect;
