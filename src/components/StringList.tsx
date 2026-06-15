"use client";

// Dinamik metin listesi (yasak kelimeler, imza ifadeler, rakamlar vb.).
export function StringList({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const update = (i: number, v: string) => {
    const next = [...values];
    next[i] = v;
    onChange(next);
  };
  const remove = (i: number) => {
    const next = values.filter((_, idx) => idx !== i);
    onChange(next.length ? next : [""]);
  };
  return (
    <div className="space-y-2">
      {values.map((v, i) => (
        <div key={i} className="flex gap-2">
          <input
            className="input"
            value={v}
            placeholder={placeholder}
            onChange={(e) => update(i, e.target.value)}
          />
          <button
            type="button"
            className="btn-ghost px-3"
            onClick={() => remove(i)}
            aria-label="Sil"
          >
            ×
          </button>
        </div>
      ))}
      <button type="button" className="btn-ghost" onClick={() => onChange([...values, ""])}>
        + Ekle
      </button>
    </div>
  );
}
