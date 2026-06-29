// Central visual of the method: Breathe. Heal. Transform.®
// Three phases as concentric breathing circles, not a metaphor — the actual arc.

const PHASES = [
  {
    word: "Breathe",
    line: "The body enters the work. The technique opens what's been held.",
    r: 30,
  },
  {
    word: "Heal",
    line: "The emotional layer surfaces. What was stored has room to move.",
    r: 44,
  },
  {
    word: "Transform",
    line: "Integration. What shifted gets language, so the change holds.",
    r: 58,
  },
];

export default function ThreePhases() {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-[auto_1fr]">
      {/* Concentric rings */}
      <svg
        viewBox="0 0 140 140"
        className="mx-auto h-44 w-44 lg:h-56 lg:w-56"
        role="img"
        aria-label="Three phase method: Breathe, Heal, Transform"
      >
        <circle cx="70" cy="70" r="58" fill="none" stroke="var(--color-gold-soft)" strokeOpacity="0.35" strokeWidth="1" />
        <circle cx="70" cy="70" r="44" fill="none" stroke="var(--color-gold-soft)" strokeOpacity="0.55" strokeWidth="1" />
        <circle cx="70" cy="70" r="30" fill="none" stroke="var(--color-gold-soft)" strokeOpacity="0.85" strokeWidth="1" />
        <circle cx="70" cy="70" r="3" fill="var(--color-gold-soft)" />
      </svg>

      {/* Phase legend */}
      <ol className="space-y-7">
        {PHASES.map((p, i) => (
          <li key={p.word} className="flex gap-5">
            <span className="font-serif text-2xl text-gold-ink/80 tabular-nums">
              0{i + 1}
            </span>
            <div>
              <h3 className="font-serif text-2xl text-ink">{p.word}</h3>
              <p className="mt-1 text-muted">{p.line}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
