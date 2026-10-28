import { useEffect, useRef, useState } from "react";

export function AnswerForm({
  disabled,
  label = "Provincia",
  extraKeys = [],
  lang,
  onSubmit,
}: {
  disabled?: boolean;
  label?: string;
  extraKeys?: readonly string[];
  lang?: string;
  onSubmit: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  const field = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!disabled) field.current?.focus();
  }, [disabled]);

  function insert(char: string) {
    const el = field.current;
    const focused = document.activeElement === el;
    const start = focused && el ? (el.selectionStart ?? value.length) : value.length;
    const end = focused && el ? (el.selectionEnd ?? value.length) : value.length;
    const next = value.slice(0, start) + char + value.slice(end);
    const caret = start + char.length;
    setValue(next);
    window.setTimeout(() => {
      el?.focus();
      el?.setSelectionRange(caret, caret);
    }, 0);
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const next = value.trim();
        if (!next || disabled) return;
        onSubmit(next);
        setValue("");
      }}
    >
      <label>
        {label}
        <input
          ref={field}
          value={value}
          disabled={disabled}
          lang={lang}
          inputMode="text"
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="go"
          onChange={(event) => setValue(event.target.value)}
          onFocus={(event) => {
            const target = event.currentTarget;
            window.setTimeout(() => target.scrollIntoView?.({ block: "center", inline: "nearest" }), 350);
          }}
        />
      </label>
      {extraKeys.length > 0 ? (
        <div className="extra-keys">
          {extraKeys.map((char) => (
            <button
              key={char}
              type="button"
              className="key-letter"
              disabled={disabled}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => insert(char)}
            >
              {char}
            </button>
          ))}
        </div>
      ) : null}
      <button className="primary" type="submit" disabled={disabled || value.trim().length === 0}>
        Comprobar
      </button>
    </form>
  );
}
