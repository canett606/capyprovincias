import { useEffect, useRef, useState } from "react";

export function AnswerForm({
  disabled,
  label = "Provincia",
  onSubmit,
}: {
  disabled?: boolean;
  label?: string;
  onSubmit: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  const field = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!disabled) field.current?.focus();
  }, [disabled]);

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
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="go"
          onChange={(event) => setValue(event.target.value)}
          onFocus={(event) => event.currentTarget.scrollIntoView?.({ block: "center" })}
        />
      </label>
      <button className="primary" type="submit" disabled={disabled || value.trim().length === 0}>
        Comprobar
      </button>
    </form>
  );
}
